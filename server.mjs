import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const DATA_DIR = process.env.VERCEL ? "/tmp/ish-jadvali" : join(__dirname, "data");
const DB_FILE = join(DATA_DIR, "mock-db.json");

const initialEmployees = [
  { id: 1, name: "Toirov B", role: "Rejissyor", phone: "+998 90 101 22 33", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "O'lmasov Sh", role: "Operator", phone: "+998 91 204 15 22", avatar: "https://randomuser.me/api/portraits/men/46.jpg" },
  { id: 3, name: "Turdialiyev I", role: "Montajchi", phone: "+998 93 715 44 80", avatar: "https://randomuser.me/api/portraits/men/51.jpg" },
  { id: 4, name: "Raxmatulin N", role: "Muhandis", phone: "+998 97 620 12 10", avatar: "https://randomuser.me/api/portraits/men/76.jpg" },
  { id: 5, name: "Qudratov X", role: "Operator", phone: "+998 94 811 60 77", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: 6, name: "Ilmurzin A", role: "Boshlovchi", phone: "+998 99 230 77 41", avatar: "https://randomuser.me/api/portraits/men/64.jpg" },
  { id: 7, name: "Rasulov B", role: "Smena boshlig'i", phone: "+998 90 441 89 10", avatar: "https://randomuser.me/api/portraits/men/84.jpg" },
  { id: 8, name: "Rustamov E", role: "Ovoz rejissyori", phone: "+998 91 700 20 40", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
  { id: 9, name: "Mirjalolov M", role: "Texnik", phone: "+998 93 514 11 28", avatar: "https://randomuser.me/api/portraits/men/71.jpg" },
  { id: 10, name: "Shermuhammedov D", role: "Operator", phone: "+998 95 300 15 19", avatar: "https://randomuser.me/api/portraits/men/60.jpg" },
  { id: 11, name: "Axmedov B", role: "Muharrir", phone: "+998 97 611 90 71", avatar: "https://randomuser.me/api/portraits/men/44.jpg" },
  { id: 12, name: "Umarov J.", role: "Grafika", phone: "+998 99 842 45 60", avatar: "https://randomuser.me/api/portraits/men/18.jpg" },
  { id: 13, name: "Nurmatov B.", role: "Operator", phone: "+998 90 677 22 91", avatar: "https://randomuser.me/api/portraits/men/65.jpg" },
  { id: 14, name: "Azimov E.", role: "Administrator", phone: "+998 91 733 58 01", avatar: "https://randomuser.me/api/portraits/men/25.jpg" },
  { id: 15, name: "Menayev T.", role: "Texnik yordamchi", phone: "+998 94 206 71 19", avatar: "https://randomuser.me/api/portraits/men/37.jpg" }
];

const studios = [
  { name: "3 Studiya", tone: "purple", time: "9:00 - 22:00" },
  { name: "35 TJK", tone: "purple", time: "9:00 - 18:00" },
  { name: "3 Tongi dastur", tone: "blue", time: "9:00 - 18:00" }
];

const dayNames = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const shortDayNames = ["Dush", "Sey", "Chor", "Pay"];
const monthShort = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

let db = await loadDb();

async function loadDb() {
  try {
    const raw = await readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      generation: Number(parsed.generation || 0),
      employees: Array.isArray(parsed.employees) && parsed.employees.length ? parsed.employees : initialEmployees,
      schedules: parsed.schedules && typeof parsed.schedules === "object" ? parsed.schedules : {}
    };
  } catch {
    return { generation: 0, employees: initialEmployees, schedules: {} };
  }
}

async function saveDb() {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2));
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

function getWeekStart(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date("2026-01-29T00:00:00");
  return Number.isNaN(date.getTime()) ? new Date("2026-01-29T00:00:00") : date;
}

function pickEmployee(index) {
  return db.employees[index % db.employees.length];
}

