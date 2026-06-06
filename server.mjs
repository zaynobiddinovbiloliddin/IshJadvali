import { createServer } from "node:http";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import "dotenv/config";
const { compareSync, hashSync } = bcrypt;

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const DATA_DIR = process.env.VERCEL ? "/tmp/ish-jadvali" : join(__dirname, "data");
export const DB_FILE = join(DATA_DIR, "mock-db.json");
const JWT_SECRET = process.env.JWT_SECRET || "ishjadvali_secret_key";

const initialUsers = [
  { id: 1, username: "superadmin", password: hashSync("Super@2025", 10), fullName: "Super Administrator", role: "superadmin", isActive: true, createdAt: new Date().toISOString() },
  { id: 2, username: "admin01", password: hashSync("Admin@2025", 10), fullName: "Jadval Administratori", role: "admin", isActive: true, createdAt: new Date().toISOString() }
];
const departments = [
  { id: "pull", name: "Pull xizmati" },
  { id: "operator", name: "Operatorlar" },
  { id: "dron", name: "Dron bo'limi" },
  { id: "tjk", name: "TJK guruhi" }
];
const statusMap = {
  working: "Studiyada",
  rest: "Damda",
  backup: "Zaxira",
  trip: "Komandirovka",
  tjk: "TJK ishda",
  vacation: "Mehnat ta'tili",
  administration: "Administratsiya",
  presidential: "Prezidentskiy",
  sick: "Balnishniy"
};
const statusMetricMap = {
  working: "working",
  backup: "working",
  tjk: "working",
  administration: "working",
  presidential: "working",
  rest: "rest",
  vacation: "rest",
  sick: "rest",
  trip: "away"
};

