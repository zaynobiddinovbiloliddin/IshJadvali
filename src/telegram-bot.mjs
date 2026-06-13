import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
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

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot = null;

// username (lowercase, no @) → numeric chat_id string
const USERS_FILE = join("data", "telegram-users.json");
function loadUsers() {
  try { return JSON.parse(readFileSync(USERS_FILE, "utf8")); } catch { return {}; }
}
function saveUsers(map) {
  try { writeFileSync(USERS_FILE, JSON.stringify(map, null, 2)); } catch {}
}
const tgUsers = loadUsers();

export function resolveChatId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^-?\d+$/.test(s)) return s;
  const key = s.replace(/^@/, "").toLowerCase();
  return tgUsers[key] ? String(tgUsers[key]) : null;
}

const UZ_DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

function getTodayName() {
  return UZ_DAYS[new Date().getDay()];
}

function formatUzDate(date) {
  return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()} yil`;
}

// Set by startTelegramBot() — returns the live in-memory `db` object that
// server.mjs persists to Postgres, so the bot always sees current data
// instead of a frozen-in-time JSON snapshot.
let getDbRef = null;

function readDb() {
  const data = getDbRef?.();
  return data || { employees: [], schedules: {} };
}

// ─── SQL backup ──────────────────────────────────────────────

function sqlStr(v) {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function createBackup() {
  const now = new Date();
  const dateTag = now.toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const fileName = `backup-${dateTag}.sql`;
  const filePath = join("/tmp", fileName);

  const db = readDb();
  const raw = JSON.stringify(db);
  const ts = now.toISOString();

  const lines = [
    `-- O'zbekiston 24 IshJadvali — SQL Backup`,
    `-- Sana: ${ts}`,
    `-- Xodimlar: ${db.employees?.length || 0}, Kontaktlar: ${db.contacts?.length || 0}`,
    `-- Davomat: ${db.attendance?.length || 0}, Jadvallar: ${Object.keys(db.schedules || {}).length}`,
    `-- ============================================================`,
    ``,
    `BEGIN;`,
    ``
  ];

  // Employees
  lines.push(`-- ── Employee (${db.employees?.length || 0} ta) ─────────────────────`);
  if (db.employees?.length) {
    lines.push(`TRUNCATE TABLE "Employee" CASCADE;`);
    for (const e of db.employees) {
      const portfolio = sqlStr(JSON.stringify(e.portfolio || []));
      const documents = sqlStr(JSON.stringify(e.documents || {}));
      lines.push(
        `INSERT INTO "Employee" (id,name,role,phone,telegram,department,avatar,address,portfolio,documents,"isActive","createdAt","updatedAt") VALUES ` +
        `(${e.id},${sqlStr(e.name)},${sqlStr(e.role)},${sqlStr(e.phone)},${sqlStr(e.telegram)},` +
        `${sqlStr(e.department)},${sqlStr(e.avatar)},${sqlStr(e.address)},${portfolio}::jsonb,${documents}::jsonb,` +
        `${e.isActive !== false},${sqlStr(e.createdAt || ts)},${sqlStr(e.updatedAt || ts)});`
      );
    }
  }
  lines.push(``);

  // Contacts
  lines.push(`-- ── Contact (${db.contacts?.length || 0} ta) ──────────────────────`);
  if (db.contacts?.length) {
    lines.push(`TRUNCATE TABLE "Contact";`);
    for (const c of db.contacts) {
      lines.push(
        `INSERT INTO "Contact" (id,type,name,vehicle,phone,"createdAt") VALUES ` +
        `(${sqlStr(c.id)},${sqlStr(c.type)},${sqlStr(c.name)},${sqlStr(c.vehicle)},${sqlStr(c.phone)},${sqlStr(c.createdAt || ts)});`
      );
    }
  }
  lines.push(``);

  // Attendance
  lines.push(`-- ── Attendance (${db.attendance?.length || 0} ta) ─────────────────`);
  if (db.attendance?.length) {
    lines.push(`TRUNCATE TABLE "Attendance";`);
    for (const a of db.attendance) {
      lines.push(
        `INSERT INTO "Attendance" (id,"employeeId","checkIn","checkOut","createdAt") VALUES ` +
        `(${sqlStr(a.id)},${a.employeeId || 0},${sqlStr(a.checkIn || ts)},${a.checkOut ? sqlStr(a.checkOut) : "NULL"},${sqlStr(a.createdAt || ts)});`
      );
    }
  }
  lines.push(``);

  // DailyStatuses
  const dsList = db.dailyStatuses || [];
  lines.push(`-- ── DailyStatus (${dsList.length} ta) ─────────────────────────`);
  if (dsList.length) {
    lines.push(`TRUNCATE TABLE "DailyStatus";`);
    for (const ds of dsList) {
      lines.push(
        `INSERT INTO "DailyStatus" (id,"employeeId",date,"statusCode","createdAt","updatedAt") VALUES ` +
        `(${sqlStr(ds.id)},${ds.employeeId || 0},${sqlStr(ds.date)},${sqlStr(ds.statusCode)},${sqlStr(ds.createdAt || ts)},${sqlStr(ds.updatedAt || ts)});`
      );
    }
  }
  lines.push(``);

  // Users (parolsiz)
  const users = (db.users || []).map((u) => ({ ...u, password: "***" }));
  lines.push(`-- ── User (${users.length} ta, parol yashirilgan) ───────────────`);
  if (users.length) {
    lines.push(`-- TRUNCATE TABLE "User"; -- xavfsizlik uchun kommentda`);
    for (const u of users) {
      lines.push(
        `-- INSERT INTO "User" (id,username,role,"createdAt") VALUES ` +
        `(${sqlStr(u.id)},${sqlStr(u.username)},${sqlStr(u.role)},${sqlStr(u.createdAt || ts)});`
      );
    }
  }
  lines.push(``);

  lines.push(`COMMIT;`);
  lines.push(``);
  lines.push(`-- Backup hajmi: ${(raw.length / 1024).toFixed(1)} KB  |  ${ts}`);

  writeFileSync(filePath, lines.join("\n"));
  return { filePath, fileName, stats: { employees: db.employees?.length || 0, contacts: db.contacts?.length || 0, attendance: db.attendance?.length || 0, dailyStatuses: dsList.length } };
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
  const dbData = readDb();
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

