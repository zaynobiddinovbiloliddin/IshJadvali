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
      users
    };
  } catch {
    return { generation: 0, employees: initialEmployees.map(normalizeEmployee), schedules: {}, attendance: [], contacts: initialContacts, users: initialUsers };
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
    telegram: payload.telegram?.trim() || "",
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
    avatar: payload.avatar?.trim() || createAvatar(payload.name, id)
  });

  db.employees.push(employee);
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

  await saveDb();
  return scheduleEmployee(db.employees[index]);
}

async function deleteEmployee(id) {
  const exists = db.employees.some((employee) => String(employee.id) === String(id));
  if (!exists) throw new Error("Xodim topilmadi");
  if (db.employees.length <= 1) throw new Error("Oxirgi xodimni o'chirib bo'lmaydi");
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
  const url = new URL(request.url, `http://${request.headers.host}`);
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

export async function handleRequest(request, response) {
  if (request.method === "OPTIONS") return sendJson(response, 200, {});

  const url = new URL(request.url, `http://${request.headers.host}`);

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