const initialEmployees = [
  ["Abdug'afforov A.", "Operator va texnik xodim"],
  ["JO'RAYEV S.", "Operator / muxbir"],
  ["Shermuhammedov D.", "Operator va texnik xodim"],
  ["BOSITXONOV B.", "Operator va texnik xodim"],
  ["QUDRATOV X.", "Operator va texnik xodim"],
  ["TO'XTASINOV M.", "Operator va texnik xodim"],
  ["FAYZIYEV F.", "Operator va texnik xodim"],
  ["SATTOROV I.", "Operator va texnik xodim"],
  ["Saidnasimov S.", "Operator va texnik xodim"],
  ["ZAMONOV I.", "Operator va texnik xodim"],
  ["ILMURZIN A.", "Operator va texnik xodim"],
  ["RASULOV B./dron", "Operator / dron"],
  ["Turdialiyev I./dron", "Operator / dron"],
  ["MENAYEV T.", "Operator va texnik xodim"],
  ["MAXMUDOV J.", "Operator va texnik xodim"],
  ["Ulug'murodov U.", "Operator va texnik xodim"],
  ["Eshonxo'jayev F.", "Operator va texnik xodim"],
  ["RUSTAMOV I.", "Operator va texnik xodim"],
  ["ZIKRILLAYEV A.", "Operator va texnik xodim"],
  ["HAMIDOV D.", "Operator va texnik xodim"],
  ["NURMATOV B.", "Operator va texnik xodim"],
  ["LUTFULLAYEV S.", "Operator va texnik xodim"],
  ["XAYDAROV X.", "Operator va texnik xodim"],
  ["KOMILOV M.", "Operator va texnik xodim"],
  ["XOLIQULOV S.", "Operator va texnik xodim"],
  ["Abdurahmonov D.", "Operator va texnik xodim"],
  ["TOIROV B.", "Operator va texnik xodim"],
  ["ZAXIDOV M.", "Operator va texnik xodim"],
  ["Abdusattorov A.", "Operator va texnik xodim"],
  ["RAHMONOV S.", "Operator va texnik xodim"],
  ["SOLIBOYEV I.", "Operator va texnik xodim"],
  ["AZIMOV E.", "Operator va texnik xodim"],
  ["RUSTAMOV E.", "Operator va texnik xodim"],
  ["SOLIBOYEV Y.", "Operator va texnik xodim"],
  ["UMAROV J.", "Operator va texnik xodim"],
  ["IBROHIMOV A.", "Muxbir"],
  ["O'TAYEVA S.", "Muxbir"],
  ["SHUKUROVA R.", "Muxbir"],
  ["HAYITOV D.", "Muxbir"],
  ["QURBONOV D.", "Muxbir"],
  ["JOVLIYEV G'.", "Muxbir"],
  ["HAMROYEVA O.", "Muxbir"],
  ["SOATOV J.", "Muxbir"],
  ["QALANDAROVA M.", "Muxbir"],
  ["NIZAMUDINOVA K.", "Muxbir"],
  ["Xudoyberdiyeva O.", "Muxbir"],
  ["AXMADOVA G.", "Muxbir"],
  ["RO'ZIMURODOV J.", "Muxbir"],
  ["YUNUSOVA M.", "Muxbir"],
  ["ESHBOYEV I.", "Muxbir"],
  ["ZARIPXAN K.", "Muxbir"],
  ["MIRSADIQOVA A.", "Muxbir"],
  ["MATYOQUBOVA I.", "Muxbir"],
  ["MARDONOV J.", "Muxbir"],
  ["QUDRATOVA M.", "Muxbir"],
  ["AKTAMOVA N.", "Muxbir"],
  ["QODIROV I./rej.", "Rejissyor"],
  ["QODIROV X.", "Muxbir"],
  ["IMINOVA M.", "Muxbir"],
  ["QOSIMOV M./rej.", "Rejissyor"],
  ["CHORIYEV SH.", "Muxbir"],
  ["Mambetsharipova N.", "Muxbir"],
  ["QIYOSOVA A.", "Muxbir"],
  ["REYIMOVA D.", "Muxbir"]
].map(([name, role], index) => ({
  id: index + 1,
  name,
  role,
  phone: "+998 90 000 00 00",
  telegram: "",
  department: inferDepartment({ id: index + 1, name, role }),
  portfolio: [],
  avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(name)}`
}));

const studios = [
  { name: "3 Studiya", tone: "purple", time: "9:00 - 22:00" },
  { name: "35 TJK", tone: "purple", time: "9:00 - 18:00" },
  { name: "3 Tongi dastur", tone: "blue", time: "9:00 - 18:00" }
];
const initialContacts = [
  { id: "contact-1", type: "Muxbir", name: "Sarvar Raximov", vehicle: "", phone: "+998 90 302 55 92" },
  { id: "contact-2", type: "Haydovchi", name: "142 Caddy", vehicle: "142 Caddy", phone: "+998 90 406 15 78" }
];

const dayNames = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const shortDayNames = ["Dush", "Sey", "Chor", "Pay", "Jum", "Shan", "Yak"];
const monthShort = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

let db = await loadDb();
cleanOldBackups().catch(() => {});

async function cleanOldBackups() {
  try {
    const files = await readdir(DATA_DIR);
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 kun
    for (const file of files) {
      if (/^backup-\d{4}-\d{2}-\d{2}\.json$/.test(file)) {
        const dateStr = file.slice(7, 17);
        if (new Date(dateStr).getTime() < cutoff) {
          await unlink(join(DATA_DIR, file)).catch(() => {});
        }
      }
    }
  } catch {}
}

async function loadDb() {
  try {
    const raw = await readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const employees = Array.isArray(parsed.employees) && parsed.employees.length ? parsed.employees : initialEmployees;
    const users = Array.isArray(parsed.users) && parsed.users.length ? parsed.users : initialUsers;
    return {
      generation: Number(parsed.generation || 0),
      employees: employees.map(normalizeEmployee),
      schedules: parsed.schedules && typeof parsed.schedules === "object" ? parsed.schedules : {},
      attendance: Array.isArray(parsed.attendance) ? parsed.attendance.map(normalizeAttendanceRecord).filter(Boolean) : [],
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts.map(normalizeContact).filter(Boolean) : initialContacts,
      users,
      dailyStatuses: Array.isArray(parsed.dailyStatuses) ? parsed.dailyStatuses : [],
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
    };
  } catch {
    return { generation: 0, employees: initialEmployees.map(normalizeEmployee), schedules: {}, attendance: [], contacts: initialContacts, users: initialUsers, dailyStatuses: [], auditLogs: [] };
  }
}

function inferDepartment(employee) {
  const text = `${employee.name || ""} ${employee.role || ""}`.toLowerCase();
  if (text.includes("dron")) return "dron";
  if (text.includes("rej") || text.includes("tjk")) return "tjk";
  if (Number(employee.id) <= 25) return "pull";
  return "operator";
}

function normalizeDepartment(value) {
  return departments.some((department) => department.id === value) ? value : "operator";
}

function cleanPortfolio(portfolio) {
  if (!Array.isArray(portfolio)) return [];
  return portfolio
    .map((item) => ({
      title: String(item?.title || "").trim(),
      url: String(item?.url || "").trim(),
      date: String(item?.date || "").trim()
    }))
    .filter((item) => item.title || item.url)
    .slice(0, 100);
}

function documentSlug(employee) {
  return String(employee.name || `employee-${employee.id || Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || `employee-${employee.id || Date.now()}`;
}

function createEmployeeDocumentView(employee, existing = {}) {
  return {
    slug: documentSlug(employee),
    wordFile: `${documentSlug(employee)}.docx`,
    excelFile: `${documentSlug(employee)}.xlsx`,
    generatedAt: existing.generatedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeEmployee(employee) {
  const normalized = {
    ...employee,
    phone: employee.phone || "+998 90 000 00 00",
    telegram: employee.telegram || "",
    department: normalizeDepartment(employee.department || inferDepartment(employee)),
    address: employee.address || "",
    documents: cleanDocuments(employee.documents),
    portfolio: cleanPortfolio(employee.portfolio)
  };
  return {
    ...normalized,
    documentView: createEmployeeDocumentView(normalized, employee.documentView)
  };
}

async function saveDb() {
  await mkdir(DATA_DIR, { recursive: true });
  const data = JSON.stringify(db, null, 2);
  const tmp = DB_FILE + ".tmp";
  await writeFile(tmp, data);
  await rename(tmp, DB_FILE);
  // Kunlik backup: har kuni 1 ta backup fayl saqlanadi
  const today = new Date().toISOString().slice(0, 10);
  const backupFile = join(DATA_DIR, `backup-${today}.json`);
  if (!existsSync(backupFile)) {
    await writeFile(backupFile, data);
  }
}

// ─── Audit log ───────────────────────────────────────────────────────────────
function pushAuditLog(action, entity, entityId, details) {
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.push({ id: Date.now(), action, entity, entityId: String(entityId || ""), details: details || "", createdAt: new Date().toISOString() });
  if (db.auditLogs.length > 500) db.auditLogs = db.auditLogs.slice(-500);
}

// ─── Task / Notification helpers ─────────────────────────────────────────────
function nextTaskId() {
  if (!db.tasks?.length) return 1;
  return Math.max(...db.tasks.map((t) => t.id)) + 1;
}
function nextNotifId() {
  if (!db.notifications?.length) return 1;
  return Math.max(...db.notifications.map((n) => n.id)) + 1;
}
function createNotif(userId, title, message, type = "task", taskId = null) {
  if (!db.notifications) db.notifications = [];
  db.notifications.push({ id: nextNotifId(), userId, title, message, type, isRead: false, taskId, createdAt: new Date().toISOString() });
  // max 300 notif per user
  const own = db.notifications.filter((n) => n.userId === userId);
  if (own.length > 300) {
    const stale = new Set(own.slice(0, own.length - 300).map((n) => n.id));
    db.notifications = db.notifications.filter((n) => !stale.has(n.id));
  }
}
function getAuthUser(request, response, adminOnly = false) {
  const token = parseTokenUser(request);
  if (!token) { sendJson(response, 401, { message: "Tizimga kirish zarur" }); return null; }
  const user = db.users.find((u) => u.id === token.id);
  if (!user || !user.isActive) { sendJson(response, 401, { message: "Foydalanuvchi topilmadi" }); return null; }
  if (adminOnly && !["admin", "superadmin"].includes(user.role)) { sendJson(response, 403, { message: "Ruxsat yo'q — faqat admin" }); return null; }
  return user;
}
function enrichTask(t) {
  const toUser = db.users.find((u) => u.id === t.assignedToId);
  const byUser = db.users.find((u) => u.id === t.assignedById);
  return {
    ...t,
    assignedTo: toUser ? { id: toUser.id, fullName: toUser.fullName, username: toUser.username } : { id: t.assignedToId, fullName: "Noma'lum", username: "" },
    assignedBy: byUser ? { id: byUser.id, fullName: byUser.fullName, username: byUser.username } : { id: t.assignedById, fullName: "Noma'lum", username: "" }
  };
}

// ─── Token auth ──────────────────────────────────────────────────────────────
function parseTokenUser(request) {
  const auth = request.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (sig !== JWT_SECRET.slice(0, 8)) return null;
  try {
    return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  } catch { return null; }
}

function requireAdmin(request, response) {
  const user = parseTokenUser(request);
  if (!user || !["admin", "superadmin"].includes(user.role)) {
    sendJson(response, 403, { message: "Ruxsat yo'q — faqat admin" });
    return null;
  }
  return user;
}

// ─── Daily Status helpers ─────────────────────────────────────────────────────
const VALID_STATUS_CODES = new Set(["I", "S", "T", "K", "D", "M", "O", "A", "P", "empty"]);
const WORKING_DAILY_CODES = ["I", "S", "T", "A", "P"];

function upsertDailyStatus(employeeId, date, statusCode) {
  if (!db.dailyStatuses) db.dailyStatuses = [];
  const idx = db.dailyStatuses.findIndex(
    (s) => String(s.employeeId) === String(employeeId) && s.date === date
  );
  const now = new Date().toISOString();
  if (idx !== -1) {
    db.dailyStatuses[idx].statusCode = statusCode;
    db.dailyStatuses[idx].updatedAt = now;
  } else {
    db.dailyStatuses.push({ id: Date.now(), employeeId: Number(employeeId), date, statusCode, createdAt: now, updatedAt: now });
  }
}

function getDailyStatusForMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const statuses = {};
  for (const s of (db.dailyStatuses || [])) {
    if (!s.date.startsWith(prefix)) continue;
    if (!statuses[s.employeeId]) statuses[s.employeeId] = {};
    statuses[s.employeeId][s.date] = s.statusCode;
  }
  return { statuses };
}

function getDailyStatusWorking(date) {
  const records = (db.dailyStatuses || []).filter(
    (s) => s.date === date && WORKING_DAILY_CODES.includes(s.statusCode)
  );
  const employees = records.map((r) => {
    const emp = db.employees.find((e) => String(e.id) === String(r.employeeId));
    if (!emp) return null;
    return { id: emp.id, name: emp.name, role: emp.role, department: emp.department, statusCode: r.statusCode };
  }).filter(Boolean);
  return { date, employees };
}

// ─── Filming Word export ──────────────────────────────────────────────────────
async function generateFilmingWordBuffer(date, rows) {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, WidthType, AlignmentType, ShadingType
  } = await import("docx");

  const UZ_MONTHS = ["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];
  const d = new Date(`${date}T00:00:00`);
  const dateLabel = `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()} yil`;
  const HEADER_GRAY = "D9D9D9";
  const LIGHT_BLUE = "BDD7EE";
  const WHITE = "FFFFFF";

  function mkCell(text, fill, bold = false, span = 1) {
    return new TableCell({
      columnSpan: span,
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: String(text || "").split("\n").map((line, i) =>
        new Paragraph({ spacing: { before: i === 0 ? 0 : 40 }, children: [new TextRun({ text: line, bold, size: bold ? 20 : 19, font: "Times New Roman" })] })
      )
    });
  }

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: ["Kamera\nraqami","Chiqish\nvaqti","Operator va\ntexnik xodim","Tadbir o'tkazilish joyi va tadbir mavzusi","Muxbirlar"].map((h) => mkCell(h, HEADER_GRAY, true))
    })
  ];

  for (const row of rows) {
    tableRows.push(new TableRow({ children: [new TableCell({ columnSpan: 5, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: `Kerakli jihoz va texnika:    ${row.equipment || "HD jamlanmasi, mikrofon, chiroq, avtotransport"}`, size: 19, font: "Times New Roman" })] })] })] }));
    tableRows.push(new TableRow({ children: [mkCell(row.cameraNumber || "", WHITE), mkCell(row.exitTime || "", WHITE), mkCell(row.operatorsText || "", WHITE), mkCell(row.topic || "", WHITE), mkCell(row.reportersText || "", WHITE)] }));
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: [
        new Paragraph({ children: [new TextRun({ text: "Tasvirga olish jadvali", bold: true, size: 24, font: "Times New Roman" }), new TextRun({ text: "\n" + dateLabel, size: 22, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '"TASDIQLAYMAN"\n"O\'zbekiston 24" ijodiy\nbirlashmasi" DM direktori\n__________M. Safarov', size: 22, font: "Times New Roman" })] }),
        new Paragraph({ children: [] }),
        new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: "Muhim eslatma! Tasvirga olish ishlari yakunlanishi bilan, material tayyorlashga kirishish shart.", color: "CC0000", bold: true, size: 20, font: "Times New Roman" })] }),
        new Paragraph({ children: [] }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [1500, 1200, 2000, 3300, 2000], rows: tableRows })
      ]
    }]
  });

  return Packer.toBuffer(doc);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatDate(date) {
  return `${monthShort[date.getMonth()]} ${date.getDate()}`;
}

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatInputMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getWeekStart(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  safeDate.setHours(0, 0, 0, 0);
  const mondayOffset = (safeDate.getDay() + 6) % 7;
  safeDate.setDate(safeDate.getDate() - mondayOffset);
  return safeDate;
}

