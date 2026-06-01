import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  ShadingType,
  BorderStyle
} from "docx";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.log("Telegram bot: TOKEN yoki CHAT_ID yo'q, o'tkazib yuborildi");
  process.exit(0);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// ─── Day helpers ─────────────────────────────────────────────

const UZ_DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

function getTodayName() {
  return UZ_DAYS[new Date().getDay()];
}

function formatUzDate(date) {
  return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()} yil`;
}

// ─── PostgreSQL backup ───────────────────────────────────────

async function createBackup() {
  const date = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const fileName = `backup-${date}.sql`;
  const filePath = join("/tmp", fileName);

  const dbUrl = process.env.DATABASE_URL || "";
  const match = dbUrl.match(/postgresql:\/\/([^:@]+)(?::([^@]*))?@([^:/]+)(?::(\d+))?\/(.+)/);

  if (!match) throw new Error("DATABASE_URL format noto'g'ri");

  const [, user, password = "", host, port = "5432", dbname] = match;

  const pgDump = existsSync("/usr/bin/pg_dump") ? "/usr/bin/pg_dump" : "pg_dump";
  const env = { ...process.env };
  if (password) env.PGPASSWORD = password;

  execSync(
    `${pgDump} -U ${user} -h ${host} -p ${port} ${dbname} > ${filePath}`,
    { stdio: ["ignore", "pipe", "pipe"], env }
  );

  return { filePath, fileName };
}

// ─── Word document helpers ───────────────────────────────────

const HEADER_GRAY = "D9D9D9";
const LIGHT_BLUE = "BDD7EE";
const WHITE = "FFFFFF";
const RED_COLOR = "CC0000";

function makeCell(text, fillColor, isHeader = false, columnSpan = 1) {
  const lines = String(text || "").split("\n");
  const children = lines.map(
    (line, i) =>
      new Paragraph({
        spacing: { before: i === 0 ? 0 : 40 },
        children: [
          new TextRun({
            text: line,
            bold: isHeader,
            size: isHeader ? 20 : 19,
            font: "Times New Roman"
          })
        ]
      })
  );

  return new TableCell({
    columnSpan,
    shading: { fill: fillColor, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children
  });
}

function makeEquipmentRow(equipment = "HD jamlanmasi, mikrofon, chiroq, avtotransport") {
  return new TableRow({
    children: [
      makeCell(`Kerakli jihoz va texnika:    ${equipment}`, LIGHT_BLUE, false, 5)
    ]
  });
}

// ─── Build Word document ─────────────────────────────────────

async function createFilmingScheduleWord(prisma) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);
  const todayName = getTodayName();

  // Find the week that contains today
  const saved = await prisma.schedule.findFirst({
    where: { weekStart: { lte: todayKey } },
    orderBy: { weekStart: "desc" }
  }).catch(() => null);

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" }
  });

  // Build schedule rows
  const rows = [];

  if (saved?.data?.groups) {
    const todayGroups = saved.data.groups.filter((g) => g.day === todayName);

    for (const group of todayGroups) {
      const workingPeople = group.people.filter(
        (p) => !["rest", "vacation", "otpiska"].includes(p.statusType)
      );
      const operatorList = workingPeople
        .filter((p) => !p.role?.toLowerCase().includes("muxbir"))
        .map((p) => p.name)
        .join("\n");
      const reporterList = workingPeople
        .filter((p) => p.role?.toLowerCase().includes("muxbir"))
        .map((p) => p.name)
        .join("\n");

      if (workingPeople.length) {
        rows.push({
          camera: group.meta || "",
          time: workingPeople[0]?.time || "09:00-18:00",
          operators: operatorList || workingPeople.map((p) => p.name).join("\n"),
          topic: group.title || "Studiyada ish",
          reporters: reporterList || ""
        });
      }
    }
  }

  // Fallback: just show all employees split by studio
  if (!rows.length) {
    const operatorNames = employees.slice(0, 12).map((e) => e.name).join("\n");
    const reporterNames = employees.slice(12, 20).map((e) => e.name).join("\n");
    rows.push(
      { camera: "3 Studiya", time: "9:00-22:00", operators: operatorNames.split("\n").slice(0, 4).join("\n"), topic: "Studiyada tasvirga olish jarayoni", reporters: reporterNames.split("\n").slice(0, 2).join("\n") },
      { camera: "35 TJK", time: "9:00-18:00", operators: operatorNames.split("\n").slice(4, 8).join("\n"), topic: "TJK guruhi ishi", reporters: "" },
      { camera: "3 Tongi", time: "9:00-18:00", operators: operatorNames.split("\n").slice(8, 12).join("\n"), topic: "Tongi dastur", reporters: reporterNames.split("\n").slice(2).join("\n") }
    );
  }

  // ─── Document structure ───────────────────────────────────

  const titleLeft = new Paragraph({
    children: [
      new TextRun({ text: "Tasvirga olish jadvali", bold: true, size: 24, font: "Times New Roman" }),
      new TextRun({ text: "\n" + formatUzDate(today), size: 22, font: "Times New Roman" })
    ]
  });

  const titleRight = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({ text: '"TASDIQLAYMAN"', bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({ text: '\n"O\'zbekiston 24" ijodiy', size: 22, font: "Times New Roman" }),
      new TextRun({ text: "\nbirlashmasi\" DM direktori", size: 22, font: "Times New Roman" }),
      new TextRun({ text: "\n__________M. Safarov", size: 22, font: "Times New Roman" })
    ]
  });

  const warningPara = new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({
        text: "Muhim eslatma! Tasvirga olish ishlari yakunlanishi bilan, material tayyorlashga kirishish shart.",
        color: RED_COLOR,
        bold: true,
        size: 20,
        font: "Times New Roman"
      })
    ]
  });

  // Table header
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      makeCell("Kamera\nraqami", HEADER_GRAY, true),
      makeCell("Chiqish\nvaqti", HEADER_GRAY, true),
      makeCell("Operator va\ntexnik xodim", HEADER_GRAY, true),
      makeCell("Tadbir o'tkazilish joyi va tadbir mavzusi", HEADER_GRAY, true),
      makeCell("Muxbirlar", HEADER_GRAY, true)
    ]
  });

  // Data rows with equipment rows
  const tableRows = [headerRow];
  for (const row of rows) {
    tableRows.push(makeEquipmentRow());
    tableRows.push(
      new TableRow({
        children: [
          makeCell(row.camera, WHITE),
          makeCell(row.time, WHITE),
          makeCell(row.operators, WHITE),
          makeCell(row.topic, WHITE),
          makeCell(row.reporters, WHITE)
        ]
      })
    );
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1500, 1200, 2000, 3300, 2000],
    rows: tableRows
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }
        },
        children: [
          titleLeft,
          titleRight,
          new Paragraph({ children: [] }),
          warningPara,
          new Paragraph({ children: [] }),
          table
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const fileName = `tasvirga-olish-jadvali-${todayKey}.docx`;
  const filePath = join("/tmp", fileName);
  writeFileSync(filePath, buffer);
  return { filePath, fileName };
}

// ─── Send both files ─────────────────────────────────────────

export async function sendBackupAndSchedule(prisma) {
  const now = new Date().toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  let backupPath = null;
  let wordPath = null;

  try {
    // 1. PostgreSQL backup
    const backup = await createBackup();
    backupPath = backup.filePath;
    await bot.sendDocument(CHAT_ID, backup.filePath, {
      caption: `📦 *Backup* — ${now}\nPostgreSQL to'liq ma'lumotlar bazasi`,
      parse_mode: "Markdown"
    });

    // 2. Word schedule
    const word = await createFilmingScheduleWord(prisma);
    wordPath = word.filePath;
    await bot.sendDocument(CHAT_ID, word.filePath, {
      caption: `📋 *Tasvirga olish jadvali* — ${now}\nBugungi kunlik jadval`,
      parse_mode: "Markdown"
    });

    console.log(`✅ Telegram: backup + jadval yuborildi — ${now}`);
  } catch (err) {
    console.error("❌ Telegram xato:", err.message);
    try {
      await bot.sendMessage(CHAT_ID, `❌ Xato yuz berdi: ${err.message}`);
    } catch {}
  } finally {
    if (backupPath && existsSync(backupPath)) unlinkSync(backupPath);
    if (wordPath && existsSync(wordPath)) unlinkSync(wordPath);
  }
}

// ─── Start cron ───────────────────────────────────────────────

export function startTelegramBot(prisma) {
  console.log("🤖 Telegram bot ishga tushdi (har 30 daqiqada yuboradi)");

  // Birinchi yuborishni 5 soniyadan keyin bajarish (server tayyor bo'lsin)
  setTimeout(() => sendBackupAndSchedule(prisma), 5000);

  // Har 30 daqiqada
  cron.schedule("*/30 * * * *", () => {
    sendBackupAndSchedule(prisma);
  });
}
