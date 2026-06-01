import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { startTelegramBot } from "./src/telegram-bot.mjs";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// ─── Constants ────────────────────────────────────────────────────────────────

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
  sick: "Balnishniy",
  otpiska: "Otpiska"
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
  otpiska: "rest",
  trip: "away"
};

const studios = [
  { name: "3 Studiya", tone: "purple", time: "9:00 - 22:00" },
  { name: "35 TJK", tone: "purple", time: "9:00 - 18:00" },
  { name: "3 Tongi dastur", tone: "blue", time: "9:00 - 18:00" }
];

const dayNames = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const shortDayNames = ["Dush", "Sey", "Chor", "Pay", "Jum", "Shan", "Yak"];
const monthShort = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

// ─── Pure utility functions ───────────────────────────────────────────────────

function inferDepartment(employee) {
  const text = `${employee.name || ""} ${employee.role || ""}`.toLowerCase();
  if (text.includes("dron")) return "dron";
  if (text.includes("rej") || text.includes("tjk")) return "tjk";
  if (Number(employee.id) <= 25) return "pull";
  return "operator";
}

function normalizeDepartment(value) {
  return departments.some((d) => d.id === value) ? value : "operator";
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
  return (
    String(employee.name || `employee-${employee.id || Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `employee-${employee.id || Date.now()}`
  );
}

function createEmployeeDocumentView(employee, existing = {}) {
  const slug = documentSlug(employee);
  return {
    slug,
    wordFile: `${slug}.docx`,
    excelFile: `${slug}.xlsx`,
    generatedAt: existing.generatedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
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

function createAvatar(name, id) {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(name || `employee-${id}`)}`;
}

function normalizeEmployee(employee) {
  const portfolio = Array.isArray(employee.portfolio) ? employee.portfolio : [];
  const documents =
    employee.documents && typeof employee.documents === "object" ? employee.documents : {};
  const base = {
    id: Number(employee.id),
    name: String(employee.name || "").trim(),
    role: String(employee.role || "Operator").trim(),
    phone: employee.phone || "+998 90 000 00 00",
    telegram: employee.telegram || "",
    department: normalizeDepartment(employee.department || inferDepartment(employee)),
    address: employee.address || "",
    avatar: employee.avatar || createAvatar(employee.name, employee.id),
    documents: cleanDocuments(documents),
    portfolio: cleanPortfolio(portfolio)
  };
  return { ...base, documentView: createEmployeeDocumentView(base, employee.documentView || {}) };
}

function scheduleEmployee(employee) {
  const { address, documents, ...publicEmployee } = employee;
  return publicEmployee;
}

function publicEmployees(employees) {
  return employees.map(scheduleEmployee);
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

function publicContacts(contacts) {
  return contacts.map(normalizeContact).filter(Boolean);
}

function countByMetric(people, metric) {
  return people.filter((p) => statusMetricMap[p.statusType] === metric).length;
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

function getScheduleKey(weekStartValue) {
  return formatInputDate(getWeekStart(weekStartValue));
}

function pickEmployee(index, employees) {
  return employees[index % employees.length];
}

function buildPerson(employee, studio, dayIndex, offset, seed) {
  const rest = (employee.id + dayIndex + seed) % 7 === 0;
  const backup = (employee.id + offset + seed) % 11 === 0;
  const trip = (employee.id + dayIndex + offset + seed) % 13 === 0;
  const tjk =
    studio.name.toLowerCase().includes("tjk") ||
    (employee.department === "tjk" && (employee.id + dayIndex + seed) % 5 === 0);
  const statusType = rest ? "rest" : tjk ? "tjk" : trip ? "trip" : backup ? "backup" : "working";
  return {
    ...scheduleEmployee(employee),
    time: studio.time,
    employeeId: employee.id === 9 ? "EMP-009" : "",
    status: statusMap[statusType],
    statusType
  };
}

function createGroups(weekStart, seed, employees) {
  return dayNames.flatMap((day, dayIndex) => {
    const date = addDays(weekStart, dayIndex);
    return studios.map((studio, studioIndex) => {
      const base = dayIndex * 2 + studioIndex * 3 + seed;
      const people = [0, 1, 2].map((offset) =>
        buildPerson(pickEmployee(base + offset, employees), studio, dayIndex, offset, seed)
      );
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

function createOverviewRows(groups, employees) {
  return employees.slice(0, 8).map((employee) => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const group = groups.find(
        (g) => g.day === dayNames[dayIndex] && g.people.some((p) => p.id === employee.id)
      );
      if (!group) return "empty";
      const person = group.people.find((p) => p.id === employee.id);
      if (
        ["rest", "trip", "tjk", "vacation", "administration", "presidential", "sick"].includes(
          person.statusType
        )
      )
        return person.statusType;
      return "work";
    });
    return { name: employee.name, days };
  });
}

function buildAttendanceSummary(employees, attendance) {
  const today = formatInputDate(new Date());
  const month = formatInputMonth(new Date());
  const records = attendance || [];
  const todayRecords = records.filter((r) => r.date === today);
  const monthlyRecords = records.filter((r) => r.date?.startsWith(month));
  const openRecords = records.filter((r) => !r.checkOut);
  const employeeRows = new Map();

  for (const employee of employees) {
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
    .sort((a, b) => b.monthMinutes - a.monthMinutes)
    .slice(0, 6);

  return {
    today,
    month,
    activeNow: openRecords.length,
    todayScans: todayRecords.reduce((sum, r) => sum + 1 + (r.checkOut ? 1 : 0), 0),
    todayMinutes: todayRecords.reduce((sum, r) => sum + minutesBetween(r.checkIn, r.checkOut), 0),
    monthMinutes: monthlyRecords.reduce((sum, r) => sum + minutesBetween(r.checkIn, r.checkOut), 0),
    recent: [...records].slice(-6).reverse(),
    rows: topRows
  };
}

function buildDashboard(weekStartValue, options = {}, employees = [], contacts = [], attendance = []) {
  const weekStart = getWeekStart(weekStartValue);
  const weekEnd = addDays(weekStart, 6);
  const seed = Number(options.seed || 0);
  const generatedAt = options.generatedAt || "Hali yaratilmagan";
  const groups = createGroups(weekStart, seed, employees);
  const allPeople = groups.flatMap((g) => g.people);
  const todayGroups = groups.filter((g) => g.day === "Dushanba");
  const todayPeople = todayGroups.flatMap((g) => g.people);
  const studioToday = todayPeople
    .filter((p) => statusMetricMap[p.statusType] !== "rest")
    .slice(0, 3)
    .map((p) => ({ ...p, status: "Working" }));

  const working = countByMetric(allPeople, "working");
  const rest = countByMetric(allPeople, "rest");
  const backup = allPeople.filter((p) => p.statusType === "backup").length;
  const trip = allPeople.filter((p) => p.statusType === "trip").length;
  const tjk = allPeople.filter((p) => p.statusType === "tjk").length;
  const vacation = allPeople.filter((p) => p.statusType === "vacation").length;
  const administration = allPeople.filter((p) => p.statusType === "administration").length;
  const presidential = allPeople.filter((p) => p.statusType === "presidential").length;
  const sick = allPeople.filter((p) => p.statusType === "sick").length;

  return {
    week: {
      start: formatInputDate(weekStart),
      end: formatInputDate(weekEnd),
      startLabel: formatDate(weekStart),
      number: Math.max(1, Math.ceil((weekStart.getDate() + seed) / 7)),
      title: `Hafta ${Math.max(1, Math.ceil((weekStart.getDate() + seed) / 7))}, ${weekStart.getFullYear()}`,
      range: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
      todayLabel: formatDate(new Date()),
      shortDays: [0, 1, 2, 3, 4, 5, 6].map((i) => ({
        label: shortDayNames[i],
        date: addDays(weekStart, i).getDate()
      })),
      generatedAt,
      saved: Boolean(options.saved)
    },
    metrics: {
      total: employees.length,
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
      tripToday: todayPeople.filter((p) => p.statusType === "trip").length,
      tjkToday: todayPeople.filter((p) => p.statusType === "tjk").length
    },
    groups,
    studioToday,
    overviewRows: createOverviewRows(groups, employees),
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
    employees: publicEmployees(employees),
    contacts: publicContacts(contacts),
    attendance: buildAttendanceSummary(employees, attendance)
  };
}

function refreshScheduleDerivedData(schedule, employees, contacts, attendance) {
  schedule.groups = schedule.groups.map((group) => ({
    ...group,
    people: group.people.map((person) => {
      const employee = employees.find((e) => String(e.id) === String(person.id));
      return employee
        ? {
            ...person,
            ...scheduleEmployee(employee),
            time: person.time,
            employeeId: person.employeeId,
            status: person.status,
            statusType: person.statusType
          }
        : person;
    })
  }));

  const allPeople = schedule.groups.flatMap((g) => g.people);
  const todayGroups = schedule.groups.filter((g) => g.day === "Dushanba");
  const todayPeople = todayGroups.flatMap((g) => g.people);

  const working = countByMetric(allPeople, "working");
  const rest = countByMetric(allPeople, "rest");
  const backup = allPeople.filter((p) => p.statusType === "backup").length;
  const trip = allPeople.filter((p) => p.statusType === "trip").length;
  const tjk = allPeople.filter((p) => p.statusType === "tjk").length;
  const vacation = allPeople.filter((p) => p.statusType === "vacation").length;
  const administration = allPeople.filter((p) => p.statusType === "administration").length;
  const presidential = allPeople.filter((p) => p.statusType === "presidential").length;
  const sick = allPeople.filter((p) => p.statusType === "sick").length;

  schedule.metrics = {
    ...schedule.metrics,
    total: employees.length,
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
    tripToday: todayPeople.filter((p) => p.statusType === "trip").length,
    tjkToday: todayPeople.filter((p) => p.statusType === "tjk").length
  };
  schedule.studioToday = todayPeople
    .filter((p) => statusMetricMap[p.statusType] !== "rest")
    .slice(0, 3)
    .map((p) => ({ ...p, status: "Working" }));
  schedule.overviewRows = createOverviewRows(schedule.groups, employees);
  schedule.employees = publicEmployees(employees);
  schedule.contacts = publicContacts(contacts);
  schedule.attendance = buildAttendanceSummary(employees, attendance);
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

function cleanEmployeePayload(payload, existing = {}) {
  const normalized = normalizeEmployee({
    ...existing,
    id: payload.id ?? existing.id,
    name: payload.name?.trim() || existing.name,
    role: payload.role?.trim() || existing.role || "Operator",
    phone: payload.phone?.trim() || existing.phone || "+998 90 000 00 00",
    telegram: payload.telegram?.trim() || "",
    department: normalizeDepartment(
      payload.department || existing.department || inferDepartment(payload)
    ),
    address: "",
    avatar:
      payload.avatar?.trim() ||
      existing.avatar ||
      createAvatar(payload.name || existing.name, existing.id),
    documents: cleanDocuments(
      payload.documents && typeof payload.documents === "object"
        ? payload.documents
        : existing.documents || {}
    ),
    portfolio: payload.portfolio || existing.portfolio || []
  });
  return {
    ...normalized,
    documentView: createEmployeeDocumentView(normalized, existing.documentView || {})
  };
}

// ─── Audit log ────────────────────────────────────────────────────────────────

async function writeAudit(action, entity, entityId, details) {
  try {
    await prisma.auditLog.create({
      data: { action, entity, entityId: String(entityId || ""), details: details || null }
    });
  } catch {}
}

// ─── DB fetch helpers ─────────────────────────────────────────────────────────

async function fetchEmployees() {
  const rows = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" }
  });
  return rows.map(normalizeEmployee);
}

async function fetchContacts() {
  const rows = await prisma.contact.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(normalizeContact).filter(Boolean);
}

async function fetchAttendance() {
  const rows = await prisma.attendance.findMany({ orderBy: { checkIn: "asc" } });
  return rows
    .map((r) =>
      normalizeAttendanceRecord({
        ...r,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut ? r.checkOut.toISOString() : null
      })
    )
    .filter(Boolean);
}

// ─── Business logic (async, uses Prisma) ─────────────────────────────────────

async function getDashboard(weekStartValue) {
  const key = getScheduleKey(weekStartValue);
  const [employees, contacts, attendance] = await Promise.all([
    fetchEmployees(),
    fetchContacts(),
    fetchAttendance()
  ]);

  const saved = await prisma.schedule.findUnique({ where: { weekStart: key } });
  if (saved) {
    const schedule = saved.data;
    refreshScheduleDerivedData(schedule, employees, contacts, attendance);
    return schedule;
  }
  return buildDashboard(key, {}, employees, contacts, attendance);
}

async function generateAndStoreSchedule(weekStartValue) {
  const key = getScheduleKey(weekStartValue);
  const [employees, contacts, attendance] = await Promise.all([
    fetchEmployees(),
    fetchContacts(),
    fetchAttendance()
  ]);

  const generation = (await prisma.schedule.count()) + 1;
  const dashboard = buildDashboard(
    key,
    {
      seed: generation,
      generatedAt: new Date().toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      saved: true
    },
    employees,
    contacts,
    attendance
  );

  await prisma.schedule.upsert({
    where: { weekStart: key },
    update: { data: dashboard },
    create: { weekStart: key, data: dashboard }
  });

  await writeAudit("generate", "Schedule", key, `generation=${generation}`);
  return dashboard;
}

async function deleteSchedule(weekStartValue) {
  const key = getScheduleKey(weekStartValue);
  await prisma.schedule.deleteMany({ where: { weekStart: key } });
  await writeAudit("delete", "Schedule", key, null);
  return { ok: true };
}

async function updatePersonStatus(weekStartValue, payload) {
  const key = getScheduleKey(weekStartValue);
  const [employees, contacts, attendance] = await Promise.all([
    fetchEmployees(),
    fetchContacts(),
    fetchAttendance()
  ]);

  const saved = await prisma.schedule.findUnique({ where: { weekStart: key } });
  const schedule = saved
    ? saved.data
    : buildDashboard(key, { saved: true }, employees, contacts, attendance);

  const statusType = statusMap[payload.statusType] ? payload.statusType : "working";
  let updated = false;

  schedule.groups = schedule.groups.map((group) => {
    if (group.id !== payload.groupId) return group;
    return {
      ...group,
      people: group.people.map((person) => {
        if (String(person.id) !== String(payload.personId)) return person;
        updated = true;
        return { ...person, statusType, status: statusMap[statusType] };
      })
    };
  });

  if (!updated) throw new Error("Jadvaldagi xodim topilmadi");
  schedule.week.saved = true;
  refreshScheduleDerivedData(schedule, employees, contacts, attendance);

  await prisma.schedule.upsert({
    where: { weekStart: key },
    update: { data: schedule },
    create: { weekStart: key, data: schedule }
  });

  await writeAudit(
    "status_update",
    "Schedule",
    key,
    `person=${payload.personId} status=${statusType}`
  );
  return schedule;
}

async function addScheduleGroup(weekStartValue, payload) {
  const key = getScheduleKey(weekStartValue);
  const [employees, contacts, attendance] = await Promise.all([
    fetchEmployees(),
    fetchContacts(),
    fetchAttendance()
  ]);

  const saved = await prisma.schedule.findUnique({ where: { weekStart: key } });
  const schedule = saved
    ? saved.data
    : buildDashboard(key, { saved: true }, employees, contacts, attendance);

  const day = dayNames.includes(payload.day) ? payload.day : dayNames[0];
  const dayIndex = dayNames.indexOf(day);
  const date = addDays(getWeekStart(key), dayIndex);
  const selectedEmployees = (Array.isArray(payload.employeeIds) ? payload.employeeIds : [])
    .map((id) => employees.find((e) => String(e.id) === String(id)))
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
  schedule.week.generatedAt = new Date().toLocaleString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit"
  });
  refreshScheduleDerivedData(schedule, employees, contacts, attendance);

  await prisma.schedule.upsert({
    where: { weekStart: key },
    update: { data: schedule },
    create: { weekStart: key, data: schedule }
  });

  await writeAudit("add_group", "Schedule", key, `day=${day} meta=${meta}`);
  return schedule;
}

async function createEmployee(payload) {
  if (!payload.name?.trim()) throw new Error("Xodim ismi kiritilmadi");

  const cleaned = cleanEmployeePayload(payload);
  const employee = await prisma.employee.create({
    data: {
      name: cleaned.name,
      role: cleaned.role,
      phone: cleaned.phone,
      telegram: cleaned.telegram,
      department: cleaned.department,
      avatar: cleaned.avatar,
      address: cleaned.address,
      portfolio: cleaned.portfolio,
      documents: cleaned.documents
    }
  });

  const normalized = normalizeEmployee(employee);
  await writeAudit("create", "Employee", employee.id, employee.name);
  return scheduleEmployee(normalized);
}

async function updateEmployee(id, payload) {
  const existing = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new Error("Xodim topilmadi");

  const cleaned = cleanEmployeePayload(payload, normalizeEmployee(existing));
  const updated = await prisma.employee.update({
    where: { id: Number(id) },
    data: {
      name: cleaned.name,
      role: cleaned.role,
      phone: cleaned.phone,
      telegram: cleaned.telegram,
      department: cleaned.department,
      avatar: cleaned.avatar,
      address: cleaned.address,
      portfolio: cleaned.portfolio,
      documents: cleaned.documents
    }
  });

  const normalizedUpdated = normalizeEmployee(updated);

  const allSchedules = await prisma.schedule.findMany();
  for (const s of allSchedules) {
    const schedule = s.data;
    schedule.groups = schedule.groups.map((group) => ({
      ...group,
      people: group.people.map((person) =>
        String(person.id) === String(id)
          ? {
              ...person,
              ...scheduleEmployee(normalizedUpdated),
              time: person.time,
              employeeId: person.employeeId,
              status: person.status,
              statusType: person.statusType
            }
          : person
      )
    }));
    await prisma.schedule.update({ where: { weekStart: s.weekStart }, data: { data: schedule } });
  }

  await writeAudit("update", "Employee", id, updated.name);
  return scheduleEmployee(normalizedUpdated);
}

async function deleteEmployee(id) {
  const count = await prisma.employee.count({ where: { isActive: true } });
  if (count <= 1) throw new Error("Oxirgi xodimni o'chirib bo'lmaydi");

  const existing = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new Error("Xodim topilmadi");

  await prisma.employee.delete({ where: { id: Number(id) } });

  const [freshEmployees, freshContacts, freshAttendance] = await Promise.all([
    fetchEmployees(),
    fetchContacts(),
    fetchAttendance()
  ]);

  const allSchedules = await prisma.schedule.findMany();
  for (const s of allSchedules) {
    const schedule = s.data;
    schedule.groups = schedule.groups.map((group) => ({
      ...group,
      people: group.people.filter((person) => String(person.id) !== String(id))
    }));
    refreshScheduleDerivedData(schedule, freshEmployees, freshContacts, freshAttendance);
    await prisma.schedule.update({ where: { weekStart: s.weekStart }, data: { data: schedule } });
  }

  await writeAudit("delete", "Employee", id, existing.name);
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

  const existing = await prisma.contact.findUnique({ where: { id: contact.id } });
  if (existing) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { type: contact.type, name: contact.name, vehicle: contact.vehicle, phone: contact.phone }
    });
    await writeAudit("update", "Contact", contact.id, contact.name);
  } else {
    await prisma.contact.create({
      data: {
        id: contact.id,
        type: contact.type,
        name: contact.name,
        vehicle: contact.vehicle,
        phone: contact.phone
      }
    });
    await writeAudit("create", "Contact", contact.id, contact.name);
  }

  const contacts = await fetchContacts();
  return { contacts: publicContacts(contacts) };
}

async function deleteContact(id) {
  await prisma.contact.deleteMany({ where: { id } });
  await writeAudit("delete", "Contact", id, null);
  const contacts = await fetchContacts();
  return { contacts: publicContacts(contacts) };
}

async function scanAttendance(payload) {
  const employees = await fetchEmployees();
  const employee = employees.find((e) => String(e.id) === String(payload.employeeId));
  if (!employee) throw new Error("Face ID uchun xodim tanlanmadi");

  const openRecord = await prisma.attendance.findFirst({
    where: { employeeId: Number(employee.id), checkOut: null }
  });
  const now = new Date();

  if (openRecord) {
    const updatedRecord = await prisma.attendance.update({
      where: { id: openRecord.id },
      data: { checkOut: now, employeeName: employee.name }
    });
    const record = normalizeAttendanceRecord({
      ...updatedRecord,
      checkIn: updatedRecord.checkIn.toISOString(),
      checkOut: updatedRecord.checkOut?.toISOString() || null
    });
    await writeAudit("checkout", "Attendance", record.id, employee.name);
    const dashboard = await getDashboard(payload.weekStart);
    return { action: "checkout", employee: scheduleEmployee(employee), record, dashboard };
  }

  const created = await prisma.attendance.create({
    data: {
      employeeId: Number(employee.id),
      employeeName: employee.name,
      date: formatInputDate(now),
      checkIn: now,
      checkOut: null,
      method: "face"
    }
  });
  const record = normalizeAttendanceRecord({
    ...created,
    checkIn: created.checkIn.toISOString(),
    checkOut: null
  });
  await writeAudit("checkin", "Attendance", record.id, employee.name);
  const dashboard = await getDashboard(payload.weekStart);
  return { action: "checkin", employee: scheduleEmployee(employee), record, dashboard };
}

// ─── Error wrapper ────────────────────────────────────────────────────────────

function wrap(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      res.status(500).json({ message: err.message || "Server xatosi" });
    }
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get(
  "/api/health",
  wrap(async (req, res) => {
    const count = await prisma.schedule.count();
    res.json({ ok: true, schedules: count });
  })
);

app.get(
  "/api/dashboard",
  wrap(async (req, res) => {
    res.json(await getDashboard(req.query.weekStart));
  })
);

app.get(
  "/api/employees",
  wrap(async (req, res) => {
    const employees = await fetchEmployees();
    res.json({ employees: publicEmployees(employees) });
  })
);

app.post(
  "/api/employees",
  wrap(async (req, res) => {
    res.status(201).json(await createEmployee(req.body));
  })
);

app.put(
  "/api/employees/:id",
  wrap(async (req, res) => {
    res.json(await updateEmployee(req.params.id, req.body));
  })
);

app.delete(
  "/api/employees/:id",
  wrap(async (req, res) => {
    res.json(await deleteEmployee(req.params.id));
  })
);

app.get(
  "/api/contacts",
  wrap(async (req, res) => {
    const contacts = await fetchContacts();
    res.json({ contacts: publicContacts(contacts) });
  })
);

app.post(
  "/api/contacts",
  wrap(async (req, res) => {
    res.status(201).json(await saveContact(req.body));
  })
);

app.delete(
  "/api/contacts/:id",
  wrap(async (req, res) => {
    res.json(await deleteContact(decodeURIComponent(req.params.id)));
  })
);

app.post(
  "/api/attendance/scan",
  wrap(async (req, res) => {
    res.json(await scanAttendance(req.body));
  })
);

app.get(
  "/api/schedules",
  wrap(async (req, res) => {
    const schedules = await prisma.schedule.findMany({ orderBy: { savedAt: "desc" } });
    res.json({
      schedules: schedules.map((s) => ({
        start: s.data.week?.start || s.weekStart,
        range: s.data.week?.range || s.weekStart,
        generatedAt: s.data.week?.generatedAt || s.savedAt,
        groups: s.data.groups?.length || 0
      }))
    });
  })
);

app.post(
  "/api/schedules/generate",
  wrap(async (req, res) => {
    res.status(201).json(await generateAndStoreSchedule(req.body.weekStart));
  })
);

app.get(
  "/api/schedules/:weekStart",
  wrap(async (req, res) => {
    res.json(await getDashboard(req.params.weekStart));
  })
);

app.delete(
  "/api/schedules/:weekStart",
  wrap(async (req, res) => {
    res.json(await deleteSchedule(req.params.weekStart));
  })
);

app.post(
  "/api/schedules/:weekStart/groups",
  wrap(async (req, res) => {
    res.status(201).json(await addScheduleGroup(req.params.weekStart, req.body));
  })
);

app.put(
  "/api/schedules/:weekStart/status",
  wrap(async (req, res) => {
    res.json(await updatePersonStatus(req.params.weekStart, req.body));
  })
);

app.get(
  "/api/audit-logs",
  wrap(async (req, res) => {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });
    res.json({ logs });
  })
);

// Serve built frontend static files
app.use(express.static(join(__dirname, "dist")));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API topilmadi" });
  }
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// ─── Export for Vercel / api/index.mjs ────────────────────────────────────────

export async function handleRequest(req, res) {
  return app(req, res);
}

// ─── Start server when run directly ──────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = Number(process.env.PORT || 3001);
  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(`Server ready: http://${HOST}:${PORT}`);
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      startTelegramBot(prisma);
    }
  });
}