function pickEmployee(index) {
  return db.employees[index % db.employees.length];
}

function scheduleEmployee(employee) {
  const { address, documents, ...publicEmployee } = employee;
  return publicEmployee;
}

function publicEmployees() {
  return db.employees.map(scheduleEmployee);
}

function normalizeContact(contact) {
  if (!contact || typeof contact !== "object") return null;
  const type = contact.type === "Haydovchi" ? "Haydovchi" : "Muxbir";
  const name = String(contact.name || "").trim();
  const vehicle = String(contact.vehicle || "").trim();
  const phone = String(contact.phone || "").trim();
  if (!name && !vehicle && !phone) return null;

  return {
    id: String(contact.id || `contact-${Date.now()}`),
    type,
    name,
    vehicle,
    phone
  };
}

function publicContacts() {
  return (db.contacts || []).map(normalizeContact).filter(Boolean);
}

function countByMetric(people, metric) {
  return people.filter((person) => statusMetricMap[person.statusType] === metric).length;
}

function normalizeAttendanceRecord(record) {
  if (!record || !record.employeeId || !record.checkIn) return null;
  const checkIn = new Date(record.checkIn);
  const checkOut = record.checkOut ? new Date(record.checkOut) : null;
  if (Number.isNaN(checkIn.getTime())) return null;

  return {
    id: String(record.id || `att-${checkIn.getTime()}-${record.employeeId}`),
    employeeId: Number(record.employeeId),
    employeeName: String(record.employeeName || ""),
    date: record.date || formatInputDate(checkIn),
    checkIn: checkIn.toISOString(),
    checkOut: checkOut && !Number.isNaN(checkOut.getTime()) ? checkOut.toISOString() : null,
    method: record.method || "face"
  };
}

function minutesBetween(start, end) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
}

