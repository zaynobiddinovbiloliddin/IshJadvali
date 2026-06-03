import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { readFile } from "node:fs/promises";
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
  ShadingType
} from "docx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const DB_FILE = join(PROJECT_ROOT, "data", "mock-db.json");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const UZ_DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

function getTodayName() {
  return UZ_DAYS[new Date().getDay()];
}

function formatUzDate(date) {
  return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()} yil`;
}

async function readDb() {
  try {
    const raw = await readFile(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { employees: [], schedules: {} };
  }
}

// ─── JSON backup ─────────────────────────────────────────────

async function createBackup() {
  const date = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const fileName = `backup-${date}.json`;
  const filePath = join("/tmp", fileName);

  if (!existsSync(DB_FILE)) throw new Error("Ma'lumotlar bazasi fayli topilmadi");

  const raw = await readFile(DB_FILE, "utf8");
  const dbData = JSON.parse(raw);

  const summary = {
    backupDate: new Date().toISOString(),
    employees: dbData.employees?.length || 0,
    schedules: Object.keys(dbData.schedules || {}).length,
    contacts: dbData.contacts?.length || 0,
    attendance: dbData.attendance?.length || 0,
    data: dbData
  };

  writeFileSync(filePath, JSON.stringify(summary, null, 2));
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

async function createFilmingScheduleWord() {
  const dbData = await readDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);
  const todayName = getTodayName();

  // Find the schedule that contains today
  const schedules = Object.values(dbData.schedules || {});
  const validSchedules = schedules.filter((s) => {
    const weekStart = s.week?.start;
    return weekStart && weekStart <= todayKey;
  });
  validSchedules.sort((a, b) => b.week.start.localeCompare(a.week.start));
  const saved = validSchedules[0] || null;

  const employees = Array.isArray(dbData.employees) ? dbData.employees : [];

  const rows = [];

  if (saved?.groups) {
    const todayGroups = saved.groups.filter((g) => g.day === todayName);

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

  if (!rows.length) {
    const names = employees.slice(0, 12).map((e) => e.name);
    rows.push(
      { camera: "3 Studiya", time: "9:00-22:00", operators: names.slice(0, 4).join("\n"), topic: "Studiyada tasvirga olish jarayoni", reporters: "" },
      { camera: "35 TJK", time: "9:00-18:00", operators: names.slice(4, 8).join("\n"), topic: "TJK guruhi ishi", reporters: "" },
      { camera: "3 Tongi", time: "9:00-18:00", operators: names.slice(8, 12).join("\n"), topic: "Tongi dastur", reporters: "" }
    );
  }

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

// ─── Send backup + schedule ──────────────────────────────────

export async function sendBackupAndSchedule() {
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
    const backup = await createBackup();
    backupPath = backup.filePath;

    const dbData = await readDb();
    const empCount = dbData.employees?.length || 0;
    const schedCount = Object.keys(dbData.schedules || {}).length;

    await bot.sendDocument(CHAT_ID, backup.filePath, {
      caption: `📦 *Backup* — ${now}\n👥 Xodimlar: ${empCount} ta\n📅 Jadvallar: ${schedCount} ta\nBarcha ma'lumotlar JSON formatida`,
      parse_mode: "Markdown"
    });

    const word = await createFilmingScheduleWord();
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

export function startTelegramBot() {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("Telegram bot: TOKEN yoki CHAT_ID yo'q, o'tkazib yuborildi");
    return;
  }

  console.log("🤖 Telegram bot ishga tushdi (har kuni 08:00 va 20:00 da yuboradi)");

  // 5 soniyadan keyin birinchi marta yuborish
  setTimeout(() => sendBackupAndSchedule(), 5000);

  // Har kuni ertalab 08:00 da
  cron.schedule("0 8 * * *", () => sendBackupAndSchedule(), { timezone: "Asia/Tashkent" });

  // Har kuni kechqurun 20:00 da
  cron.schedule("0 20 * * *", () => sendBackupAndSchedule(), { timezone: "Asia/Tashkent" });
}