function buildPerson(employee, studio, dayIndex, offset, seed) {
  const rest = (employee.id + dayIndex + seed) % 7 === 0;
  const backup = (employee.id + offset + seed) % 11 === 0;

  return {
    ...employee,
    time: studio.time,
    employeeId: employee.id === 9 ? "EMP-009" : "",
    status: rest ? "Damda" : backup ? "Zaxira" : "Ishlamoqda",
    statusType: rest ? "rest" : backup ? "backup" : "working"
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
    const days = [0, 1, 2, 3].map((dayIndex) => {
      const groupForEmployee = groups.find((group) => group.day === dayNames[dayIndex] && group.people.some((person) => person.id === employee.id));
      if (!groupForEmployee) return "empty";
      const person = groupForEmployee.people.find((item) => item.id === employee.id);
      return person.statusType === "rest" ? "rest" : "work";
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
  const studioToday = todayPeople.filter((person) => person.statusType !== "rest").slice(0, 3).map((person) => ({ ...person, status: "Working" }));

  const working = allPeople.filter((person) => person.statusType === "working").length;
  const rest = allPeople.filter((person) => person.statusType === "rest").length;
  const backup = allPeople.filter((person) => person.statusType === "backup").length;

  return {
    week: {
      start: formatInputDate(weekStart),
      end: formatInputDate(weekEnd),
      startLabel: formatDate(weekStart),
      number: Math.max(1, Math.ceil((weekStart.getDate() + seed) / 7)),
      title: `Hafta ${Math.max(1, Math.ceil((weekStart.getDate() + seed) / 7))}, ${weekStart.getFullYear()}`,
      range: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
      todayLabel: `${dayNames[0]}, ${weekStart.getDate()}-yanvar`,
      shortDays: [0, 1, 2, 3].map((index) => ({ label: shortDayNames[index], date: addDays(weekStart, index).getDate() })),
      generatedAt,
      saved: Boolean(options.saved)
    },
    metrics: {
      total: 40,
      working,
      rest,
      backup,
      workingToday: todayPeople.filter((person) => person.statusType === "working").length,
      restToday: todayPeople.filter((person) => person.statusType === "rest").length
    },
    groups,
    studioToday,
    overviewRows: createOverviewRows(groups),
    reports: [
      { label: "Ishlayotganlar", value: working },
      { label: "Dam olish kuni", value: rest },
      { label: "Zaxira", value: backup },
      { label: "Bugungi smena", value: todayPeople.length }
    ],
    notifications: [
      "Yangi smena jadvali tayyor.",
      `${rest} ta dam olish kuni belgilangan.`,
      `${backup} ta xodim zaxirada.`
    ],
    employees: db.employees
  };
}

function nextEmployeeId() {
  return Math.max(0, ...db.employees.map((employee) => Number(employee.id) || 0)) + 1;
}

function createAvatar(name, id) {
  const genderPath = id % 5 === 0 ? "women" : "men";
  const imageId = 10 + ((id * 7) % 80);
  if (name) return `https://randomuser.me/api/portraits/${genderPath}/${imageId}.jpg`;
  return `https://randomuser.me/api/portraits/men/${imageId}.jpg`;
}

async function createEmployee(payload) {
  if (!payload.name?.trim()) throw new Error("Xodim ismi kiritilmadi");

  const employee = {
    id: nextEmployeeId(),
    name: payload.name.trim(),
    role: payload.role?.trim() || "Operator",
    phone: payload.phone?.trim() || "+998 90 000 00 00",
    avatar: payload.avatar?.trim() || createAvatar(payload.name, nextEmployeeId())
  };

  db.employees.push(employee);
  await saveDb();
  return employee;
}

async function updateEmployee(id, payload) {
  const index = db.employees.findIndex((employee) => String(employee.id) === String(id));
  if (index === -1) throw new Error("Xodim topilmadi");

  db.employees[index] = {
    ...db.employees[index],
    name: payload.name?.trim() || db.employees[index].name,
    role: payload.role?.trim() || db.employees[index].role,
    phone: payload.phone?.trim() || db.employees[index].phone,
    avatar: payload.avatar?.trim() || db.employees[index].avatar
  };

  for (const schedule of Object.values(db.schedules)) {
    schedule.employees = db.employees;
    schedule.groups = schedule.groups.map((group) => ({
      ...group,
      people: group.people.map((person) => (
        String(person.id) === String(id) ? { ...person, ...db.employees[index], time: person.time, employeeId: person.employeeId, status: person.status, statusType: person.statusType } : person
      ))
    }));
    refreshScheduleDerivedData(schedule);
  }

  await saveDb();
  return db.employees[index];
}

async function deleteEmployee(id) {
  const exists = db.employees.some((employee) => String(employee.id) === String(id));
  if (!exists) throw new Error("Xodim topilmadi");
  if (db.employees.length <= 1) throw new Error("Oxirgi xodimni o'chirib bo'lmaydi");
  db.employees = db.employees.filter((employee) => String(employee.id) !== String(id));

  for (const key of Object.keys(db.schedules)) {
    const schedule = db.schedules[key];
    schedule.groups = schedule.groups.map((group) => ({
      ...group,
      people: group.people.filter((person) => String(person.id) !== String(id))
    }));
    schedule.employees = db.employees;
    refreshScheduleDerivedData(schedule);
  }

  await saveDb();
  return { ok: true };
}

function refreshScheduleDerivedData(schedule) {
  const allPeople = schedule.groups.flatMap((group) => group.people);
  const todayGroups = schedule.groups.filter((group) => group.day === "Dushanba");
  const todayPeople = todayGroups.flatMap((group) => group.people);
  const working = allPeople.filter((person) => person.statusType === "working").length;
  const rest = allPeople.filter((person) => person.statusType === "rest").length;
  const backup = allPeople.filter((person) => person.statusType === "backup").length;

  schedule.metrics = {
    ...schedule.metrics,
    total: db.employees.length,
    working,
    rest,
    backup,
    workingToday: todayPeople.filter((person) => person.statusType === "working").length,
    restToday: todayPeople.filter((person) => person.statusType === "rest").length
  };
  schedule.studioToday = todayPeople.filter((person) => person.statusType !== "rest").slice(0, 3).map((person) => ({ ...person, status: "Working" }));
  schedule.overviewRows = createOverviewRows(schedule.groups);
  schedule.reports = [
    { label: "Ishlayotganlar", value: working },
    { label: "Dam olish kuni", value: rest },
    { label: "Zaxira", value: backup },
    { label: "Bugungi smena", value: todayPeople.length }
  ];
  schedule.notifications = [
    "Jadval ma'lumotlari yangilandi.",
    `${rest} ta dam olish kuni belgilangan.`,
    `${backup} ta xodim zaxirada.`
  ];
}

function getScheduleKey(weekStartValue) {
  return formatInputDate(getWeekStart(weekStartValue));
}

function getDashboard(weekStartValue) {
  const key = getScheduleKey(weekStartValue);
  if (db.schedules[key]) {
    db.schedules[key].employees = db.employees;
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

  const statusMap = {
    working: "Ishlamoqda",
    rest: "Damda",
    backup: "Zaxira"
  };

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
          statusType: payload.statusType,
          status: statusMap[payload.statusType] || "Ishlamoqda"
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

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
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

    if (request.method === "GET" && url.pathname === "/api/dashboard") {
      return sendJson(response, 200, getDashboard(url.searchParams.get("weekStart")));
    }

    if (request.method === "GET" && url.pathname === "/api/employees") {
      return sendJson(response, 200, { employees: db.employees });
    }

    if (request.method === "POST" && url.pathname === "/api/employees") {
      return sendJson(response, 201, await createEmployee(await readBody(request)));
    }

    const employeeMatch = url.pathname.match(/^\/api\/employees\/(\d+)$/);
    if (employeeMatch && request.method === "PUT") {
      return sendJson(response, 200, await updateEmployee(employeeMatch[1], await readBody(request)));
    }

    if (employeeMatch && request.method === "DELETE") {
      return sendJson(response, 200, await deleteEmployee(employeeMatch[1]));
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
  server.listen(PORT, () => {
    console.log(`Backend ready: http://localhost:${PORT}`);
  });
}