function buildAttendanceSummary() {
  const today = formatInputDate(new Date());
  const month = formatInputMonth(new Date());
  const records = db.attendance || [];
  const todayRecords = records.filter((record) => record.date === today);
  const monthlyRecords = records.filter((record) => record.date?.startsWith(month));
  const openRecords = records.filter((record) => !record.checkOut);
  const employeeRows = new Map();

  for (const employee of db.employees) {
    employeeRows.set(Number(employee.id), {
      employeeId: Number(employee.id),
      name: employee.name,
      todayMinutes: 0,
      monthMinutes: 0,
      active: false,
      lastAction: null
    });
  }

  for (const record of monthlyRecords) {
    const row = employeeRows.get(Number(record.employeeId));
    if (!row) continue;
    const minutes = minutesBetween(record.checkIn, record.checkOut);
    row.monthMinutes += minutes;
    if (record.date === today) row.todayMinutes += minutes;
    if (!record.checkOut) row.active = true;
    row.lastAction = record.checkOut || record.checkIn;
  }

  for (const record of openRecords) {
    const row = employeeRows.get(Number(record.employeeId));
    if (!row) continue;
    row.active = true;
    row.lastAction = record.checkIn;
  }

  const topRows = [...employeeRows.values()]
    .filter((row) => row.monthMinutes > 0 || row.active)
    .sort((first, second) => second.monthMinutes - first.monthMinutes)
    .slice(0, 6);

  return {
    today,
    month,
    activeNow: openRecords.length,
    todayScans: todayRecords.reduce((sum, record) => sum + 1 + (record.checkOut ? 1 : 0), 0),
    todayMinutes: todayRecords.reduce((sum, record) => sum + minutesBetween(record.checkIn, record.checkOut), 0),
    monthMinutes: monthlyRecords.reduce((sum, record) => sum + minutesBetween(record.checkIn, record.checkOut), 0),
    recent: [...records].slice(-6).reverse(),
    rows: topRows
  };
}

function buildPerson(employee, studio, dayIndex, offset, seed) {
  const rest = (employee.id + dayIndex + seed) % 7 === 0;
  const backup = (employee.id + offset + seed) % 11 === 0;
  const trip = (employee.id + dayIndex + offset + seed) % 13 === 0;
  const tjk = studio.name.toLowerCase().includes("tjk") || (employee.department === "tjk" && (employee.id + dayIndex + seed) % 5 === 0);
  const statusType = rest ? "rest" : tjk ? "tjk" : trip ? "trip" : backup ? "backup" : "working";

  return {
    ...scheduleEmployee(employee),
    time: studio.time,
    employeeId: employee.id === 9 ? "EMP-009" : "",
    status: statusMap[statusType],
    statusType
  };
}

function createGroups(weekStart, seed) {
  return dayNames.flatMap((day, dayIndex) => {
    const date = addDays(weekStart, dayIndex);

    return studios.map((studio, studioIndex) => {
      const base = dayIndex * 2 + studioIndex * 3 + seed;
      const people = [0, 1, 2].map((offset) => buildPerson(pickEmployee(base + offset), studio, dayIndex, offset, seed));

      return {
        id: `${dayIndex}-${studio.name}`,
        day,
        title: `${day}, ${formatDate(date)}`,
        meta: studio.name,
        tone: studio.tone,
        people
      };
    });
  });
}

function createOverviewRows(groups) {
  return db.employees.slice(0, 8).map((employee) => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const groupForEmployee = groups.find((group) => group.day === dayNames[dayIndex] && group.people.some((person) => person.id === employee.id));
      if (!groupForEmployee) return "empty";
      const person = groupForEmployee.people.find((item) => item.id === employee.id);
      if (["rest", "trip", "tjk", "vacation", "administration", "presidential", "sick"].includes(person.statusType)) return person.statusType;
      return "work";
    });

    return { name: employee.name, days };
  });
}

function buildDashboard(weekStartValue, options = {}) {
  const weekStart = getWeekStart(weekStartValue);
  const weekEnd = addDays(weekStart, 6);
  const seed = Number(options.seed || 0);
  const generatedAt = options.generatedAt || "Hali yaratilmagan";
  const groups = createGroups(weekStart, seed);
  const allPeople = groups.flatMap((group) => group.people);
  const todayGroups = groups.filter((group) => group.day === "Dushanba");
  const todayPeople = todayGroups.flatMap((group) => group.people);
  const studioToday = todayPeople.filter((person) => statusMetricMap[person.statusType] !== "rest").slice(0, 3).map((person) => ({ ...person, status: "Working" }));

  const working = countByMetric(allPeople, "working");
  const rest = countByMetric(allPeople, "rest");
  const backup = allPeople.filter((person) => person.statusType === "backup").length;
  const trip = allPeople.filter((person) => person.statusType === "trip").length;
  const tjk = allPeople.filter((person) => person.statusType === "tjk").length;
  const vacation = allPeople.filter((person) => person.statusType === "vacation").length;
  const administration = allPeople.filter((person) => person.statusType === "administration").length;
  const presidential = allPeople.filter((person) => person.statusType === "presidential").length;
  const sick = allPeople.filter((person) => person.statusType === "sick").length;

  return {
    week: {
      start: formatInputDate(weekStart),
      end: formatInputDate(weekEnd),
      startLabel: formatDate(weekStart),
      number: Math.max(1, Math.ceil((weekStart.getDate() + seed) / 7)),
      title: `Hafta ${Math.max(1, Math.ceil((weekStart.getDate() + seed) / 7))}, ${weekStart.getFullYear()}`,
      range: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
      todayLabel: formatDate(new Date()),
      shortDays: [0, 1, 2, 3, 4, 5, 6].map((index) => ({ label: shortDayNames[index], date: addDays(weekStart, index).getDate() })),
      generatedAt,
      saved: Boolean(options.saved)
    },
    metrics: {
      total: db.employees.length,
      working,
      rest,
      backup,
      trip,
      tjk,
      vacation,
      administration,
      presidential,
      sick,
      workingToday: countByMetric(todayPeople, "working"),
      restToday: countByMetric(todayPeople, "rest"),
      tripToday: todayPeople.filter((person) => person.statusType === "trip").length,
      tjkToday: todayPeople.filter((person) => person.statusType === "tjk").length
    },
    groups,
    studioToday,
    overviewRows: createOverviewRows(groups),
    reports: [
      { label: "Ishlayotganlar", value: working },
      { label: "Dam olish kuni", value: rest },
      { label: "Komandirovka", value: trip },
      { label: "TJK guruhi", value: tjk },
      { label: "Zaxira", value: backup },
      { label: "Mehnat ta'tili", value: vacation },
      { label: "Administratsiya", value: administration },
      { label: "Prezidentskiy", value: presidential },
      { label: "Balnishniy", value: sick },
      { label: "Bugungi smena", value: todayPeople.length }
    ],
    notifications: [
      "Yangi smena jadvali tayyor.",
      `${rest} ta dam olish kuni belgilangan.`,
      `${trip} ta komandirovkada.`,
      `${tjk} ta TJK guruhida.`,
      `${vacation} ta mehnat ta'tilida.`,
      `${sick} ta balnishniy.`,
      `${backup} ta xodim zaxirada.`
    ],
    employees: publicEmployees(),
    contacts: publicContacts(),
    attendance: buildAttendanceSummary()
  };
}

function nextEmployeeId() {
  return Math.max(0, ...db.employees.map((employee) => Number(employee.id) || 0)) + 1;
}