// ─── Send backup ─────────────────────────────────────────────

export async function sendBackupAndSchedule() {
  const now = new Date().toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  let backupPath = null;

  try {
    const backup = await createBackup();
    backupPath = backup.filePath;
    const { stats } = backup;

    await bot.sendDocument(CHAT_ID, backup.filePath, {
      caption:
        `🗄 *SQL Backup* — ${now}\n` +
        `👥 Xodimlar: ${stats.employees} ta\n` +
        `📋 Davomat: ${stats.attendance} ta\n` +
        `📅 Kunlik status: ${stats.dailyStatuses} ta\n` +
        `📞 Kontaktlar: ${stats.contacts} ta\n` +
        `_Fayl: \`.sql\` — PostgreSQL INSERT statements_`,
      parse_mode: "Markdown"
    });

    console.log(`✅ Telegram SQL backup yuborildi — ${now}`);
  } catch (err) {
    console.error("❌ Telegram xato:", err.message);
    try {
      await bot.sendMessage(CHAT_ID, `❌ Backup xato: ${err.message}`);
    } catch {}
  } finally {
    if (backupPath && existsSync(backupPath)) unlinkSync(backupPath);
  }
}

// ─── Start cron ───────────────────────────────────────────────

export function startTelegramBot(getDb) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("Telegram bot: TOKEN yoki CHAT_ID yo'q, o'tkazib yuborildi");
    return;
  }

  getDbRef = getDb;

  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  bot.on("message", (msg) => {
    const chatId = String(msg.chat.id);
    const username = msg.from?.username;
    if (username) {
      tgUsers[username.toLowerCase()] = chatId;
      saveUsers(tgUsers);
    }
  });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "✅ Tayyor! Endi sizga hujjatlar yuborilishi mumkin.").catch(() => {});
  });

  bot.on("polling_error", (err) => console.error("Telegram polling:", err.message));

  console.log("🤖 Telegram bot ishga tushdi (polling + 30 daqiqada backup)");

  cron.schedule("0,30 6-21 * * *", () => sendBackupAndSchedule(), { timezone: "Asia/Tashkent" });
  cron.schedule("0 22 * * *", () => sendBackupAndSchedule(), { timezone: "Asia/Tashkent" });
}