function createAvatar(name, id) {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(name || `employee-${id}`)}`;
}

function cleanDocuments(documents) {
  if (!documents || typeof documents !== "object") return {};
  return ["photo3x4", "passportUz", "passportForeign", "certificate"].reduce((result, key) => {
    if (typeof documents[key] === "string" && documents[key].startsWith("data:image/")) {
      result[key] = documents[key];
    }
    return result;
  }, {});
}

function cleanEmployeePayload(payload, existing = {}) {
  const normalized = normalizeEmployee({
    ...existing,
    id: payload.id ?? existing.id,
    name: payload.name?.trim() || existing.name,
    role: payload.role?.trim() || existing.role || "Operator",
    phone: payload.phone?.trim() || existing.phone || "+998 90 000 00 00",
    telegram: typeof payload.telegram === "string" ? payload.telegram.trim() : (existing.telegram ?? ""),
    department: normalizeDepartment(payload.department || existing.department || inferDepartment(payload)),
    address: "",
    avatar: payload.avatar?.trim() || existing.avatar,
    documents: {},
    portfolio: payload.portfolio || existing.portfolio
  });
  return {
    ...normalized,
    documentView: createEmployeeDocumentView(normalized, existing.documentView)
  };
}

async function createEmployee(payload) {
  if (!payload.name?.trim()) throw new Error("Xodim ismi kiritilmadi");
  const id = nextEmployeeId();

  const employee = cleanEmployeePayload({
    ...payload,
    id,
    avatar: payload.avatar?.trim() ||
      `https://i.pravatar.cc/160?u=${encodeURIComponent(payload.name + Date.now())}`
  });

  db.employees.push(employee);
  pushAuditLog("CREATE", "Employee", id, `${employee.name} qo'shildi`);

  // Auto-create linked user account (Pass@1234 default)
  try {
    const baseName = (payload.name || "").split(/[\s.]+/)[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const baseUsername = baseName.slice(0, 15) || `user${id}`;

    let username = baseUsername;
    let counter = 1;
    while (db.users.find((u) => u.username === username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const newUser = {
      id: Math.max(0, ...db.users.map((u) => u.id)) + 1,
      username,
      password: hashSync("Pass@1234", 10),
      fullName: payload.name.trim(),
      role: "xodim",
      isActive: true,
      employeeId: id,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    pushAuditLog("CREATE", "User", newUser.id, `${employee.name} uchun @${username} login yaratildi`);
  } catch (userErr) {
    console.error("User auto-create error:", userErr.message);
  }

  await saveDb();
  return scheduleEmployee(employee);
}

async function updateEmployee(id, payload) {
  const index = db.employees.findIndex((employee) => String(employee.id) === String(id));
  if (index === -1) throw new Error("Xodim topilmadi");

  db.employees[index] = cleanEmployeePayload(payload, db.employees[index]);

  for (const schedule of Object.values(db.schedules)) {
    schedule.employees = publicEmployees();
    schedule.groups = schedule.groups.map((group) => ({
      ...group,
      people: group.people.map((person) => (
        String(person.id) === String(id) ? { ...person, ...scheduleEmployee(db.employees[index]), time: person.time, employeeId: person.employeeId, status: person.status, statusType: person.statusType } : person
      ))
    }));
    refreshScheduleDerivedData(schedule);
  }

  pushAuditLog("UPDATE", "Employee", id, `${db.employees[index].name} yangilandi`);
  await saveDb();
  return scheduleEmployee(db.employees[index]);
}

async function deleteEmployee(id) {
  const toDelete = db.employees.find((employee) => String(employee.id) === String(id));
  if (!toDelete) throw new Error("Xodim topilmadi");
  if (db.employees.length <= 1) throw new Error("Oxirgi xodimni o'chirib bo'lmaydi");
  pushAuditLog("DELETE", "Employee", id, `${toDelete.name} o'chirildi`);
  db.employees = db.employees.filter((employee) => String(employee.id) !== String(id));
  db.attendance = db.attendance.filter((record) => String(record.employeeId) !== String(id));

  for (const key of Object.keys(db.schedules)) {
    const schedule = db.schedules[key];
    schedule.groups = schedule.groups.map((group) => ({
      ...group,
      people: group.people.filter((person) => String(person.id) !== String(id))
    }));
    schedule.employees = publicEmployees();
    refreshScheduleDerivedData(schedule);
  }

  await saveDb();
  return { ok: true };
}

async function saveContact(payload) {
  const contact = normalizeContact({
    ...payload,
    id: payload.id || `contact-${Date.now()}`
  });
  if (!contact) throw new Error("Kontakt ma'lumotlarini kiriting");
  if (!contact.name && !contact.vehicle) throw new Error("Ism yoki mashina raqamini kiriting");
  if (!contact.phone) throw new Error("Telefon raqamini kiriting");

  const contacts = publicContacts();
  const index = contacts.findIndex((item) => item.id === contact.id);
  if (index === -1) contacts.unshift(contact);
  else contacts[index] = contact;
  db.contacts = contacts;
  await saveDb();
  return { contacts: publicContacts() };
}

async function deleteContact(id) {
  db.contacts = publicContacts().filter((contact) => contact.id !== id);
  await saveDb();
  return { contacts: publicContacts() };
}

async function scanAttendance(payload) {
  const employee = db.employees.find((item) => String(item.id) === String(payload.employeeId));
  if (!employee) throw new Error("Face ID uchun xodim tanlanmadi");

  const openRecord = db.attendance.find((record) => String(record.employeeId) === String(employee.id) && !record.checkOut);
  const now = new Date();

  if (openRecord) {
    openRecord.checkOut = now.toISOString();
    openRecord.employeeName = employee.name;
    await saveDb();
    return { action: "checkout", employee: scheduleEmployee(employee), record: openRecord, dashboard: getDashboard(payload.weekStart) };
  }

  const record = {
    id: `att-${now.getTime()}-${employee.id}`,
    employeeId: Number(employee.id),
    employeeName: employee.name,
    date: formatInputDate(now),
    checkIn: now.toISOString(),
    checkOut: null,
    method: "face"
  };

  db.attendance.push(record);
  await saveDb();
  return { action: "checkin", employee: scheduleEmployee(employee), record, dashboard: getDashboard(payload.weekStart) };
}

function refreshScheduleDerivedData(schedule) {
  schedule.groups = schedule.groups.map((group) => ({
    ...group,
    people: group.people.map((person) => {
      const employee = db.employees.find((item) => String(item.id) === String(person.id));
      return employee ? { ...person, ...scheduleEmployee(employee), time: person.time, employeeId: person.employeeId, status: person.status, statusType: person.statusType } : person;
    })
  }));

  const allPeople = schedule.groups.flatMap((group) => group.people);
  const todayGroups = schedule.groups.filter((group) => group.day === "Dushanba");
  const todayPeople = todayGroups.flatMap((group) => group.people);
  const working = countByMetric(allPeople, "working");
  const rest = countByMetric(allPeople, "rest");
  const backup = allPeople.filter((person) => person.statusType === "backup").length;
  const trip = allPeople.filter((person) => person.statusType === "trip").length;
  const tjk = allPeople.filter((person) => person.statusType === "tjk").length;
  const vacation = allPeople.filter((person) => person.statusType === "vacation").length;
  const administration = allPeople.filter((person) => person.statusType === "administration").length;
  const presidential = allPeople.filter((person) => person.statusType === "presidential").length;
  const sick = allPeople.filter((person) => person.statusType === "sick").length;

  schedule.metrics = {
    ...schedule.metrics,
    total: db.employees.length,
    working,
    rest,
    backup,
    trip,
    tjk,
    vacation,
    administration,
    presidential,
    sick,
    workingToday: countByMetric(todayPeople, "working"),
    restToday: countByMetric(todayPeople, "rest"),
    tripToday: todayPeople.filter((person) => person.statusType === "trip").length,
    tjkToday: todayPeople.filter((person) => person.statusType === "tjk").length
  };
  schedule.studioToday = todayPeople.filter((person) => statusMetricMap[person.statusType] !== "rest").slice(0, 3).map((person) => ({ ...person, status: "Working" }));
  schedule.overviewRows = createOverviewRows(schedule.groups);
  schedule.reports = [
    { label: "Ishlayotganlar", value: working },
    { label: "Dam olish kuni", value: rest },
    { label: "Komandirovka", value: trip },
    { label: "TJK guruhi", value: tjk },
    { label: "Zaxira", value: backup },
    { label: "Mehnat ta'tili", value: vacation },
    { label: "Administratsiya", value: administration },
    { label: "Prezidentskiy", value: presidential },
    { label: "Balnishniy", value: sick },
    { label: "Bugungi smena", value: todayPeople.length }
  ];
  schedule.notifications = [
    "Jadval ma'lumotlari yangilandi.",
    `${rest} ta dam olish kuni belgilangan.`,
    `${trip} ta komandirovkada.`,
    `${tjk} ta TJK guruhida.`,
    `${vacation} ta mehnat ta'tilida.`,
    `${administration} ta administratsiyada.`,
    `${presidential} ta prezidentskiyda.`,
    `${sick} ta balnishniy.`,
    `${backup} ta xodim zaxirada.`
  ];
}

function getScheduleKey(weekStartValue) {
  return formatInputDate(getWeekStart(weekStartValue));
}

function getDashboard(weekStartValue) {
  const key = getScheduleKey(weekStartValue);
  if (db.schedules[key]) {
    db.schedules[key].employees = publicEmployees();
    db.schedules[key].contacts = publicContacts();
    refreshScheduleDerivedData(db.schedules[key]);
    return db.schedules[key];
  }
  return buildDashboard(key);
}

async function generateAndStoreSchedule(weekStartValue) {
  const key = getScheduleKey(weekStartValue);
  db.generation += 1;

  const dashboard = buildDashboard(key, {
    seed: db.generation,
    generatedAt: new Date().toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
    saved: true
  });

  db.schedules[key] = dashboard;
  await saveDb();
  return dashboard;
}

async function deleteSchedule(weekStartValue) {
  const key = getScheduleKey(weekStartValue);
  delete db.schedules[key];
  await saveDb();
  return { ok: true };
}

async function updatePersonStatus(weekStartValue, payload) {
  const key = getScheduleKey(weekStartValue);
  if (!db.schedules[key]) db.schedules[key] = buildDashboard(key, { saved: true });
  const statusType = statusMap[payload.statusType] ? payload.statusType : "working";

  const schedule = db.schedules[key];
  let updated = false;

  schedule.groups = schedule.groups.map((group) => {
    if (group.id !== payload.groupId) return group;
    return {
      ...group,
      people: group.people.map((person) => {
        if (String(person.id) !== String(payload.personId)) return person;
        updated = true;
        return {
          ...person,
          statusType,
          status: statusMap[statusType]
        };
      })
    };
  });

  if (!updated) throw new Error("Jadvaldagi xodim topilmadi");
  schedule.week.saved = true;
  refreshScheduleDerivedData(schedule);
  await saveDb();
  return schedule;
}

async function addScheduleGroup(weekStartValue, payload) {
  const key = getScheduleKey(weekStartValue);
  if (!db.schedules[key]) db.schedules[key] = buildDashboard(key, { saved: true });

  const schedule = db.schedules[key];
  const day = dayNames.includes(payload.day) ? payload.day : dayNames[0];
  const dayIndex = dayNames.indexOf(day);
  const date = addDays(getWeekStart(key), dayIndex);
  const selectedEmployees = (Array.isArray(payload.employeeIds) ? payload.employeeIds : [])
    .map((id) => db.employees.find((employee) => String(employee.id) === String(id)))
    .filter(Boolean);

  if (!selectedEmployees.length) throw new Error("Kamida bitta xodim tanlang");

  const statusType = statusMap[payload.statusType] ? payload.statusType : "working";
  const time = payload.time?.trim() || "09:00 - 18:00";
  const meta = payload.meta?.trim() || "Yangi studiya";

  const group = {
    id: `custom-${Date.now()}`,
    day,
    title: `${day}, ${formatDate(date)}`,
    meta,
    tone: payload.tone === "blue" ? "blue" : "purple",
    people: selectedEmployees.map((employee) => ({
      ...scheduleEmployee(employee),
      time,
      employeeId: "",
      status: statusMap[statusType],
      statusType
    }))
  };

  schedule.groups = [group, ...schedule.groups];
  schedule.week.saved = true;
  schedule.week.generatedAt = new Date().toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  schedule.employees = publicEmployees();
  refreshScheduleDerivedData(schedule);
  await saveDb();
  return schedule;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function serveStatic(request, response) {
  const url = parseRequestUrl(request);
  const safePath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = safePath === "/" ? "/index.html" : safePath;
  const filePath = join(__dirname, "dist", requestedPath);
  const fallback = join(__dirname, "dist", "index.html");
  const target = existsSync(filePath) ? filePath : fallback;
  const type = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".png": "image/png"
  }[extname(target)] || "text/plain";

  try {
    const file = await readFile(target);
    response.writeHead(200, { "Content-Type": type });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

function parseRequestUrl(request) {
  const raw = request.url || "/";
  // Leading-zero IP (e.g. 095.111.247.157) is invalid in Node URL — use localhost as base
  const host = (request.headers.host || "localhost").replace(/\b0+(\d)/g, "$1");
  try {
    return new URL(raw, `http://${host}`);
  } catch {
    return new URL(raw.split("?")[0] || "/", "http://localhost");
  }
}

export async function handleRequest(request, response) {
  if (request.method === "OPTIONS") return sendJson(response, 200, {});

  const url = parseRequestUrl(request);

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      return sendJson(response, 200, { ok: true, schedules: Object.keys(db.schedules).length });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const { username, password } = await readBody(request);
      const user = db.users.find((u) => u.username === username && u.isActive);
      if (!user || !compareSync(String(password || ""), user.password)) {
        return sendJson(response, 401, { message: "Login yoki parol noto'g'ri" });
      }
      const token = `${Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString("base64")}.${JWT_SECRET.slice(0, 8)}`;
      return sendJson(response, 200, {
        user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
        token
      });
    }

    if (request.method === "GET" && url.pathname === "/api/users") {
      return sendJson(response, 200, {
        users: db.users.map(({ password: _pw, ...u }) => u)
      });
    }

    if (request.method === "POST" && url.pathname === "/api/users") {
      const body = await readBody(request);
      if (!body.username || !body.password || !body.fullName) {
        return sendJson(response, 400, { message: "username, password va fullName talab qilinadi" });
      }
      if (db.users.find((u) => u.username === body.username)) {
        return sendJson(response, 409, { message: "Bu username allaqachon mavjud" });
      }
      const newUser = {
        id: Math.max(0, ...db.users.map((u) => u.id)) + 1,
        username: String(body.username).trim(),
        password: hashSync(String(body.password), 10),
        fullName: String(body.fullName).trim(),
        role: ["superadmin", "admin", "xodim"].includes(body.role) ? body.role : "xodim",
        isActive: true,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      await saveDb();
      const { password: _pw, ...safeUser } = newUser;
      return sendJson(response, 201, safeUser);
    }

    const userMatch = url.pathname.match(/^\/api\/users\/(\d+)$/);
    if (userMatch && request.method === "PUT") {
      const uid = Number(userMatch[1]);
      const idx = db.users.findIndex((u) => u.id === uid);
      if (idx === -1) return sendJson(response, 404, { message: "Foydalanuvchi topilmadi" });
      const body = await readBody(request);
      if (body.password) db.users[idx].password = hashSync(String(body.password), 10);
      if (body.fullName) db.users[idx].fullName = String(body.fullName).trim();
      if (body.role && ["superadmin", "admin", "xodim"].includes(body.role)) db.users[idx].role = body.role;
      if (typeof body.isActive === "boolean") db.users[idx].isActive = body.isActive;
      await saveDb();
      const { password: _pw, ...safeUser } = db.users[idx];
      return sendJson(response, 200, safeUser);
    }

    if (userMatch && request.method === "DELETE") {
      const uid = Number(userMatch[1]);
      const idx = db.users.findIndex((u) => u.id === uid);
      if (idx === -1) return sendJson(response, 404, { message: "Foydalanuvchi topilmadi" });
      if (db.users.filter((u) => u.role === "superadmin" && u.isActive).length <= 1 && db.users[idx].role === "superadmin") {
        return sendJson(response, 400, { message: "Oxirgi superadminni o'chirib bo'lmaydi" });
      }
      db.users.splice(idx, 1);
      await saveDb();
      return sendJson(response, 200, { ok: true });
    }

    // ─── Audit Logs ─────────────────────────────────────────────────────────
    if (url.pathname === "/api/audit-logs" && request.method === "GET") {
      const logs = [...(db.auditLogs || [])].reverse().slice(0, 200);
      return sendJson(response, 200, { logs });
    }

    // ─── Daily Status ───────────────────────────────────────────────────────
    if (url.pathname === "/api/daily-status/working" && request.method === "GET") {
      const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
      return sendJson(response, 200, getDailyStatusWorking(date));
    }

    if (url.pathname === "/api/daily-status" && request.method === "GET") {
      const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
      const month = Number(url.searchParams.get("month")) || new Date().getMonth() + 1;
      return sendJson(response, 200, getDailyStatusForMonth(year, month));
    }

    if (url.pathname === "/api/daily-status" && request.method === "POST") {
      const user = requireAdmin(request, response);
      if (!user) return;
      const body = await readBody(request);
      const { employeeId, date, statusCode } = body;
      if (!employeeId || !date) return sendJson(response, 400, { message: "employeeId va date kerak" });
      if (!VALID_STATUS_CODES.has(statusCode)) return sendJson(response, 400, { message: "Noto'g'ri statusCode" });
      upsertDailyStatus(employeeId, date, statusCode);
      await saveDb();
      return sendJson(response, 200, { ok: true, employeeId, date, statusCode });
    }

    // ─── Filming Word Export ─────────────────────────────────────────────────
    if (url.pathname === "/api/filming/export-word" && request.method === "POST") {
      const user = requireAdmin(request, response);
      if (!user) return;
      const body = await readBody(request);
      const { date, rows = [] } = body;
      if (!date) return sendJson(response, 400, { message: "date kerak" });
      const buffer = await generateFilmingWordBuffer(date, rows);
      const fileName = `tasvirga-olish-jadvali-${date}.docx`;
      const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization" };
      response.writeHead(200, {
        ...CORS,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length
      });
      return response.end(buffer);
    }

    if (request.method === "GET" && url.pathname === "/api/dashboard") {
      return sendJson(response, 200, getDashboard(url.searchParams.get("weekStart")));
    }

    if (request.method === "GET" && url.pathname === "/api/employees") {
      return sendJson(response, 200, { employees: publicEmployees() });
    }

    if (request.method === "POST" && url.pathname === "/api/employees") {
      return sendJson(response, 201, await createEmployee(await readBody(request)));
    }

    if (request.method === "GET" && url.pathname === "/api/contacts") {
      return sendJson(response, 200, { contacts: publicContacts() });
    }

    if (request.method === "POST" && url.pathname === "/api/contacts") {
      return sendJson(response, 201, await saveContact(await readBody(request)));
    }

    if (request.method === "POST" && url.pathname === "/api/attendance/scan") {
      return sendJson(response, 200, await scanAttendance(await readBody(request)));
    }

    const employeeMatch = url.pathname.match(/^\/api\/employees\/(\d+)$/);
    if (employeeMatch && request.method === "PUT") {
      return sendJson(response, 200, await updateEmployee(employeeMatch[1], await readBody(request)));
    }

    if (employeeMatch && request.method === "DELETE") {
      return sendJson(response, 200, await deleteEmployee(employeeMatch[1]));
    }

    const contactMatch = url.pathname.match(/^\/api\/contacts\/([^/]+)$/);
    if (contactMatch && request.method === "DELETE") {
      return sendJson(response, 200, await deleteContact(decodeURIComponent(contactMatch[1])));
    }

    if (request.method === "GET" && url.pathname === "/api/schedules") {
      return sendJson(response, 200, {
        schedules: Object.values(db.schedules).map((schedule) => ({
          start: schedule.week.start,
          range: schedule.week.range,
          generatedAt: schedule.week.generatedAt,
          groups: schedule.groups.length
        }))
      });
    }

    if (request.method === "POST" && url.pathname === "/api/schedules/generate") {
      const body = await readBody(request);
      return sendJson(response, 201, await generateAndStoreSchedule(body.weekStart));
    }

    const scheduleMatch = url.pathname.match(/^\/api\/schedules\/(\d{4}-\d{2}-\d{2})$/);
    if (scheduleMatch && request.method === "GET") {
      return sendJson(response, 200, getDashboard(scheduleMatch[1]));
    }

    if (scheduleMatch && request.method === "DELETE") {
      return sendJson(response, 200, await deleteSchedule(scheduleMatch[1]));
    }

    const groupMatch = url.pathname.match(/^\/api\/schedules\/(\d{4}-\d{2}-\d{2})\/groups$/);
    if (groupMatch && request.method === "POST") {
      return sendJson(response, 201, await addScheduleGroup(groupMatch[1], await readBody(request)));
    }

    const statusMatch = url.pathname.match(/^\/api\/schedules\/(\d{4}-\d{2}-\d{2})\/status$/);
    if (statusMatch && request.method === "PUT") {
      return sendJson(response, 200, await updatePersonStatus(statusMatch[1], await readBody(request)));
    }

    // ─── Tasks ──────────────────────────────────────────────────────────────
    if (url.pathname === "/api/tasks" && request.method === "GET") {
      const user = getAuthUser(request, response);
      if (!user) return;
      if (!db.tasks) db.tasks = [];
      const tasks = (["admin", "superadmin"].includes(user.role)
        ? db.tasks.filter((t) => t.assignedById === user.id)
        : db.tasks.filter((t) => t.assignedToId === user.id))
        .map(enrichTask)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sendJson(response, 200, { success: true, tasks });
    }

    if (url.pathname === "/api/tasks" && request.method === "POST") {
      const user = getAuthUser(request, response, true);
      if (!user) return;
      const { title, description, assignedToId, dueDate } = await readBody(request);
      if (!title?.trim()) return sendJson(response, 400, { message: "Vazifa nomini kiriting" });
      if (!assignedToId) return sendJson(response, 400, { message: "Xodimni tanlang" });
      const toId = Number(assignedToId);
      const assignee = db.users.find((u) => u.id === toId);
      if (!assignee) return sendJson(response, 404, { message: "Xodim topilmadi" });
      if (!db.tasks) db.tasks = [];
      const now = new Date().toISOString();
      const task = { id: nextTaskId(), title: String(title).trim(), description: description ? String(description).trim() : null, assignedToId: toId, assignedById: user.id, status: "PENDING", rejectReason: null, dueDate: dueDate || null, completedAt: null, createdAt: now, updatedAt: now };
      db.tasks.push(task);
      createNotif(toId, "📋 Yangi vazifa tayinlandi", `${user.fullName || user.username} sizga vazifa yubordi: "${task.title}"`, "task", task.id);
      pushAuditLog("CREATE", "Task", task.id, `"${task.title}" vazifasi ${assignee.fullName} ga tayinlandi`);
      await saveDb();
      return sendJson(response, 201, { success: true, task: enrichTask(task) });
    }

    const taskStatusMatch = url.pathname.match(/^\/api\/tasks\/(\d+)\/status$/);
    if (taskStatusMatch && request.method === "PATCH") {
      const user = getAuthUser(request, response);
      if (!user) return;
      const taskId = Number(taskStatusMatch[1]);
      const { status, rejectReason } = await readBody(request);
      const valid = ["ACCEPTED", "COMPLETED", "REJECTED"];
      if (!valid.includes(status)) return sendJson(response, 400, { message: "Noto'g'ri status" });
      if (!db.tasks) db.tasks = [];
      const idx = db.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) return sendJson(response, 404, { message: "Vazifa topilmadi" });
      const task = db.tasks[idx];
      if (task.assignedToId !== user.id) return sendJson(response, 403, { message: "Ruxsat yo'q" });
      db.tasks[idx] = { ...task, status, rejectReason: status === "REJECTED" ? (rejectReason || "") : null, completedAt: status === "COMPLETED" ? new Date().toISOString() : task.completedAt, updatedAt: new Date().toISOString() };
      const msgs = {
        ACCEPTED: { title: "✅ Vazifa qabul qilindi", message: `${user.fullName} "${task.title}" vazifasini qabul qildi`, type: "info" },
        COMPLETED: { title: "🎉 Vazifa bajarildi!", message: `${user.fullName} "${task.title}" vazifasini bajardi`, type: "success" },
        REJECTED: { title: "❌ Vazifa rad etildi", message: `${user.fullName} "${task.title}" vazifasini rad etdi. Sabab: ${rejectReason || "Ko'rsatilmagan"}`, type: "warning" }
      };
      const m = msgs[status];
      createNotif(task.assignedById, m.title, m.message, m.type, taskId);
      await saveDb();
      return sendJson(response, 200, { success: true, task: db.tasks[idx] });
    }

    // ─── Notifications ───────────────────────────────────────────────────────
    if (url.pathname === "/api/notifications" && request.method === "GET") {
      const user = getAuthUser(request, response);
      if (!user) return;
      if (!db.notifications) db.notifications = [];
      const notifs = db.notifications.filter((n) => n.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
      return sendJson(response, 200, { success: true, notifications: notifs, unreadCount: notifs.filter((n) => !n.isRead).length });
    }

    const notifReadMatch = url.pathname.match(/^\/api\/notifications\/(\d+)\/read$/);
    if (notifReadMatch && request.method === "PATCH") {
      const user = getAuthUser(request, response);
      if (!user) return;
      if (!db.notifications) db.notifications = [];
      const idx = db.notifications.findIndex((n) => n.id === Number(notifReadMatch[1]) && n.userId === user.id);
      if (idx !== -1) { db.notifications[idx].isRead = true; await saveDb(); }
      return sendJson(response, 200, { success: true });
    }

    if (url.pathname === "/api/notifications/read-all" && request.method === "PATCH") {
      const user = getAuthUser(request, response);
      if (!user) return;
      if (!db.notifications) db.notifications = [];
      db.notifications = db.notifications.map((n) => n.userId === user.id ? { ...n, isRead: true } : n);
      await saveDb();
      return sendJson(response, 200, { success: true });
    }

    if (url.pathname.startsWith("/api/")) {
      return sendJson(response, 404, { message: "API topilmadi" });
    }

    return serveStatic(request, response);
  } catch (error) {
    return sendJson(response, 500, { message: error.message || "Server xatosi" });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createServer(handleRequest);
  const HOST = process.env.HOST || "0.0.0.0";
  server.listen(PORT, HOST, async () => {
    console.log(`Backend ready: http://${HOST}:${PORT}`);
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const { startTelegramBot } = await import("./src/telegram-bot.mjs");
        startTelegramBot();
      } catch (err) {
        console.error("Telegram bot ishga tushmadi:", err.message);
      }
    } else {
      console.log("Telegram bot: TOKEN yoki CHAT_ID .env da yo'q, o'tkazib yuborildi");
    }
  });
}
