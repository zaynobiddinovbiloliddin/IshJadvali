import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Image,
  Info,
  LogOut,
  Menu,
  Moon,
  Paperclip,
  Phone,
  PlayCircle,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  UsersRound,
  Umbrella,
  Pencil,
  X
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const WEEK_DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const DAY_TABS = ["Bugun", ...WEEK_DAYS, "Barcha kunlar"];
const MONTH_NAMES = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const STATUS_OPTIONS = [
  { id: "ishda", code: "I", label: "Ishda", metric: "working" },
  { id: "working", code: "S", label: "Studiyada", metric: "working" },
  { id: "rest", code: "D", label: "Damda", metric: "rest" },
  { id: "trip", code: "K", label: "Komandirovka", metric: "away" },
  { id: "tjk", code: "T", label: "TJK ishda", metric: "working" },
  { id: "backup", code: "Z", label: "Zaxira", metric: "working" },
  { id: "vacation", code: "M", label: "Mehnat ta'tili", metric: "rest" },
  { id: "administration", code: "A", label: "Administratsiya", metric: "working" },
  { id: "presidential", code: "P", label: "Prezidentskiy", metric: "working" },
  { id: "otpiska", code: "O", label: "O'quv ta'tili", metric: "rest" },
  { id: "sick", code: "B", label: "Kasal", metric: "rest" },
  { id: "unpaid", code: "U", label: "Pulsiz ta'til", metric: "rest" }
];
const STATUS_META = Object.fromEntries(STATUS_OPTIONS.map((status) => [status.id, status]));
const OPERATOR_NAMES = [
  "Abdug'afforov A.", "JO'RAYEV S.", "Shermuhammedov D.", "BOSITXONOV B.", "QUDRATOV X.",
  "TO'XTASINOV M.", "FAYZIYEV F.", "SATTOROV I.", "Saidnasimov S.", "ZAMONOV I.",
  "ILMURZIN A.", "RASULOV B./dron", "Turdialiyev I./dron", "MENAYEV T.", "MAXMUDOV J.",
  "Ulug'murodov U.", "Eshonxo'jayev F.", "RUSTAMOV I.", "ZIKRILLAYEV A.", "HAMIDOV D.",
  "NURMATOV B.", "LUTFULLAYEV S.", "XAYDAROV X.", "KOMILOV M.", "XOLIQULOV S.",
  "Abdurahmonov D.", "TOIROV B.", "ZAXIDOV M.", "Abdusattorov A.", "RAHMONOV S.",
  "SOLIBOYEV I.", "AZIMOV E.", "RUSTAMOV E.", "SOLIBOYEV Y.", "UMAROV J."
];
const SHIFT_LABELS = ["09:00-18:00", "09:00-22:00", "18:00-09:00", "Dam"];
const MONTHLY_STATUS_OPTIONS = {
  work: { label: "I", shift: "Ishda", hours: 8 },
  rest: { label: "D", shift: "Dam", hours: 0 },
  trip: { label: "K", shift: "Komandirovka", hours: 8 },
  tjk: { label: "T", shift: "TJK guruhi", hours: 8 },
  studio: { label: "S", shift: "Studiyada", hours: 8 },
  vacation: { label: "M", shift: "Ta'tilda", hours: 0 },
  otpiska: { label: "O", shift: "O'quv ta'tili", hours: 0 },
  administration: { label: "A", shift: "Administratsiya", hours: 8 },
  presidential: { label: "P", shift: "Prezidentskiy", hours: 8 },
  sick: { label: "B", shift: "Kasal", hours: 0 },
  unpaid: { label: "U", shift: "Pulsiz ta'til", hours: 0 }
};
const MONTHLY_STATUS_SEQUENCE = ["work", "rest", "trip", "tjk", "studio", "vacation", "otpiska", "sick", "unpaid", "administration", "presidential"];
const DEPARTMENTS = [
  { id: "pool", label: "Pool xizmati", shortLabel: "Pool" },
  { id: "operator", label: "Oddiy operatorlar", shortLabel: "Operator" },
  { id: "dron", label: "Dron bo'limi", shortLabel: "Dron" },
  { id: "tjk", label: "TJK guruhi", shortLabel: "TJK" }
];
const SHOOTING_SCHEDULE = [
  {
    camera: "1\n(914)",
    time: "09:00-13:00",
    operators: ["Abdug'afforov A."],
    topic: "Telemarkazda \"Zilzila vaqtidagi favqulodda vaziyatlarni bartaraf etish\" taktik-o'quv mashqi.",
    reporters: ["JO'RAYEV S."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "2\n(692)",
    time: "10:00-13:00",
    operators: ["JO'RAYEV S."],
    topic: "Matematika fanini innovatsion usulda o'qitayotgan o'qituvchi. Tonggi dastur uchun.",
    reporters: ["IBROHIMOV A."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "3/37\n+Avivest\n(618)",
    time: "09:00-13:00\n14:00-18:00",
    operators: ["Shermuhammedov D.", "BOSITXONOV B.", "Shermuhammedov D.", "QUDRATOV X."],
    topic: "ZAXIRA.\n\"Toshkent - Humo\" xalqaro aeroporti. (Kutib olish).",
    reporters: ["O'TAYEVA S.", "SHUKUROVA R.", "HAYITOV D."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "4/15\n(782)",
    time: "09:00-18:00",
    operators: ["TO'XTASINOV M.", "FAYZIYEV F."],
    topic: "Administratsiya uchun.",
    reporters: ["QURBONOV D.", "JOVLIYEV G'."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "5",
    time: "09:30-17:00",
    operators: ["SATTOROV I."],
    topic: "Olmazor tumanida kambag'allikni qisqartirish bo'yicha bajarilgan ishlar tahlili.",
    reporters: ["HAMROYEVA O."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "6/8/12\n+Dron\n(914/361)",
    time: "14:00-18:00",
    operators: ["Saidnasimov S.", "ZAMONOV I.", "ILMURZIN A.", "RASULOV B./dron", "Turdialiyev I./dron"],
    topic: "Trassa.",
    reporters: ["MUXBIRSIZ."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "7/33\n+Avivest\n(692)",
    time: "14:00-18:00",
    operators: ["MENAYEV T.", "MAXMUDOV J."],
    topic: "\"Yangi O'zbekiston bog'i\"da gul qo'yish marosimi.",
    reporters: ["SOATOV J."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "9\n+Avivest\n(917)",
    time: "09:00-14:00\n14:00-18:00",
    operators: ["Ulug'murodov U.", "Ulug'murodov U."],
    topic: "\"Alpomish\" muz sport saroyida \"Kelajak muhandislari\" xalqaro festivali.\nZAXIRA.",
    reporters: ["QALANDAROVA M.", "NIZAMUDINOVA K.", "Xudoyberdiyeva O."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "10\n(921)",
    time: "09:30-13:00\n14:00-18:00",
    operators: ["Eshonxo'jayev F.", "Eshonxo'jayev F."],
    topic: "O'zMUda \"Global ta'lim va umuminsoniy qadriyatlar\" mavzusida xalqaro konferensiya.\nZAXIRA.",
    reporters: ["AXMADOVA G.", "RO'ZIMURODOV J."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "11\n(568)",
    time: "10:30-18:00",
    operators: ["RUSTAMOV I."],
    topic: "Senatda qo'mitalar majlisi.",
    reporters: ["YUNUSOVA M."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "17\n+Avivest\n(921)",
    time: "09:00-14:00",
    operators: ["ILMURZIN A."],
    topic: "\"Hilton\" meh.da \"Xalqaro zilzila qurbonlarini xotirlash kuni\" munosabati bilan xalqaro konferensiya.",
    reporters: ["ESHBOYEV I.", "ZARIPXAN K."]
  } ,
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "25/(2)\n(672)",
    time: "09:00-13:00\n17:00-21:00",
    operators: ["ZIKRILLAYEV A.", "ZIKRILLAYEV A.", "JO'RAYEV S."],
    topic: "Oshqozon saratonini erta aniqlashga mo'ljallangan loyiha. Tonggi dastur uchun.\n\"Merit\" meh.da \"O'zbekiston - Chexiya\" biznes-forumi. \"Axborot\" uchun.",
    reporters: ["MIRSADIQOVA A.", "MATYOQUBOVA I."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "28/36\n(917)",
    time: "17:00-21:00",
    operators: ["HAMIDOV D.", "NURMATOV B."],
    topic: "\"Merit\" meh.da \"O'zbekiston - Chexiya\" biznes-forumi. \"Tahlilnoma\" uchun.",
    reporters: ["MARDONOV J."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "31\n(624)",
    time: "10:00-13:00\n13:30-18:00",
    operators: ["LUTFULLAYEV S.", "LUTFULLAYEV S."],
    topic: "Nima uchun daraxtlar o'lchanadi. \"Fakt 24\" uchun.\nO'zMUda Nobel mukofoti laureanti bilan suhbat. Tonggi dastur uchun.",
    reporters: ["QUDRATOVA M.", "AKTAMOVA N."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "Hilton\n17/18/20/21\n(156)",
    time: "05:00-09:00",
    operators: ["XAYDAROV X.", "Abdug'afforov A.", "BOSITXONOV B."],
    topic: "Tonggi dastur: \"O'zbekiston vaqti bilan\".\nHaydovchi: (+94) 825-94-56 Farhod aka",
    reporters: ["QODIROV I./rej."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "(915)",
    time: "06:00-",
    operators: [],
    topic: "Farg'ona viloyatiga safar. (29 - 1 may).\nHaydovchi: (+99) 899-85-57 Sobir aka",
    reporters: ["QODIROV X.", "IMINOVA M.", "QOSIMOV M./rej."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "32",
    time: "",
    operators: ["KOMILOV M."],
    topic: "Xorazm viloyatiga safar. (28 - 29 aprel).",
    reporters: ["CHORIYEV SH.", "QODIROV I./rej."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "23/29/34\n+Avivest",
    time: "",
    operators: ["XOLIQULOV S.", "Abdurahmonov D.", "TOIROV B."],
    topic: "Farg'ona viloyatiga safar. (26 - 30 aprel).",
    reporters: []
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "26\n+Ronin",
    time: "",
    operators: ["ZAXIDOV M."],
    topic: "Qoraqalpog'iston Respublikasiga safar. (26 - 30 aprel).",
    reporters: ["Mambetsharipova N."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "16/19\n+Avivest",
    time: "",
    operators: ["Abdusattorov A.", "RAHMONOV S.", "SOLIBOYEV I."],
    topic: "Xorazm viloyatiga safar. (25 - 30 aprel).",
    reporters: ["QIYOSOVA A.", "REYIMOVA D."]
  },
  {
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    camera: "ASB-1",
    time: "08:00-23:30\n09:00-18:00",
    operators: ["AZIMOV E.", "RUSTAMOV E.", "SOLIBOYEV Y.", "UMAROV J."],
    topic: "Studiyada tasvirga olish jarayoni.\nStudiyada suhbat.",
    reporters: []
  }
];

const emptyDashboard = {
  week: { start: "2026-01-29", end: "2026-02-04", number: 1, title: "Hafta 1, 2026", range: "Yan 29 - Fev 4" },
  metrics: { total: 0, working: 0, rest: 0, backup: 0 },
  groups: [],
  studioToday: [],
  overviewRows: [],
  reports: [],
  notifications: [],
  attendance: { activeNow: 0, todayScans: 0, todayMinutes: 0, monthMinutes: 0, recent: [], rows: [] },
  employees: [],
  contacts: []
};

function isSuper(user) { return user?.role === "superadmin"; }
function isAdmin(user) { return user?.role === "admin" || user?.role === "superadmin"; }

function deptColor(deptName, departments) {
  const dept = departments?.find((d) => d.name === deptName);
  return dept?.color || "#94a3b8";
}

function hexToRgb(hex) {
  const h = String(hex || "#94a3b8").replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) || 148;
  const g = parseInt(h.slice(2, 4), 16) || 163;
  const b = parseInt(h.slice(4, 6), 16) || 184;
  return `${r}, ${g}, ${b}`;
}

async function api(path, options = {}) {
  const token = window.localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (response.status === 401) {
    window.localStorage.removeItem("currentUser");
    window.localStorage.removeItem("authToken");
    window.location.reload();
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Server xatosi" }));
    throw new Error(error.message || "Server xatosi");
  }

  return response.json();
}

async function apiFetch(path, options = {}) {
  const token = window.localStorage.getItem("authToken");
  const { headers: extraHeaders, ...restOptions } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(extraHeaders || {}) },
    ...restOptions
  });
  if (response.status === 401) { window.localStorage.removeItem("currentUser"); window.localStorage.removeItem("authToken"); window.location.reload(); return; }
  if (!response.ok) { const err = await response.json().catch(() => ({ message: "Server xatosi" })); throw new Error(err.message || "Server xatosi"); }
  return response.json();
}

function addDays(dateText, amount) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + amount);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readStoredJson(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function createAuthTokens(seed = "") {
  const cleanSeed = String(seed || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12) || "user";
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return {
    accessToken: `atk_${cleanSeed}_${stamp}_${random}`,
    refreshToken: `rtk_${cleanSeed}_${stamp}_${random}${Math.random().toString(36).slice(2, 6)}`
  };
}

function normalizeCurrentUser(user) {
  if (!user) return null;
  const storedTokens = readStoredJson("authTokens", {}) || {};
  return {
    name: String(user.name || "Administrator").trim() || "Administrator",
    email: String(user.email || "admin@uz24.local").trim() || "admin@uz24.local",
    role: String(user.role || "Jadval administratori").trim() || "Jadval administratori",
    avatar: user.avatar || "",
    accessToken: user.accessToken || storedTokens.accessToken || "",
    refreshToken: user.refreshToken || storedTokens.refreshToken || ""
  };
}

function persistCurrentUser(user) {
  const nextUser = normalizeCurrentUser(user);
  if (!nextUser) return null;
  window.localStorage.setItem("currentUser", JSON.stringify(nextUser));
  window.localStorage.setItem("authTokens", JSON.stringify({
    accessToken: nextUser.accessToken || "",
    refreshToken: nextUser.refreshToken || ""
  }));
  return nextUser;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Rasmni o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

function loadCanvasImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const image = new window.Image();
    if (/^https?:\/\//.test(src)) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawCoverImage(ctx, image, x, y, width, height) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  ctx.restore();
}

function departmentMeta(id) {
  return DEPARTMENTS.find((department) => department.id === id) || DEPARTMENTS[1];
}

function cleanPhone(value) {
  const phone = String(value || "").replace(/[^\d+]/g, "");
  return phone || "";
}

function telegramHref(value) {
  const telegram = String(value || "").trim();
  if (!telegram) return "";
  if (telegram.startsWith("http")) return telegram;
  return `https://t.me/${telegram.replace(/^@/, "")}`;
}

function formatDuration(minutes) {
  const total = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(total / 60);
  const minute = total % 60;
  if (!hours) return `${minute} daq`;
  return minute ? `${hours} soat ${minute} daq` : `${hours} soat`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function todayDayName() {
  const mondayBasedIndex = (new Date().getDay() + 6) % 7;
  return WEEK_DAYS[mondayBasedIndex] || "Dushanba";
}

function normalizeLookupName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9'`.\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAILY_CODE_TO_MONTHLY_STATUS = {
  I: "work", S: "studio", T: "tjk", K: "trip",
  D: "rest", M: "vacation", O: "otpiska",
  A: "administration", P: "presidential", B: "sick", U: "unpaid",
  empty: "empty"
};

function codeToMonthlyStatus(code) {
  return DAILY_CODE_TO_MONTHLY_STATUS[code] || "empty";
}

function findShootingAssignmentForEmployee(employee) {
  const target = normalizeLookupName(employee?.name);
  if (!target) return null;

  return SHOOTING_SCHEDULE.find((row) => {
    const people = [...(row.operators || []), ...(row.reporters || [])];
    return people.some((name) => {
      const normalized = normalizeLookupName(name);
      return normalized === target || normalized.includes(target) || target.includes(normalized);
    });
  }) || null;
}

function extractDriverInfo(topic) {
  return String(topic || "")
    .split("\n")
    .find((line) => line.toLowerCase().includes("haydovchi")) || "";
}

function extractCameraNumber(camera) {
  const match = String(camera || "").match(/\(([^)]+)\)/);
  if (match?.[1]) return match[1];
  const digits = String(camera || "").match(/\d+/g);
  return digits?.[digits.length - 1] || "";
}

function formatHourLabel(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value) || value <= 0) return "00:00";
  return `${String(value).padStart(2, "0")}:00`;
}

function calculateEfficiency(assignments = []) {
  const workingCount = assignments.filter((assignment) => STATUS_META[assignment.statusType]?.metric === "working").length;
  return Math.min(96, Math.max(45, 52 + workingCount * 8 + assignments.length));
}

// ─── Global confirm (replaces window.confirm) ─────────────────────────────────
let _showConfirmGlobal = null;
function showConfirm(message) {
  return new Promise((resolve) => {
    if (!_showConfirmGlobal) { resolve(window.confirm(message)); return; }
    _showConfirmGlobal(message, resolve);
  });
}

function App() {
  const [page, setPage] = useState("weekly");
  const [previousPage, setPreviousPage] = useState("weekly");
  const [weekStart, setWeekStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeDay, setActiveDay] = useState("Bugun");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Yuklanmoqda...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAllOverview, setShowAllOverview] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem("theme") || "light";
    document.documentElement.dataset.theme = saved;
    return saved;
  });
  const [currentUser, setCurrentUser] = useState(() => readStoredJson("currentUser", null));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [navDirection, setNavDirection] = useState("next");
  const [toasts, setToasts] = useState([]);
  const [confirmData, setConfirmData] = useState(null);
  const [employeeCredentials, setEmployeeCredentials] = useState(null);
  const [documentsReady, setDocumentsReady] = useState(null);
  const hasLoadedDashboard = useRef(false);
  const menuButtonRef = useRef(null);
  const notificationsButtonRef = useRef(null);
  const menuPanelRef = useRef(null);
  const notificationsPanelRef = useRef(null);

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    _showConfirmGlobal = (message, resolve) => setConfirmData({ message, resolve });
    return () => { _showConfirmGlobal = null; };
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const pf = window.__pf?.dept;
      if (pf) { window.__pf.dept = null; const r = await pf; const data = r.ok ? await r.json() : await api("/api/departments"); setDepartments(data?.departments || []); }
      else { const data = await api("/api/departments"); setDepartments(data?.departments || []); }
    } catch {}
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!hasLoadedDashboard.current) setLoading(true);
    setError("");
    try {
      let data;
      const pf = window.__pf?.dash;
      if (pf && !hasLoadedDashboard.current) {
        window.__pf.dash = null;
        const r = await pf;
        data = r.ok ? await r.json() : await api(`/api/dashboard?weekStart=${weekStart}`);
      } else {
        data = await api(`/api/dashboard?weekStart=${weekStart}`);
      }
      setDashboard(data);
    } catch (loadError) {
      setError(loadError.message);
      notify(loadError.message, "error");
    } finally {
      hasLoadedDashboard.current = true;
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!currentUser) return;
    loadDepartments();
  }, [currentUser, loadDepartments]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api("/api/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser, loadNotifications]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadDashboard();
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser, loadDashboard]);

  useEffect(() => {
    if (page === "monthly") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [page]);

  useEffect(() => {
    if (!menuOpen && !notificationsOpen) return undefined;

    function closeFloatingPanels(event) {
      const target = event.target;
      const clickedInsideMenu = menuPanelRef.current?.contains(target) || menuButtonRef.current?.contains(target);
      const clickedInsideNotifications = notificationsPanelRef.current?.contains(target) || notificationsButtonRef.current?.contains(target);
      if (!clickedInsideMenu) setMenuOpen(false);
      if (!clickedInsideNotifications) setNotificationsOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setNotificationsOpen(false);
    }

    document.addEventListener("pointerdown", closeFloatingPanels);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFloatingPanels);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen, notificationsOpen]);

  function handleAuth(user, token) {
    const userData = {
      id: user.id,
      name: user.fullName,
      username: user.username,
      role: user.role,
      email: `${user.username}@uz24.local`,
      avatar: "",
      ...(user.employeeId != null ? { employeeId: user.employeeId } : {})
    };
    window.localStorage.setItem("currentUser", JSON.stringify(userData));
    window.localStorage.setItem("authToken", token);
    setCurrentUser(userData);
  }

  function updateCurrentUser(nextUser) {
    const mergedUser = persistCurrentUser({
      ...(currentUser || {}),
      ...nextUser,
      accessToken: currentUser?.accessToken || "",
      refreshToken: currentUser?.refreshToken || ""
    });
    setCurrentUser(mergedUser);
    notify("Profil ma'lumotlari saqlandi");
  }

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  function performLogout() {
    setShowLogoutConfirm(false);
    window.localStorage.removeItem("currentUser");
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("authTokens");
    setCurrentUser(null);
    setPage("weekly");
    notify("Tizimdan chiqildi", "info");
  }

  function openMonthly(fromPage = page) {
    setPreviousPage(fromPage || "weekly");
    setPage("monthly");
  }

  function closeMonthly() {
    setPage(previousPage || "weekly");
  }

  async function createSchedule() {
    setLoadingMessage("Jadval yaratilmoqda...");
    setGenerating(true);
    setError("");

    try {
      const nextDashboard = await api("/api/schedules/generate", {
        method: "POST",
        body: JSON.stringify({ weekStart })
      });
      setDashboard(nextDashboard);
      setActiveDay("Bugun");
      notify("Jadval muvaffaqiyatli yaratildi");
    } catch (generateError) {
      setError(generateError.message);
      notify(generateError.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function deleteSchedule() {
    if (!await showConfirm("Ushbu hafta jadvalini o'chirasizmi?")) return;
    setLoadingMessage("Jadval o'chirilmoqda...");
    setGenerating(true);
    setError("");

    try {
      await api(`/api/schedules/${weekStart}`, { method: "DELETE" });
      await loadDashboard();
      notify("Haftalik jadval o'chirildi");
    } catch (deleteError) {
      setError(deleteError.message);
      notify(deleteError.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function saveEmployee(employee) {
    if (!String(employee.name || "").trim()) {
      notify("F.I.Sh ni kiriting.", "error");
      return false;
    }
    if (!String(employee.role || "").trim()) {
      notify("Lavozimni kiriting.", "error");
      return false;
    }
    if (!String(employee.phone || "").trim()) {
      notify("Telefon raqamini kiriting.", "error");
      return false;
    }

    setLoadingMessage(employee.id ? "Xodim saqlanmoqda..." : "Xodim qo'shilmoqda...");
    setGenerating(true);
    setError("");

    try {
      if (employee.id) {
        await api(`/api/employees/${employee.id}`, { method: "PUT", body: JSON.stringify(employee) });
      } else {
        const created = await api("/api/employees", { method: "POST", body: JSON.stringify(employee) });
        if (created?.id) {
          setDocumentsReady(employeeDocumentModel(created));
        }
        if (created?.generatedLogin?.pin) {
          setEmployeeCredentials({
            fullName: employee.name,
            username: created.generatedLogin.username,
            pin: created.generatedLogin.pin,
          });
        }
      }
      await loadDashboard();
      notify(employee.id ? "Xodim ma'lumotlari saqlandi" : "Yangi xodim qo'shildi");
      return true;
    } catch (saveError) {
      setError(saveError.message);
      notify(saveError.message, "error");
      return false;
    } finally {
      setGenerating(false);
    }
  }

  async function deleteEmployee(id) {
    if (!await showConfirm("Xodimni ro'yxatdan o'chirasizmi?")) return;
    setLoadingMessage("Xodim o'chirilmoqda...");
    setGenerating(true);
    setError("");
    try {
      await api(`/api/employees/${id}`, { method: "DELETE" });
      await loadDashboard();
      notify("Xodim ro'yxatdan o'chirildi");
    } catch (deleteError) {
      setError(deleteError.message);
      notify(deleteError.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function updateStatus(groupId, personId, statusType) {
    setError("");

    try {
      setDashboard(await api(`/api/schedules/${weekStart}/status`, {
        method: "PUT",
        body: JSON.stringify({ groupId, personId, statusType })
      }));
      notify("Xodim statusi yangilandi");
    } catch (statusError) {
      setError(statusError.message);
      notify(statusError.message, "error");
    }
  }

  async function scanAttendance(employeeId) {
    setError("");

    try {
      const result = await api("/api/attendance/scan", {
        method: "POST",
        body: JSON.stringify({ employeeId, weekStart })
      });
      setDashboard(result.dashboard);
      notify(result.action === "checkin" ? "Face ID kirish vaqtini yozdi" : "Face ID chiqish vaqtini yozdi");
    } catch (scanError) {
      setError(scanError.message);
      notify(scanError.message, "error");
    }
  }

  async function saveContact(contact) {
    if (!String(contact.name || "").trim()) {
      notify(contact.type === "Haydovchi" ? "Shofyor F.I.Sh ni kiriting." : "Muxbir F.I.Sh ni kiriting.", "error");
      return false;
    }
    if (contact.type === "Haydovchi" && !String(contact.vehicle || "").trim()) {
      notify("Mashina raqamini kiriting.", "error");
      return false;
    }
    if (!String(contact.phone || "").trim()) {
      notify("Telefon raqamini kiriting.", "error");
      return false;
    }

    setLoadingMessage("Kontakt saqlanmoqda...");
    setGenerating(true);
    setError("");

    try {
      const result = await api("/api/contacts", {
        method: "POST",
        body: JSON.stringify(contact)
      });
      setDashboard((current) => ({ ...current, contacts: result.contacts }));
      notify("Kontakt saqlandi");
      return true;
    } catch (contactError) {
      setError(contactError.message);
      notify(contactError.message, "error");
      return false;
    } finally {
      setGenerating(false);
    }
  }

  async function deleteContact(id) {
    setLoadingMessage("Kontakt o'chirilmoqda...");
    setGenerating(true);
    setError("");

    try {
      const result = await api(`/api/contacts/${encodeURIComponent(id)}`, { method: "DELETE" });
      setDashboard((current) => ({ ...current, contacts: result.contacts }));
      notify("Kontakt o'chirildi");
    } catch (contactError) {
      setError(contactError.message);
      notify(contactError.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function addStudioSchedule(payload) {
    setLoadingMessage("Jadval qo'shilmoqda...");
    setGenerating(true);
    setError("");

    try {
      setDashboard(await api(`/api/schedules/${weekStart}/groups`, {
        method: "POST",
        body: JSON.stringify(payload)
      }));
      setActiveDay("Bugun");
      notify("Yangi smena jadvalga qo'shildi");
      return true;
    } catch (scheduleError) {
      setError(scheduleError.message);
      notify(scheduleError.message, "error");
      return false;
    } finally {
      setGenerating(false);
    }
  }

  function moveWeek(days) {
    setNavDirection(days < 0 ? "prev" : "next");
    setWeekStart((value) => addDays(value, days));
    setActiveDay("Bugun");
    setShowAllOverview(false);
  }

  const title = useMemo(() => {
    if (page === "studio") return "Jamoa";
    if (page === "documents") return "Hujjatlar";
    if (page === "monthly") return "Oylik grafik";
    if (page === "shooting") return "Tasvir jadvali";
    if (page === "reports") return "Hisobotlar";
    if (page === "audit") return "Audit jurnal";
    if (page === "profile") return "Profil";
    if (page === "users") return "Foydalanuvchilar";
    if (page === "tasks") return "Vazifalar";
    if (page === "bloknot") return "Bloknot";
    return "Ish jadvali";
  }, [page]);

  if (!currentUser) {
    return (
      <>
        <AuthPage onAuth={handleAuth} onNotify={notify} />
        <ToastViewport items={toasts} />
        <ConfirmModal data={confirmData} onClose={() => setConfirmData(null)} />
      </>
    );
  }

  const sidebarLinks = [
    ["weekly", "Ish jadvali", CalendarDays],
    ["studio", "Jamoa va bo'limlar", UsersRound],
    ["documents", "Hujjatlar", ShieldCheck],
    ["monthly", "Oylik grafik", Clock3],
    ["shooting", "Tasvir jadvali", FileText],
    ["reports", "Hisobotlar", ChartColumn],
    ["tasks", "Vazifalar", BriefcaseBusiness],
    ...(isAdmin(currentUser) ? [["audit", "Audit jurnal", ShieldCheck]] : []),
    ...(isSuper(currentUser) ? [["users", "Foydalanuvchilar", UserCheck]] : []),
    ["bloknot", "Bloknot", BookOpen],
    ["profile", "Profil", User]
  ];

  return (
    <div className="app-shell">
      {generating && <LoadingScreen message={loadingMessage} />}

      <aside className="desktop-sidebar">
        <div className="desktop-sidebar-brand">
          <img src="/logo.jpg" alt="O'zbekiston 24"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <nav className="desktop-sidebar-nav">
          {sidebarLinks.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={`desktop-sidebar-btn${page === id ? " active" : ""}`}
              onClick={() => { if (id === "monthly") openMonthly(); else setPage(id); }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
          <button
            type="button"
            className="desktop-sidebar-btn desktop-sidebar-theme-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </nav>
        <div className="desktop-sidebar-user">
          <span className="avatar avatar-sm avatar-initials" style={{ backgroundColor: "#6366f1" }}>
            {currentUser.name?.charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role}</span>
          </div>
        </div>
      </aside>

      <div className="desktop-main">
        <header className="topbar">
          <button ref={menuButtonRef} className="icon-button" type="button" aria-label="Menyu" onClick={() => {
            setMenuOpen((value) => !value);
            setNotificationsOpen(false);
          }}>
            <Menu size={23} />
          </button>
          <div className="topbar-brand">
            <img
              src="/logo.jpg"
              alt="O'zbekiston 24"
              className="topbar-logo"
              onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
            <span className="topbar-logo-fallback" style={{ display: "none" }}>
              O'Z<strong>24</strong>
            </span>
          </div>
          <button ref={notificationsButtonRef} className="icon-button notification-bell" type="button" aria-label="Bildirishnomalar" onClick={() => {
            setNotificationsOpen((value) => !value);
            setMenuOpen(false);
          }}>
            <Bell size={20} fill="currentColor" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </button>
        </header>

        {menuOpen && <MenuPanel panelRef={menuPanelRef} onClose={() => setMenuOpen(false)} onPageChange={setPage} onOpenMonthly={openMonthly} currentUser={currentUser} theme={theme} onThemeChange={setTheme} />}
        {notificationsOpen && (
          <NotificationsPanel
            panelRef={notificationsPanelRef}
            notifications={notifications}
            onMarkRead={async (id) => {
              await api(`/api/notifications/${id}/read`, { method: "PATCH" });
              loadNotifications();
            }}
            onMarkAllRead={async () => {
              await api("/api/notifications/read-all", { method: "PATCH" });
              loadNotifications();
            }}
          />
        )}

        <main className="content">
          {error && <div className="error-banner">{error}</div>}
          {loading ? (
            <SkeletonPage />
          ) : (
            <>
              {page === "weekly" && (
                <WeeklyPage
                  activeDay={activeDay}
                  currentUser={currentUser}
                  dashboard={dashboard}
                  onCreate={createSchedule}
                  onDeleteSchedule={deleteSchedule}
                  onDayChange={setActiveDay}
                  onOpenMonthly={openMonthly}
                  onStatusChange={updateStatus}
                />
              )}
              {page === "studio" && (
                <StudioPage
                  currentUser={currentUser}
                  departments={departments}
                  onLoadDepartments={loadDepartments}
                  dashboard={dashboard}
                  showAllOverview={showAllOverview}
                  onCreate={createSchedule}
                  onAddSchedule={addStudioSchedule}
                  onDeleteEmployee={deleteEmployee}
                  onSaveEmployee={saveEmployee}
                  onScanAttendance={scanAttendance}
                  onNotify={notify}
                  onMoveWeek={moveWeek}
                  navDirection={navDirection}
                  onToggleOverview={() => setShowAllOverview((value) => !value)}
                  onOpenMonthly={openMonthly}
                />
              )}
              {page === "monthly" && <MonthlyErrorBoundary onClose={closeMonthly}><MonthlyPage dashboard={dashboard} weekStart={weekStart} fullscreen onClose={closeMonthly} currentUser={currentUser} onNotify={notify} /></MonthlyErrorBoundary>}
              {page === "documents" && <DocumentsPage employees={dashboard.employees} onNotify={notify} onSaveEmployee={saveEmployee} currentUser={currentUser} />}
              {page === "shooting" && <ShootingPage onNotify={notify} currentUser={currentUser} />}
              {page === "reports" && <ReportsPage dashboard={dashboard} departments={departments} />}
              {page === "tasks" && (
                <VazifalarPage currentUser={currentUser} onNotify={notify} onNotificationsRefresh={loadNotifications} />
              )}
              {page === "audit" && <AuditPage />}
              {page === "bloknot" && <BlotknotPage currentUser={currentUser} onNotify={notify} />}
              {page === "users" && isSuper(currentUser) && (
                <UsersPage currentUser={currentUser} employees={dashboard.employees} onNotify={notify} />
              )}
              {page === "profile" && (
                <ProfilePage
                  currentUser={currentUser}
                  dashboard={dashboard}
                  notificationsEnabled={notificationsOpen}
                  theme={theme}
                  onLogout={handleLogout}
                  onRefresh={loadDashboard}
                  onThemeChange={setTheme}
                  onUpdateUser={updateCurrentUser}
                  onSaveEmployee={saveEmployee}
                  onNotify={notify}
                  onSaveContact={saveContact}
                  onDeleteContact={deleteContact}
                />
              )}
            </>
          )}
        </main>

        <BottomNav page={page} onPageChange={setPage} />
      </div>

      <ToastViewport items={toasts} />
      <ConfirmModal data={confirmData} onClose={() => setConfirmData(null)} />

      {showLogoutConfirm && createPortal((
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setShowLogoutConfirm(false)}>
          <div className="schedule-modal logout-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-confirm-body">
              <span className="logout-confirm-icon">👋</span>
              <h3>Chiqish</h3>
              <p>Haqiqatan ham tizimdan chiqmoqchimisiz?</p>
            </div>
            <div className="logout-confirm-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowLogoutConfirm(false)}>Bekor</button>
              <button type="button" className="btn-danger" onClick={performLogout}>
                <LogOut size={15} />
                Chiqish
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {employeeCredentials && createPortal((
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEmployeeCredentials(null)}>
          <div className="schedule-modal pin-reveal-modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Xodim uchun kirish PIN kodi</strong>
              <button type="button" className="modal-close-btn" onClick={() => setEmployeeCredentials(null)}>✕</button>
            </div>
            <p className="pin-reveal-name">{employeeCredentials.fullName} <span>@{employeeCredentials.username}</span></p>
            <div className="pin-reveal-code">{employeeCredentials.pin}</div>
            <p className="pin-reveal-warning">
              Bu PIN faqat hozir ko'rsatilmoqda — keyin qayta ko'rib bo'lmaydi. Uni xodimga yozib/aytib qo'ying.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(employeeCredentials.pin).catch(() => {});
                  notify("PIN nusxalandi");
                }}
              >
                Nusxalash
              </button>
              <button type="button" className="btn-primary" onClick={() => setEmployeeCredentials(null)}>Yopish</button>
            </div>
          </div>
        </div>
      ), document.body)}
      {documentsReady && createPortal((
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setDocumentsReady(null)}>
          <div className="schedule-modal pin-reveal-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Xodim hujjatlari tayyor</strong>
              <button type="button" className="modal-close-btn" onClick={() => setDocumentsReady(null)}>✕</button>
            </div>
            <p className="pin-reveal-name">{documentsReady.name} <span>{documentsReady.role}</span></p>
            <p className="pin-reveal-warning">
              Yangi xodim uchun Word, Excel va JPEG hujjatlari avtomatik shakllantirildi. Kerakli formatni tanlab yuklab oling.
            </p>
            <div className="document-view-actions">
              <button type="button" onClick={() => downloadBlob(buildDocxBlob(documentsReady), `${safeFileName(documentsReady.name)}.docx`)}>
                <FileText size={16} />
                Word
              </button>
              <button type="button" onClick={() => downloadBlob(buildXlsxBlob(documentsReady), `${safeFileName(documentsReady.name)}.xlsx`)}>
                <FileSpreadsheet size={16} />
                Excel
              </button>
              <button type="button" onClick={() => buildEmployeeJpegBlob(documentsReady).then((blob) => { if (blob) downloadBlob(blob, `${safeFileName(documentsReady.name)}.jpg`); })}>
                <Image size={16} />
                JPEG
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={() => setDocumentsReady(null)}>Yopish</button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}

function DepartmentTabs({ departments, active, onChange, currentUser, onManage }) {
  return (
    <div className="dept-tabs-wrapper">
      <div className="dept-tabs">
        <button
          type="button"
          className={`dept-tab${active === "all" ? " active" : ""}`}
          style={active === "all"
            ? { backgroundColor: "#6366f1", borderColor: "#6366f1", color: "#fff" }
            : { borderColor: "#6366f1", color: "#6366f1" }}
          onClick={() => onChange("all")}
        >
          Hammasi
        </button>
        {departments.map((dept) => (
          <button
            key={dept.id}
            type="button"
            className={`dept-tab${active === dept.name ? " active" : ""}`}
            style={active === dept.name
              ? { backgroundColor: dept.color, borderColor: dept.color, color: "#fff" }
              : { borderColor: dept.color, color: dept.color }}
            onClick={() => onChange(dept.name)}
          >
            {dept.label}
          </button>
        ))}
      </div>
      {isSuper(currentUser) && (
        <button
          type="button"
          className="dept-manage-btn"
          onClick={onManage}
          title="Bo'limlarni boshqarish"
          aria-label="Bo'limlarni boshqarish"
        >
          ⚙️
        </button>
      )}
    </div>
  );
}

const DEPT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#84cc16", "#a855f7"
];

function DepartmentManagerModal({ departments, onClose, onSave, onDelete, onNotify }) {
  const [draft, setDraft] = useState({ label: "", color: "#6366f1" });
  const [loading, setLoading] = useState(false);

  function toSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 20)
      .replace(/^_+|_+$/g, "");
  }

  async function addDept(event) {
    event.preventDefault();
    if (!draft.label.trim()) {
      onNotify("Bo'lim nomini kiriting", "error");
      return;
    }
    setLoading(true);
    try {
      await api("/api/departments", {
        method: "POST",
        body: JSON.stringify({
          name: toSlug(draft.label),
          label: draft.label.trim(),
          color: draft.color
        })
      });
      setDraft({ label: "", color: "#6366f1" });
      onSave();
      onNotify("Bo'lim qo'shildi");
    } catch (err) {
      onNotify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDept(dept) {
    if (!await showConfirm(`"${dept.label}" bo'limini o'chirasizmi?`)) return;
    try {
      await api(`/api/departments/${dept.id}`, { method: "DELETE" });
      onDelete();
      onNotify("Bo'lim o'chirildi");
    } catch (err) {
      onNotify(err.message, "error");
    }
  }

  return createPortal((
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Bo'limlarni boshqarish" onClick={onClose}>
      <div className="schedule-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <span className="modal-handle" />
        <div className="modal-head">
          <strong>Bo'limlarni boshqarish</strong>
          <button type="button" onClick={onClose}>
            <LogOut size={15} />
            Chiqish
          </button>
        </div>

        <div className="dept-list">
          {departments.map((dept) => (
            <div key={dept.id} className="dept-list-row">
              <span className="dept-color-dot" style={{ backgroundColor: dept.color }} />
              <strong style={{ fontSize: "0.88rem" }}>{dept.label}</strong>
              <span className="dept-slug">@{dept.name}</span>
              <button
                type="button"
                className="dept-delete-btn"
                onClick={() => deleteDept(dept)}
                title="O'chirish"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <form className="dept-add-form" onSubmit={addDept}>
          <strong>Yangi bo'lim qo'shish</strong>
          <label>
            Bo'lim nomi
            <input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="Masalan: Montaj bo'limi"
            />
          </label>
          <div className="color-picker">
            <span>Rang:</span>
            {DEPT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-dot${draft.color === color ? " selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setDraft({ ...draft, color })}
                aria-label={color}
              />
            ))}
          </div>
          {draft.label.trim() && (
            <div className="dept-preview">
              <span>Ko'rinishi:</span>
              <button
                type="button"
                className="dept-tab active"
                style={{ backgroundColor: draft.color, borderColor: draft.color, color: "#fff" }}
              >
                {draft.label}
              </button>
            </div>
          )}
          <button type="submit" disabled={loading}>
            <Plus size={15} />
            {loading ? "Qo'shilmoqda..." : "Qo'shish"}
          </button>
        </form>
      </div>
    </div>
  ), document.body);
}

const PIN_LENGTH = 8;
const PIN_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

function AuthPage({ onAuth, onNotify }) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function submitPin(value) {
    setLoading(true);
    try {
      // To'g'ridan-to'g'ri fetch — umumiy api() yordamchisi har qanday 401 javobini
      // "sessiya tugagan" deb hisoblab sahifani qayta yuklaydi, bu esa noto'g'ri
      // PIN xabarini ko'rsatishga to'sqinlik qiladi.
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ pin: value })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error("wrong-pin");
      setTimeout(() => {
        onAuth(data.user, data.token);
        onNotify(`Xush kelibsiz, ${data.user.fullName}! ✅`, "success");
      }, 700);
    } catch (err) {
      onNotify("PIN kod noto'g'ri ❌", "error");
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 320);
      setLoading(false);
    }
  }

  function pressKey(key) {
    if (loading || key === "") return;
    if (key === "del") {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    setPin((prev) => {
      if (prev.length >= PIN_LENGTH) return prev;
      const next = prev + key;
      if (next.length === PIN_LENGTH) setTimeout(() => submitPin(next), 150);
      return next;
    });
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel pin-auth-panel">
        <div className="auth-brand">
          <img src="/logo.jpg" alt="O'zbekiston 24" className="auth-logo" onError={(e) => { e.target.style.display = "none"; }} />
          <div>
            <strong>O'zbekiston 24</strong>
            <p>Ish jadvali boshqaruvi</p>
          </div>
        </div>

        <p className="pin-hint">8 xonali PIN kodingizni kiriting</p>

        <div className={`pin-display${shake ? " pin-shake" : ""}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <React.Fragment key={i}>
              {i === 4 && <span className="pin-dash">—</span>}
              <span className={`pin-dot${i < pin.length ? " filled" : ""}`}>
                {i < pin.length ? (showPin ? pin[i] : "•") : ""}
              </span>
            </React.Fragment>
          ))}
        </div>

        <button type="button" className="pin-show-toggle" onClick={() => setShowPin((v) => !v)}>
          {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPin ? "PINni yashirish" : "PINni ko'rsatish"}
        </button>

        <div className="pin-keyboard">
          {PIN_KEYS.map((key, i) => (
            <button
              key={i}
              type="button"
              className={`pin-key${key === "del" ? " pin-key-del" : ""}${key === "" ? " pin-key-empty" : ""}`}
              onClick={() => pressKey(key)}
              disabled={loading || key === ""}
            >
              {key === "del" ? "⌫" : key}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function safeFileName(value) {
  return String(value || "xodim")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "xodim";
}

function employeeDocumentModel(employee, assignments = []) {
  const department = departmentMeta(employee.department);
  const portfolio = employee.portfolio || [];
  const activeAssignments = assignments.filter((assignment) => STATUS_META[assignment.statusType]?.metric === "working");
  const restAssignments = assignments.filter((assignment) => STATUS_META[assignment.statusType]?.metric === "rest");
  const documents = employee.documents || {};
  const passportInfo = documents.passportInfo || {};
  const hasPassportInfo = ["series", "number", "pinfl", "birthDate", "issuedBy", "issuedDate", "expiryDate"]
    .some((key) => String(passportInfo[key] || "").trim());

  return {
    id: employee.id,
    name: employee.name || "Xodim",
    role: employee.role || "Operator",
    department: department.label,
    departmentShort: department.shortLabel,
    phone: employee.phone || "Kiritilmagan",
    telegram: employee.telegram || "Kiritilmagan",
    status: "Faol",
    generatedAt: new Date().toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" }),
    assignments,
    portfolio,
    photo: documents.photo3x4 || "",
    passportScan: documents.passportUz || documents.passportForeign || "",
    address: employee.address || "",
    summary: [
      ["Xodim ID", `EMP-${String(employee.id || 0).padStart(3, "0")}`],
      ["F.I.Sh", employee.name || "Kiritilmagan"],
      ["Lavozim", employee.role || "Kiritilmagan"],
      ["Bo'lim", department.label],
      ["Telefon", employee.phone || "Kiritilmagan"],
      ["Telegram", employee.telegram || "Kiritilmagan"],
      ["Manzil", employee.address || "Kiritilmagan"],
      ["Holat", "Faol"],
      ["Haftalik smenalar", `${assignments.length} ta`],
      ["Ishdagi smenalar", `${activeAssignments.length} ta`],
      ["Dam/ta'til", `${restAssignments.length} ta`],
      ["Portfolio", `${portfolio.length} ta video`]
    ],
    passport: hasPassportInfo ? [
      ["Seriya va raqam", `${passportInfo.series || ""} ${passportInfo.number || ""}`.trim() || "Kiritilmagan"],
      ["JSHSHIR", passportInfo.pinfl || "Kiritilmagan"],
      ["Tug'ilgan sana", passportInfo.birthDate || "Kiritilmagan"],
      ["Bergan organ", passportInfo.issuedBy || "Kiritilmagan"],
      ["Berilgan sana", passportInfo.issuedDate || "Kiritilmagan"],
      ["Amal qilish muddati", passportInfo.expiryDate || "Kiritilmagan"]
    ] : []
  };
}

function crc32(bytes) {
  let crc = -1;
  for (let index = 0; index < bytes.length; index += 1) {
    crc ^= bytes[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value, true);
}

function createZipBlob(files, type) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const checksum = crc32(data);
    const header = new Uint8Array(30 + name.length);
    const view = new DataView(header.buffer);
    writeUint32(view, 0, 0x04034b50);
    writeUint16(view, 4, 20);
    writeUint16(view, 6, 0);
    writeUint16(view, 8, 0);
    writeUint32(view, 14, checksum);
    writeUint32(view, 18, data.length);
    writeUint32(view, 22, data.length);
    writeUint16(view, 26, name.length);
    header.set(name, 30);
    chunks.push(header, data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, data.length);
    writeUint32(centralView, 24, data.length);
    writeUint16(centralView, 28, name.length);
    writeUint32(centralView, 42, offset);
    centralHeader.set(name, 46);
    central.push(centralHeader);
    offset += header.length + data.length;
  });

  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);

  return new Blob([...chunks, ...central, end], { type });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildDocxBlob(model) {
  const rows = model.summary.map(([label, value]) => `
    <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(label)}</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>${escapeXml(value)}</w:t></w:r></w:p></w:tc></w:tr>`).join("");
  const assignmentRows = model.assignments.length ? model.assignments.map((assignment) => `
    <w:tr><w:tc><w:p><w:r><w:t>${escapeXml(assignment.groupTitle || assignment.day || "-")}</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>${escapeXml(assignment.groupMeta || "-")}</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>${escapeXml(assignment.time || "-")}</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>${escapeXml(STATUS_META[assignment.statusType]?.label || assignment.status || "-")}</w:t></w:r></w:p></w:tc></w:tr>`).join("") : `
    <w:tr><w:tc><w:p><w:r><w:t>Haftalik smena topilmadi</w:t></w:r></w:p></w:tc><w:tc/><w:tc/><w:tc/></w:tr>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>Xodim shaxsiy ma'lumotnomasi</w:t></w:r></w:p>
      <w:p><w:r><w:t>${escapeXml(model.name)} - ${escapeXml(model.role)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>Generatsiya qilingan: ${escapeXml(model.generatedAt)}</w:t></w:r></w:p>
      <w:tbl>${rows}</w:tbl>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Haftalik smena ma'lumotlari</w:t></w:r></w:p>
      <w:tbl>${assignmentRows}</w:tbl>
      <w:p><w:r><w:t>Hujjat tizim tomonidan avtomatik shakllantirildi.</w:t></w:r></w:p>
    </w:body>
  </w:document>`;

  return createZipBlob([
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
    { name: "word/document.xml", content: documentXml },
    { name: "docProps/core.xml", content: `<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${escapeXml(model.name)}</dc:title><dc:creator>Ish jadvali dashboard</dc:creator></cp:coreProperties>` },
    { name: "docProps/app.xml", content: `<?xml version="1.0" encoding="UTF-8"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Ish jadvali dashboard</Application></Properties>` }
  ], "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}

function buildXlsxBlob(model) {
  const rows = [
    ["Maydon", "Qiymat"],
    ...model.summary,
    [],
    ["Smena", "Bo'lim", "Vaqt", "Status"],
    ...(model.assignments.length ? model.assignments.map((assignment) => [
      assignment.groupTitle || assignment.day || "-",
      assignment.groupMeta || "-",
      assignment.time || "-",
      STATUS_META[assignment.statusType]?.label || assignment.status || "-"
    ]) : [["Haftalik smena topilmadi", "-", "-", "-"]])
  ];
  const rowXml = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, cellIndex) => {
    const column = String.fromCharCode(65 + cellIndex);
    return `<c r="${column}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`;
  }).join("")}</row>`).join("");

  return createZipBlob([
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
    { name: "xl/workbook.xml", content: `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Xodim" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
    { name: "xl/worksheets/sheet1.xml", content: `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>` },
    { name: "docProps/core.xml", content: `<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${escapeXml(model.name)}</dc:title><dc:creator>Ish jadvali dashboard</dc:creator></cp:coreProperties>` },
    { name: "docProps/app.xml", content: `<?xml version="1.0" encoding="UTF-8"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Ish jadvali dashboard</Application></Properties>` }
  ], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

async function buildEmployeeJpegBlob(model, docFiles = []) {
  const width = 1080;
  const DOC_CAT_LABELS = {
    "photo3x4": "3×4 rasm",
    "passport-front": "Pasport — old tomoni",
    "passport-back": "Pasport — orqa tomoni",
    "intpassport-front": "Xorijiy pasport — old",
    "intpassport-back": "Xorijiy pasport — orqa",
    "other": "Hujjat"
  };
  const DOC_CAT_ORDER = ["photo3x4", "passport-front", "passport-back", "intpassport-front", "intpassport-back", "other"];

  // Load uploaded document images (sorted by category order, skip non-images)
  const loadedDocImgs = [];
  for (const cat of DOC_CAT_ORDER) {
    const catFiles = docFiles.filter((f) => f.type === "image" && (f.category === cat || (!f.category && cat === "other")));
    for (const file of catFiles) {
      const img = await loadCanvasImage(`${file.url}?t=${Date.now()}`);
      if (img) loadedDocImgs.push({ img, label: DOC_CAT_LABELS[cat] || "Hujjat" });
    }
  }

  // Pre-calculate layout for dynamic canvas height
  const photoY = 248;
  const photoWidth = 210;
  const photoHeight = 280;
  const infoEndY = photoY + 34 + model.summary.length * 40;
  let preY = Math.max(photoY + photoHeight, infoEndY) + 50;
  preY += 42 + 50; // divider → title → first item
  preY += model.passport.length ? model.passport.length * 46 : 46;

  const DOC_COL_W = (width - 192 - 16) / 2; // 436px per col
  const DOC_IMG_H = 270;
  const DOC_LBL_H = 28;
  const DOC_CELL_H = DOC_LBL_H + DOC_IMG_H;
  const DOC_GAP = 12;
  const DOC_ROWS = Math.ceil(loadedDocImgs.length / 2);
  const DOC_SECTION_H = loadedDocImgs.length > 0 ? (16 + 42 + 36 + DOC_ROWS * (DOC_CELL_H + DOC_GAP)) : 0;
  const FOOTER_H = 110;

  const height = Math.max(1350, preY + DOC_SECTION_H + FOOTER_H);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#0f172a");
  background.addColorStop(1, "#1e293b");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(48, 48, width - 96, height - 96);
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(48, 48, width - 96, 12);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 42px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(model.name, 96, 148);

  ctx.fillStyle = "#2563eb";
  ctx.font = "600 26px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(`${model.role} • ${model.departmentShort || model.department}`, 96, 186);

  ctx.strokeStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.moveTo(96, 214);
  ctx.lineTo(width - 96, 214);
  ctx.stroke();

  const photoX = 96;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
  const photo = await loadCanvasImage(model.photo);
  if (photo) {
    drawCoverImage(ctx, photo, photoX, photoY, photoWidth, photoHeight);
  } else {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 20px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("3x4 rasm yo'q", photoX + photoWidth / 2, photoY + photoHeight / 2);
    ctx.textAlign = "left";
  }
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);

  const infoX = photoX + photoWidth + 40;
  let y = photoY + 34;
  model.summary.forEach(([label, value]) => {
    ctx.fillStyle = "#64748b";
    ctx.font = "400 22px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(label, infoX, y);
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 22px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(String(value), infoX + 210, y);
    y += 40;
  });

  let sectionY = Math.max(photoY + photoHeight, y) + 50;
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(96, sectionY);
  ctx.lineTo(width - 96, sectionY);
  ctx.stroke();

  sectionY += 42;
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 28px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Pasport ma'lumotlari", 96, sectionY);

  sectionY += 50;
  if (model.passport.length) {
    model.passport.forEach(([label, value]) => {
      ctx.fillStyle = "#64748b";
      ctx.font = "400 24px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(label, 96, sectionY);
      ctx.fillStyle = "#0f172a";
      ctx.font = "600 24px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(String(value), 380, sectionY);
      sectionY += 46;
    });
  } else {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 23px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("Pasport ma'lumotlari kiritilmagan", 96, sectionY);
    sectionY += 46;
  }

  // ── Uploaded document photos section ──
  if (loadedDocImgs.length > 0) {
    sectionY += 16;
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(96, sectionY);
    ctx.lineTo(width - 96, sectionY);
    ctx.stroke();

    sectionY += 42;
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("Yuklangan hujjat rasmlari", 96, sectionY);
    sectionY += 36;

    loadedDocImgs.forEach(({ img, label }, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cellX = 96 + col * (DOC_COL_W + 16);
      const cellY = sectionY + row * (DOC_CELL_H + DOC_GAP);

      // Label strip
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(cellX, cellY, DOC_COL_W, DOC_LBL_H);
      ctx.fillStyle = "#475569";
      ctx.font = "500 17px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(label, cellX + 8, cellY + 20);

      // Image
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(cellX, cellY + DOC_LBL_H, DOC_COL_W, DOC_IMG_H);
      drawCoverImage(ctx, img, cellX, cellY + DOC_LBL_H, DOC_COL_W, DOC_IMG_H);

      // Border
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cellX, cellY, DOC_COL_W, DOC_CELL_H);
    });
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 22px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(`Generatsiya qilingan: ${model.generatedAt}`, 96, height - 80);
  ctx.fillText("Hujjat tizim tomonidan avtomatik shakllantirildi.", 96, height - 50);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92));
}

function downloadEmployeeFiles(employee, assignments = []) {
  const model = employeeDocumentModel(employee, assignments);
  const fileName = safeFileName(model.name);
  downloadBlob(buildDocxBlob(model), `${fileName}.docx`);
  window.setTimeout(() => downloadBlob(buildXlsxBlob(model), `${fileName}.xlsx`), 120);
  window.setTimeout(() => {
    buildEmployeeJpegBlob(model).then((blob) => {
      if (blob) downloadBlob(blob, `${fileName}.jpg`);
    });
  }, 240);
}

function ShootingPage({ onNotify, currentUser }) {
  const adminMode = ["admin", "superadmin"].includes(currentUser?.role);
  const blankRow = {
    camera: "",
    time: "",
    operatorsText: "",
    topic: "",
    reportersText: "",
    equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport"
  };
  const [rows, setRows] = useState(() => SHOOTING_SCHEDULE.map((row) => ({
    ...row,
    equipment: row.equipment || "HD jamlanmasi, mikrofon, chiroq, avtotransport",
    operatorsText: row.operators.join("\n"),
    reportersText: row.reporters.join("\n")
  })));
  const [addOpen, setAddOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [draftRow, setDraftRow] = useState(blankRow);
  const addFormRef = useRef(null);
  const [filmingDate, setFilmingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef(null);

  useEffect(() => {
    apiFetch(`/api/filming/${filmingDate}/image`)
      .then((d) => setUploadedImages(d.images || []))
      .catch(() => setUploadedImages([]));
  }, [filmingDate]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      onNotify("Faqat JPEG yoki PNG fayl yuklang", "error");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const result = await apiFetch(`/api/filming/${filmingDate}/upload`, {
        method: "POST",
        headers: { "Content-Type": file.type, "X-Filename": encodeURIComponent(file.name) },
        body: file
      });
      setUploadedImages(result.images || []);
      onNotify("Jadval rasmi yuklandi ✓");
    } catch (err) {
      onNotify(err.message || "Yuklashda xato", "error");
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  async function handleDeleteImage(img) {
    if (!await showConfirm("Bu rasmni o'chirish?")) return;
    try {
      await apiFetch(`/api/filming/${filmingDate}/image?filename=${encodeURIComponent(img.filename || img.imageUrl.split("/").pop())}`, { method: "DELETE" });
      setUploadedImages((prev) => prev.filter((i) => i !== img));
      onNotify("Rasm o'chirildi");
    } catch (err) {
      onNotify(err.message || "O'chirishda xato", "error");
    }
  }

  function updateRow(index, field, value) {
    setRows((currentRows) => currentRows.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  }

  function addRow(event) {
    event.preventDefault();
    const requiredFields = [
      ["camera", "Kamera raqamini kiriting."],
      ["time", "Chiqish vaqtini kiriting."],
      ["operatorsText", "Operator va texnik xodimni kiriting."],
      ["topic", "Tadbir joyi va mavzusini kiriting."]
    ];
    const invalid = requiredFields.find(([field]) => !String(draftRow[field] || "").trim());
    if (invalid) {
      onNotify(invalid[1], "error");
      addFormRef.current?.querySelector(`[name='${invalid[0]}']`)?.focus();
      return;
    }

    setRows((currentRows) => [...currentRows, draftRow]);
    setDraftRow(blankRow);
    setAddOpen(false);
    onNotify("Tasvir jadvaliga yangi qator qo'shildi");
  }

  function downloadExcel() {
    const body = rows.map((row) => `
      <tr><td colspan="3"><b>Kerakli jihoz va texnika:</b></td><td colspan="2"><b>${escapeHtml(row.equipment)}</b></td></tr>
      <tr>
        <td>${escapeHtml(row.camera).replaceAll("\n", "<br>")}</td>
        <td>${escapeHtml(row.time).replaceAll("\n", "<br>")}</td>
        <td>${escapeHtml(row.operatorsText).replaceAll("\n", "<br>")}</td>
        <td>${escapeHtml(row.topic).replaceAll("\n", "<br>")}</td>
        <td>${escapeHtml(row.reportersText).replaceAll("\n", "<br>")}</td>
      </tr>
    `).join("");
    const html = `
      <html><head><meta charset="UTF-8"></head><body>
      <table border="1">
        <tr>
          <th>Kamera raqami</th><th>Chiqish vaqti</th><th>Operator va texnik xodim</th><th>Tadbir o'tkazilish joyi va tadbir mavzusi</th><th>Muxbirlar</th>
        </tr>
        ${body}
      </table>
      </body></html>
    `;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tasvirga-olish-jadvali-29-aprel-2026.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onNotify("Excel fayl tayyorlandi");
  }

  return (
    <section className="shooting-page">
      {/* ── Header bar ── */}
      <div className="filming-header">
        <div className="filming-header-left">
          <div className="filming-date-picker">
            <label className="filming-date-label" htmlFor="filming-date-input">Sana:</label>
            <input id="filming-date-input" type="date" value={filmingDate} onChange={(e) => setFilmingDate(e.target.value)} className="filming-date-input" />
          </div>
        </div>
        <div className="filming-header-right">
          {adminMode && (
            <label className={`filming-upload-btn${uploading ? " uploading" : ""}`}>
              <input ref={uploadInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileUpload} style={{ display: "none" }} disabled={uploading} />
              <Paperclip size={15} />
              {uploading ? "Yuklanmoqda..." : "Yangi rasm yuklash"}
            </label>
          )}
          {adminMode && !isSaved && (
            <button type="button" className="shooting-action-btn" onClick={() => setAddOpen(true)}>
              <Plus size={15} />
              Yangi qator
            </button>
          )}
          {isSaved ? (
            <button type="button" className="shooting-action-btn edit-unlock-btn" onClick={() => setIsSaved(false)}>
              <Edit3 size={15} />Tahrirlash
            </button>
          ) : (
            <button type="button" className="shooting-action-btn" onClick={() => { onNotify("Jadval saqlandi ✓"); setIsSaved(true); }}>
              <Save size={15} />Saqlash
            </button>
          )}
          <button type="button" className="shooting-action-btn" onClick={downloadExcel}>
            <FileSpreadsheet size={15} />Excel
          </button>
          <button type="button" className="shooting-action-btn" onClick={() => window.print()}>
            <FileText size={15} />Print
          </button>
        </div>
      </div>

      {/* ── Uploaded schedule images (multi, newest first) ── */}
      {uploadedImages.length > 0 ? uploadedImages.map((img, idx) => (
        <div className="filming-image-container" key={img.uploadedAt || idx}>
          <div className="filming-image-header">
            <span className="filming-image-label">📅 {filmingDate} — {idx === 0 ? "Yangi rasm" : `${idx + 1}-rasm`}</span>
            <div className="filming-image-meta">
              <span>Yuklagan: {img.uploadedBy}</span>
              <span>{new Date(img.uploadedAt).toLocaleString("uz-UZ")}</span>
              {adminMode && (
                <button type="button" className="filming-image-delete-btn" onClick={() => handleDeleteImage(img)}>
                  <Trash2 size={13} /> O'chirish
                </button>
              )}
            </div>
          </div>
          <div className="filming-image-wrapper">
            <img src={`${img.imageUrl}?t=${encodeURIComponent(img.uploadedAt)}`} alt={`Jadval ${filmingDate} ${idx + 1}`} className="filming-schedule-image" onClick={() => window.open(img.imageUrl, "_blank")} />
          </div>
          <div className="filming-image-actions">
            <a href={img.imageUrl} download={`jadval-${filmingDate}-${idx + 1}.jpg`} className="filming-download-link">
              <Download size={14} /> Yuklab olish
            </a>
            <span className="filming-image-hint">Kattalashtirish uchun rasmga bosing</span>
          </div>
        </div>
      )) : (
        adminMode ? (
          <div className="filming-no-image">
            <div className="filming-no-image-icon">📄</div>
            <p>Bu kun uchun jadval rasmi yuklanmagan</p>
            <p className="filming-no-image-hint">Word jadvalini JPEG sifatida saqlang va yuqoridagi tugma orqali yuklang</p>
          </div>
        ) : (
          <div className="filming-no-image">
            <div className="filming-no-image-icon">📄</div>
            <p>Bu kun uchun jadval rasmi hali yuklanmagan</p>
          </div>
        )
      )}

      <article className="excel-sheet">
        <header className="excel-header">
          <div>
            <strong>Tasvirga olish jadvali</strong>
            <span>29 aprel 2026 yil</span>
          </div>
          <em>{rows.length} qator</em>
        </header>

        <div className="excel-notice">Muhim eslatma! Tasvirga olish ishlari yakunlanishi bilan, material tayyorlashga kirishish shart.</div>

        <div className="shooting-table-wrap">
          <table className="shooting-table">
            <thead>
              <tr>
                <th>Kamera raqami</th>
                <th>Chiqish vaqti</th>
                <th>Operator va texnik xodim</th>
                <th>Tadbir o'tkazilish joyi va tadbir mavzusi</th>
                <th>Muxbirlar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <React.Fragment key={`${row.camera}-${index}`}>
                  <tr className="equipment-row">
                    <td colSpan="3">Kerakli jihoz va texnika:</td>
                    <td colSpan="2">
                      <input value={row.equipment} onChange={(event) => !isSaved && updateRow(index, "equipment", event.target.value)} readOnly={isSaved} className={isSaved ? "readonly-cell" : ""} aria-label="Kerakli jihoz va texnika" />
                    </td>
                  </tr>
                  <tr>
                    <td className="camera-cell"><textarea value={row.camera} onChange={(event) => !isSaved && updateRow(index, "camera", event.target.value)} readOnly={isSaved} className={isSaved ? "readonly-cell" : ""} aria-label="Kamera raqami" /></td>
                    <td className="time-cell"><textarea value={row.time} onChange={(event) => !isSaved && updateRow(index, "time", event.target.value)} readOnly={isSaved} className={isSaved ? "readonly-cell" : ""} aria-label="Chiqish vaqti" /></td>
                    <td><textarea value={row.operatorsText} onChange={(event) => !isSaved && updateRow(index, "operatorsText", event.target.value)} readOnly={isSaved} className={isSaved ? "readonly-cell" : ""} aria-label="Operator va texnik xodim" /></td>
                    <td className="topic-cell"><textarea value={row.topic} onChange={(event) => !isSaved && updateRow(index, "topic", event.target.value)} readOnly={isSaved} className={isSaved ? "readonly-cell" : ""} aria-label="Tadbir o'tkazilish joyi va mavzusi" /></td>
                    <td><textarea value={row.reportersText} onChange={(event) => !isSaved && updateRow(index, "reportersText", event.target.value)} readOnly={isSaved} className={isSaved ? "readonly-cell" : ""} aria-label="Muxbirlar" /></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {addOpen && createPortal((
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Yangi jadval qo'shish" onClick={() => setAddOpen(false)}>
          <form ref={addFormRef} className="schedule-modal" onSubmit={addRow} onClick={(event) => event.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Yangi jadval qo'shish</strong>
              <button type="button" onClick={() => setAddOpen(false)}>
                <LogOut size={15} />
                Chiqish
              </button>
            </div>
            <label>
              Kamera raqami
              <input name="camera" value={draftRow.camera} onChange={(event) => setDraftRow({ ...draftRow, camera: event.target.value })} placeholder="12 / +Avivest" />
            </label>
            <label>
              Chiqish vaqti
              <input name="time" value={draftRow.time} onChange={(event) => setDraftRow({ ...draftRow, time: event.target.value })} placeholder="09:00-18:00" />
            </label>
            <label>
              Operator va texnik xodim
              <textarea name="operatorsText" value={draftRow.operatorsText} onChange={(event) => setDraftRow({ ...draftRow, operatorsText: event.target.value })} placeholder="Operator F.I.Sh" />
            </label>
            <label>
              Tadbir joyi va mavzusi
              <textarea name="topic" value={draftRow.topic} onChange={(event) => setDraftRow({ ...draftRow, topic: event.target.value })} placeholder="Tadbir haqida ma'lumot" />
            </label>
            <label>
              Muxbirlar
              <textarea value={draftRow.reportersText} onChange={(event) => setDraftRow({ ...draftRow, reportersText: event.target.value })} placeholder="Muxbir F.I.Sh" />
            </label>
            <label>
              Kerakli jihoz va texnika
              <input value={draftRow.equipment} onChange={(event) => setDraftRow({ ...draftRow, equipment: event.target.value })} />
            </label>
            <button type="submit">
              <Plus size={17} />
              Jadvalga qo'shish
            </button>
          </form>
        </div>
      ), document.body)}
    </section>
  );
}

class MonthlyErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "#ef4444", background: "#fff", position: "fixed", inset: 0, zIndex: 999, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center" }}>
          <strong>Xatolik yuz berdi</strong>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>{this.state.error.message}</p>
          <button onClick={() => { this.setState({ error: null }); this.props.onClose?.(); }}
            style={{ padding: "8px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Orqaga
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DAILY_STATUSES = {
  empty: { label: "", bg: "#e2e8f0", fg: "#94a3b8", name: "Bo'sh" },
  I:     { label: "I", bg: "#22c55e", fg: "#fff",    name: "Ishda" },
  S:     { label: "S", bg: "#3b82f6", fg: "#fff",    name: "Studiyada" },
  T:     { label: "T", bg: "#eab308", fg: "#fff",    name: "TJK guruhi" },
  K:     { label: "K", bg: "#f97316", fg: "#fff",    name: "Komandirovka" },
  D:     { label: "D", bg: "#ef4444", fg: "#fff",    name: "Dam olish" },
  M:     { label: "M", bg: "#a855f7", fg: "#fff",    name: "Mehnat ta'tili" },
  O:     { label: "O", bg: "#6b7280", fg: "#fff",    name: "O'quv ta'tili" },
  A:     { label: "A", bg: "#06b6d4", fg: "#fff",    name: "Administratsiya" },
  P:     { label: "P", bg: "#ec4899", fg: "#fff",    name: "Prezidentskiy" },
  B:     { label: "B", bg: "#dc2626", fg: "#fff",    name: "Kasal" },
  U:     { label: "U", bg: "#9ca3af", fg: "#fff",    name: "Pulsiz ta'til" }
};
const WORKING_DAILY = ["I", "S", "T", "K", "A", "P"];

function localDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const StatusCell = React.memo(function StatusCell({ emp, day, code, adminMode, onSelect }) {
  const info = DAILY_STATUSES[code] || DAILY_STATUSES.empty;
  return (
    <button
      type="button"
      className="mc"
      style={{ background: info.bg, color: info.fg }}
      onClick={(e) => { e.stopPropagation(); if (adminMode) onSelect(emp, day); }}
      disabled={!adminMode}
      title={adminMode ? `${emp.name}: ${info.name} — bosing` : info.name}
    >
      {info.label}
    </button>
  );
});

function MonthlyPage({ dashboard, weekStart, fullscreen = false, onClose, currentUser, onNotify }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [statuses, setStatuses]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [pickerEmp, setPickerEmp] = useState(null);
  const [pickerDay, setPickerDay] = useState(null);
  const [empModal, setEmpModal] = useState(null);
  const [empForm, setEmpForm] = useState({ name:"", role:"", department:"" });
  const [empSaving, setEmpSaving] = useState(false);
  const [localEmployees, setLocalEmployees] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }
  const [newEmpId, setNewEmpId] = useState(null); // highlight newly added row
  const newRowRef = useRef(null);

  // deduplicate by id
  const employees = useMemo(() => {
    const source = localEmployees ?? dashboard.employees;
    const seen = new Set();
    return source.filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; });
  }, [localEmployees, dashboard.employees]);

  // scroll new row into view
  useEffect(() => {
    if (newEmpId && newRowRef.current) {
      newRowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [newEmpId]);

  async function reloadEmployees() {
    try {
      const data = await api("/api/employees");
      if (data?.employees) setLocalEmployees(data.employees);
    } catch {}
  }

  function openAddEmp() {
    setEmpForm({ name: "", role: "Operator", department: "operator" });
    setEmpModal({ mode: "add" });
  }
  function openEditEmp(emp) {
    setEmpForm({ name: emp.name, role: emp.role || "Operator", department: emp.department || "operator" });
    setEmpModal({ mode: "edit", emp });
  }

  async function saveEmpForm(e) {
    e.preventDefault();
    if (!empForm.name.trim()) { onNotify?.("Ism kiritilmadi", "error"); return; }
    setEmpSaving(true);
    if (empModal.mode === "add") {
      try {
        const created = await api("/api/employees", { method: "POST", body: JSON.stringify({ name: empForm.name, role: empForm.role, department: empForm.department }) });
        await reloadEmployees();
        setNewEmpId(created?.id ?? null);
        onNotify?.(`${empForm.name} qo'shildi ✓`);
        setEmpModal(null);
      } catch (err) {
        onNotify?.(err.message, "error");
      } finally { setEmpSaving(false); }
    } else {
      try {
        await api(`/api/employees/${empModal.emp.id}`, { method: "PUT", body: JSON.stringify({ ...empModal.emp, name: empForm.name, role: empForm.role, department: empForm.department }) });
        await reloadEmployees();
        onNotify?.(`${empForm.name} yangilandi ✓`);
        setEmpModal(null);
      } catch (err) {
        onNotify?.(err.message, "error");
      } finally { setEmpSaving(false); }
    }
  }

  function deleteEmp(emp) {
    setConfirmModal({
      message: `"${emp.name}" ni jadvaldan o'chirasizmi?`,
      deleting: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, deleting: true }));
        try {
          await api(`/api/employees/${emp.id}`, { method: "DELETE" });
          await reloadEmployees();
          onNotify?.(`${emp.name} o'chirildi`);
          setConfirmModal(null);
        } catch (err) {
          onNotify?.(err.message, "error");
          setConfirmModal(null);
        }
      }
    });
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [year, month, daysInMonth]);
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const statusesRef = useRef(statuses);
  useEffect(() => { statusesRef.current = statuses; }, [statuses]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api(`/api/daily-status?year=${year}&month=${month}`)
      .then((data) => { if (!cancelled) setStatuses(data.statuses || {}); })
      .catch(() => { if (!cancelled) { setStatuses({}); onNotify?.("Statuslarni yuklashda xato", "error"); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [year, month]);

  const getCode = useCallback((empId, day) => {
    return statuses[empId]?.[`${monthPrefix}-${String(day).padStart(2, "0")}`] || "empty";
  }, [statuses, monthPrefix]);

  const closePicker = useCallback(() => { setPickerEmp(null); setPickerDay(null); }, []);

  const handleCellSelect = useCallback((emp, day) => {
    if (!isAdmin(currentUser)) return;
    setPickerEmp(emp);
    setPickerDay(day);
    const dateStr = `${monthPrefix}-${String(day).padStart(2, "0")}`;
    const code = statusesRef.current[emp.id]?.[dateStr] || "empty";
    setSelectedCell({ empName: emp.name, day, code, info: DAILY_STATUSES[code] || DAILY_STATUSES.empty });
  }, [currentUser, monthPrefix]);

  const handleStatusPick = useCallback(async (newCode) => {
    if (!pickerEmp || pickerDay == null) return;
    const emp = pickerEmp;
    const day = pickerDay;
    closePicker();
    const dateStr = `${monthPrefix}-${String(day).padStart(2, "0")}`;
    const oldCode = statusesRef.current[emp.id]?.[dateStr] || "empty";
    const info = DAILY_STATUSES[newCode] || DAILY_STATUSES.empty;
    setStatuses((prev) => ({ ...prev, [emp.id]: { ...(prev[emp.id] || {}), [dateStr]: newCode } }));
    setSelectedCell({ empName: emp.name, day, code: newCode, info });
    try {
      await api("/api/daily-status", { method: "POST", body: JSON.stringify({ employeeId: emp.id, date: dateStr, statusCode: newCode }) });
      onNotify?.(`${emp.name}: ${info.name} ✓`);
    } catch (err) {
      setStatuses((prev) => ({ ...prev, [emp.id]: { ...(prev[emp.id] || {}), [dateStr]: oldCode } }));
      setSelectedCell(null);
      onNotify?.("Saqlashda xato: " + err.message, "error");
    }
  }, [pickerEmp, pickerDay, monthPrefix, onNotify, closePicker]);

  const rowTotals = useMemo(() => {
    const result = {};
    for (const emp of employees) {
      const empSt = statuses[emp.id] || {};
      let working = 0, rest = 0, hours = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const code = empSt[`${monthPrefix}-${String(d).padStart(2, "0")}`] || "empty";
        if (WORKING_DAILY.includes(code)) { working++; hours += 8; }
        if (["D", "M", "O", "B", "U"].includes(code)) rest++;
      }
      result[emp.id] = { working, rest, hours };
    }
    return result;
  }, [statuses, employees, daysInMonth, monthPrefix]);

  const totals = useMemo(() => {
    const r = { I: 0, S: 0, T: 0, K: 0, D: 0, M: 0, O: 0, A: 0, P: 0, B: 0, U: 0, working: 0, rest: 0, hours: 0 };
    for (const emp of employees) {
      const empSt = statuses[emp.id] || {};
      for (let d = 1; d <= daysInMonth; d++) {
        const code = empSt[`${monthPrefix}-${String(d).padStart(2, "0")}`] || "empty";
        if (code !== "empty") {
          if (r[code] !== undefined) r[code]++;
          if (WORKING_DAILY.includes(code)) { r.working++; r.hours += 8; }
          if (["D", "M", "O", "B", "U"].includes(code)) r.rest++;
        }
      }
    }
    return r;
  }, [statuses, employees, year, month, daysInMonth, monthPrefix]);

  function prevMonth() { if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1); }
  function nextMonth() { if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1); }

  function exportMonthlyJpeg() {
    const FONT = "13px Arial, sans-serif";
    const BOLD_FONT = "bold 13px Arial, sans-serif";
    const ROW_H = 26;
    const HEAD_H = 36;
    const TITLE_H = 38;
    const COL_NUM = 28;
    const COL_NAME = 148;
    const COL_DAY = 24;
    const COL_TOT = 38;
    const BADGE = 18;
    const totalW = COL_NUM + COL_NAME + daysInMonth * COL_DAY + 3 * COL_TOT;
    const totalH = TITLE_H + HEAD_H + employees.length * ROW_H + 4;
    const canvas = document.createElement("canvas");
    canvas.width = totalW; canvas.height = totalH;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, totalW, totalH);
    // Title bar
    ctx.fillStyle = "#1e40af"; ctx.fillRect(0, 0, totalW, TITLE_H);
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText(`${MONTH_NAMES[month - 1]} ${year} — Oylik ish grafigi  (${employees.length} xodim)`, 12, 25);
    const sy = TITLE_H;
    // Header row
    ctx.fillStyle = "#f1f5f9"; ctx.fillRect(0, sy, totalW, HEAD_H);
    ctx.strokeStyle = "#cbd5e1";
    function drawCell(x, y, w, h, text, bg, fg, bold, align) {
      if (bg) { ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); }
      ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = fg || "#1e293b";
      ctx.font = bold ? BOLD_FONT : FONT;
      const tw = ctx.measureText(text).width;
      const tx = align === "center" ? x + (w - tw) / 2 : x + 4;
      ctx.fillText(text, Math.max(tx, x + 2), y + h / 2 + 5);
    }
    drawCell(0, sy, COL_NUM, HEAD_H, "#", "#f1f5f9", "#64748b", true, "center");
    drawCell(COL_NUM, sy, COL_NAME, HEAD_H, "Xodim", "#f1f5f9", "#334155", true, "left");
    let dx = COL_NUM + COL_NAME;
    days.forEach((d) => {
      const dt = new Date(year, month - 1, d);
      const wd = dt.getDay();
      const isWknd = wd === 0 || wd === 6;
      const isToday = dt.toDateString() === new Date().toDateString();
      const bg = isToday ? "#dbeafe" : isWknd ? "#fef2f2" : "#f1f5f9";
      const fg = isToday ? "#1d4ed8" : isWknd ? "#dc2626" : "#334155";
      drawCell(dx, sy, COL_DAY, HEAD_H, String(d), bg, fg, true, "center");
      dx += COL_DAY;
    });
    drawCell(dx, sy, COL_TOT, HEAD_H, "Ish", "#f1f5f9", "#16a34a", true, "center"); dx += COL_TOT;
    drawCell(dx, sy, COL_TOT, HEAD_H, "Dam", "#f1f5f9", "#ef4444", true, "center"); dx += COL_TOT;
    drawCell(dx, sy, COL_TOT, HEAD_H, "Soat", "#f1f5f9", "#6b7280", true, "center");
    // Employee rows
    employees.forEach((emp, idx) => {
      const ry = sy + HEAD_H + idx * ROW_H;
      const rowBg = idx % 2 === 0 ? "#fff" : "#f8fafc";
      const rt = rowTotals[emp.id] || { working: 0, rest: 0, hours: 0 };
      ctx.fillStyle = rowBg; ctx.fillRect(0, ry, totalW, ROW_H);
      drawCell(0, ry, COL_NUM, ROW_H, String(idx + 1), rowBg, "#64748b", false, "center");
      // Name — truncate if needed
      ctx.fillStyle = rowBg; ctx.fillRect(COL_NUM, ry, COL_NAME, ROW_H);
      ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.5; ctx.strokeRect(COL_NUM + 0.5, ry + 0.5, COL_NAME - 1, ROW_H - 1);
      ctx.fillStyle = "#1e293b"; ctx.font = FONT;
      ctx.save(); ctx.rect(COL_NUM + 3, ry, COL_NAME - 6, ROW_H); ctx.clip();
      ctx.fillText(emp.name, COL_NUM + 4, ry + ROW_H / 2 + 5); ctx.restore();
      let cx = COL_NUM + COL_NAME;
      days.forEach((d) => {
        const dt = new Date(year, month - 1, d);
        const wd = dt.getDay();
        const isWknd = wd === 0 || wd === 6;
        const code = getCode(emp.id, d);
        const info = DAILY_STATUSES[code] || DAILY_STATUSES.empty;
        const cellBg = isWknd ? "#fef9f9" : rowBg;
        ctx.fillStyle = cellBg; ctx.fillRect(cx, ry, COL_DAY, ROW_H);
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.5; ctx.strokeRect(cx + 0.5, ry + 0.5, COL_DAY - 1, ROW_H - 1);
        if (code !== "empty") {
          const bx = cx + (COL_DAY - BADGE) / 2;
          const by = ry + (ROW_H - BADGE) / 2;
          ctx.fillStyle = info.bg; ctx.beginPath(); ctx.roundRect(bx, by, BADGE, BADGE, 4); ctx.fill();
          ctx.fillStyle = info.fg; ctx.font = "bold 11px Arial, sans-serif";
          const tw = ctx.measureText(code).width;
          ctx.fillText(code, bx + (BADGE - tw) / 2, by + BADGE / 2 + 4);
        }
        cx += COL_DAY;
      });
      drawCell(cx, ry, COL_TOT, ROW_H, String(rt.working), rowBg, "#16a34a", true, "center"); cx += COL_TOT;
      drawCell(cx, ry, COL_TOT, ROW_H, String(rt.rest), rowBg, "#ef4444", true, "center"); cx += COL_TOT;
      drawCell(cx, ry, COL_TOT, ROW_H, String(rt.hours), rowBg, "#64748b", true, "center");
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = `oylik-grafik-${year}-${String(month).padStart(2, "0")}.jpg`;
    link.click();
    onNotify?.("Oylik grafik JPEG sifatida yuklandi ✓");
  }

  function exportMonthlyXlsx() {
    function argb(hex) { return "FF" + hex.replace("#", "").toUpperCase(); }
    const fillDefs = [
      `<fill><patternFill patternType="none"/></fill>`,
      `<fill><patternFill patternType="gray125"/></fill>`,
    ];
    const fillMap = {};
    function addFill(hex) {
      if (fillMap[hex] !== undefined) return fillMap[hex];
      const idx = fillDefs.length; fillMap[hex] = idx;
      fillDefs.push(`<fill><patternFill patternType="solid"><fgColor rgb="${argb(hex)}"/><bgColor indexed="64"/></patternFill></fill>`);
      return idx;
    }
    const F_HDR  = addFill("#1E3A8A");
    const F_GRAY = addFill("#f1f5f9");
    const F_ALT  = addFill("#f8fafc");
    const F_WKND = addFill("#fef2f2");
    const F_TODA = addFill("#dbeafe");
    const statusFill = {};
    Object.entries(DAILY_STATUSES).forEach(([code, info]) => { statusFill[code] = addFill(info.bg); });

    const fonts = [
      `<font><sz val="10"/><name val="Calibri"/><color rgb="FF1E293B"/></font>`,
      `<font><sz val="10"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font>`,
      `<font><sz val="10"/><name val="Calibri"/><b/><color rgb="FF1E293B"/></font>`,
      `<font><sz val="10"/><name val="Calibri"/><b/><color rgb="FFFFFFFF"/></font>`,
      `<font><sz val="12"/><name val="Calibri"/><b/><color rgb="FFFFFFFF"/></font>`,
    ];
    const borders = [
      `<border><left/><right/><top/><bottom/><diagonal/></border>`,
      `<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>`,
    ];
    const xfDefs = [];
    function xf(fId, fnId, bId, ha) {
      const al = ha ? `<alignment horizontal="${ha}" vertical="center"/>` : `<alignment vertical="center"/>`;
      xfDefs.push(`<xf numFmtId="0" fontId="${fnId}" fillId="${fId}" borderId="${bId}" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${al}</xf>`);
      return xfDefs.length - 1;
    }
    const XF0  = xf(0, 0, 0, null);
    const XF_TITLE   = xf(F_HDR,  4, 0, "center");
    const XF_HHDR    = xf(F_GRAY, 2, 1, "center");
    const XF_HHDR_L  = xf(F_GRAY, 2, 1, "left");
    const XF_WKND_H  = xf(F_WKND, 2, 1, "center");
    const XF_TODA_H  = xf(F_TODA, 2, 1, "center");
    const XF_NAME    = xf(0,      0, 1, "left");
    const XF_NAME_A  = xf(F_ALT,  0, 1, "left");
    const XF_NUM     = xf(0,      0, 1, "center");
    const XF_NUM_A   = xf(F_ALT,  0, 1, "center");
    const XF_TOT     = xf(0,      2, 1, "center");
    const XF_TOT_A   = xf(F_ALT,  2, 1, "center");
    const XF_EMP     = xf(0,      0, 1, "center");
    const XF_EMP_A   = xf(F_ALT,  0, 1, "center");
    const statusXf = {};
    Object.entries(DAILY_STATUSES).forEach(([code]) => {
      statusXf[code] = { e: xf(statusFill[code], code === "empty" ? 0 : 1, 1, "center"), a: xf(statusFill[code], code === "empty" ? 0 : 1, 1, "center") };
    });

    function colLetter(n) {
      let r = ""; n++;
      while (n > 0) { n--; r = String.fromCharCode(65 + (n % 26)) + r; n = Math.floor(n / 26); }
      return r;
    }
    const ss = []; const ssMap = {};
    function S(str) {
      if (ssMap[str] !== undefined) return ssMap[str];
      const i = ss.length; ssMap[str] = i;
      ss.push(`<si><t>${escapeXml(str)}</t></si>`); return i;
    }
    function SC(col, row, str, sIdx) { return `<c r="${colLetter(col)}${row}" s="${sIdx}" t="s"><v>${S(str)}</v></c>`; }
    function EC(col, row, sIdx) { return `<c r="${colLetter(col)}${row}" s="${sIdx}"/>`; }

    const totalCols = 2 + daysInMonth + 3;
    const lastCol = colLetter(totalCols - 1);
    const rows = [];

    // Row 1 — title (merged)
    const titleStr = `${MONTH_NAMES[month - 1]} ${year} — Oylik ish grafigi  (${employees.length} xodim)`;
    let r1 = `<row r="1" ht="22" customHeight="1">${SC(0, 1, titleStr, XF_TITLE)}`;
    for (let c = 1; c < totalCols; c++) r1 += EC(c, 1, XF_TITLE);
    r1 += `</row>`; rows.push(r1);

    // Row 2 — header
    let r2 = `<row r="2" ht="18" customHeight="1">${SC(0, 2, "#", XF_HHDR)}${SC(1, 2, "Xodim", XF_HHDR_L)}`;
    for (let di = 0; di < daysInMonth; di++) {
      const dt = new Date(year, month - 1, di + 1);
      const wd = dt.getDay();
      const isToday = dt.toDateString() === new Date().toDateString();
      const hXf = isToday ? XF_TODA_H : (wd === 0 || wd === 6) ? XF_WKND_H : XF_HHDR;
      r2 += SC(2 + di, 2, String(di + 1), hXf);
    }
    const tb = 2 + daysInMonth;
    r2 += SC(tb, 2, "Ish", XF_HHDR) + SC(tb + 1, 2, "Dam", XF_HHDR) + SC(tb + 2, 2, "Soat", XF_HHDR) + `</row>`;
    rows.push(r2);

    // Employee rows
    employees.forEach((emp, idx) => {
      const r = idx + 3;
      const odd = idx % 2 === 1;
      const rt = rowTotals[emp.id] || { working: 0, rest: 0, hours: 0 };
      let row = `<row r="${r}" ht="15" customHeight="1">${SC(0, r, String(idx + 1), odd ? XF_NUM_A : XF_NUM)}${SC(1, r, emp.name, odd ? XF_NAME_A : XF_NAME)}`;
      for (let di = 0; di < daysInMonth; di++) {
        const code = getCode(emp.id, di + 1);
        if (code && code !== "empty") {
          row += SC(2 + di, r, code, statusXf[code]?.e ?? XF_EMP);
        } else {
          row += EC(2 + di, r, odd ? XF_EMP_A : XF_EMP);
        }
      }
      row += SC(tb, r, String(rt.working), odd ? XF_TOT_A : XF_TOT) + SC(tb + 1, r, String(rt.rest), odd ? XF_TOT_A : XF_TOT) + SC(tb + 2, r, String(rt.hours), odd ? XF_TOT_A : XF_TOT) + `</row>`;
      rows.push(row);
    });

    const colDefs = `<col min="1" max="1" width="4" customWidth="1"/><col min="2" max="2" width="22" customWidth="1"/><col min="3" max="${2 + daysInMonth}" width="3.5" customWidth="1"/><col min="${3 + daysInMonth}" max="${2 + daysInMonth + 3}" width="5" customWidth="1"/>`;
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="2" topLeftCell="A3" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${colDefs}</cols><sheetData>${rows.join("")}</sheetData><mergeCells count="1"><mergeCell ref="A1:${lastCol}1"/></mergeCells></worksheet>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="${fonts.length}">${fonts.join("")}</fonts><fills count="${fillDefs.length}">${fillDefs.join("")}</fills><borders count="${borders.length}">${borders.join("")}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfDefs.length}">${xfDefs.join("")}</cellXfs></styleSheet>`;
    const sharedStr = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${ss.length}" uniqueCount="${ss.length}">${ss.join("")}</sst>`;
    const wb = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Oylik grafik" sheetId="1" r:id="rId1"/></sheets></workbook>`;
    const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`;
    const blob = createZipBlob([
      { name: "[Content_Types].xml", content: ct },
      { name: "_rels/.rels", content: rels },
      { name: "xl/workbook.xml", content: wb },
      { name: "xl/_rels/workbook.xml.rels", content: wbRels },
      { name: "xl/worksheets/sheet1.xml", content: sheet },
      { name: "xl/styles.xml", content: styles },
      { name: "xl/sharedStrings.xml", content: sharedStr },
    ], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    downloadBlob(blob, `oylik-grafik-${year}-${String(month).padStart(2, "0")}.xlsx`);
    onNotify?.("Oylik grafik Excel sifatida yuklandi ✓");
  }

  async function exportWordForDate(targetDate) {
    try {
      const data = await api(`/api/daily-status/working?date=${targetDate}`);
      const workingEmps = data.employees || [];
      if (!workingEmps.length) {
        onNotify?.(`${targetDate}: ishlaydigan xodim belgilanmagan`, "warning");
        return;
      }
      const rows = workingEmps.map((emp) => ({
        cameraNumber: "", exitTime: "", operatorsText: emp.name,
        topic: "", reportersText: "",
        equipment: "HD jamlanmasi, mikrofon, chiroq, avtotransport"
      }));
      const token = window.localStorage.getItem("authToken");
      const resp = await fetch(`${API_BASE}/api/filming/export-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ date: targetDate, rows })
      });
      if (!resp.ok) { onNotify?.("Word yaratishda xato", "error"); return; }
      const blob = await resp.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `tasvirga-olish-jadvali-${targetDate}.docx`;
      document.body.appendChild(link); link.click(); link.remove();
      onNotify?.(`Word fayl tayyorlandi (${targetDate}) ✓`);
    } catch (err) { onNotify?.("Xato: " + err.message, "error"); }
  }

  const monthlyBody = (
    <div className="monthly-container">
      <div className="monthly-nav">
        <button type="button" onClick={prevMonth}>← Oldingi</button>
        <div className="monthly-nav-title">
          <h2>{MONTH_NAMES[month - 1]} {year}</h2>
          <p>{employees.length} xodim uchun oylik ish grafigi</p>
        </div>
        <button type="button" onClick={nextMonth}>Keyingi →</button>
      </div>
      <div className="monthly-jpeg-row">
        <button type="button" className="monthly-jpeg-btn" onClick={exportMonthlyXlsx} disabled={loading}>
          <Download size={15} /> Excel yuklab olish
        </button>
        <button type="button" className="monthly-jpeg-btn" style={{ background: "none", color: "#64748b", border: "1px solid #cbd5e1" }} onClick={exportMonthlyJpeg} disabled={loading}>
          <Download size={15} /> JPEG yuklab olish
        </button>
        {isAdmin(currentUser) && (
          <button type="button" className="monthly-jpeg-btn" style={{ background: "#22c55e", color: "#fff", border: "none" }} onClick={openAddEmp}>
            <UserPlus size={15} /> Xodim qo'shish
          </button>
        )}
      </div>

      <div className="monthly-summary">
        {[["I","Ishda"],["S","Studiya"],["T","TJK"],["K","Safar"],["D","Dam"],["M","Ta'til"],["O","O'quv"],["B","Kasal"],["U","Pulsiz"]].map(([code, label]) => (
          <span key={code}><b style={{ color: DAILY_STATUSES[code].bg }}>{totals[code] || 0}</b> {label}</span>
        ))}
        <span><b>{totals.hours}</b> soat</span>
      </div>

      {isAdmin(currentUser) && (
        <div className="monthly-export">
          <strong>Word jadval export</strong>
          <p>Kunni tanlang — ishdagi xodimlar Word jadvalga tushadi</p>
          <div className="monthly-export-row">
            {[0, 1, 2, 3].map((offset) => {
              const dt = new Date(); dt.setDate(dt.getDate() + offset);
              const dStr = localDateStr(dt);
              if (dt.getMonth() + 1 !== month || dt.getFullYear() !== year) return null;
              return (
                <button key={dStr} type="button" className="mex-btn" onClick={() => exportWordForDate(dStr)}>
                  <FileText size={14} /> {dt.getDate()}-{MONTH_NAMES[month - 1]}
                </button>
              );
            })}
            <input type="date" className="mex-picker" onChange={(e) => e.target.value && exportWordForDate(e.target.value)} />
          </div>
        </div>
      )}

      <div className="monthly-legend">
        {Object.entries(DAILY_STATUSES).filter(([k]) => k !== "empty").map(([code, info]) => (
          <span key={code} className="monthly-legend-chip" style={{ background: info.bg, color: info.fg }}>{code} — {info.name}</span>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(6,12,30,0.45)", borderRadius: "12px"
          }}>
            <span className="mtr-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        )}
        <div className="monthly-scroll" role="region" aria-label="Oylik grafik" style={{ opacity: loading ? 0.65 : 1, transition: "opacity 0.2s" }}>
          <table className="monthly-table">
            <thead>
              <tr>
                <th className="mth-num">#</th>
                <th className="mth-name">Xodim</th>
                {days.map((d) => {
                  const dt = new Date(year, month - 1, d);
                  const wd = dt.getDay();
                  const isToday = dt.toDateString() === now.toDateString();
                  return <th key={d} className={`mth-day${wd === 0 || wd === 6 ? " weekend" : ""}${isToday ? " today" : ""}`}>{d}</th>;
                })}
                <th className="mth-sum">Ish</th>
                <th className="mth-sum">Dam</th>
                <th className="mth-sum">Soat</th>
                {isAdmin(currentUser) && <th className="mth-act"></th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => {
                const rt = rowTotals[emp.id] || { working: 0, rest: 0, hours: 0 };
                const isNew = String(emp.id) === String(newEmpId);
                const isLoading = !!emp._loading;
                return (
                  <tr
                    key={emp.id}
                    ref={isNew ? newRowRef : null}
                    className={`mtr${isNew ? " mtr-new" : ""}${isLoading ? " mtr-loading" : ""}`}
                    onAnimationEnd={() => { if (isNew) setNewEmpId(null); }}
                  >
                    <td className="mtd-num">{idx + 1}</td>
                    <td className="mtd-name">
                      {emp.name}
                      {isLoading && <span className="mtr-spinner" />}
                      <br /><small style={{color:"var(--text-secondary)",fontSize:"0.67rem"}}>{emp.role}</small>
                    </td>
                    {days.map((d) => {
                      const code = getCode(emp.id, d);
                      const dt = new Date(year, month - 1, d);
                      const wd = dt.getDay();
                      return (
                        <td key={d} className={`mtd-cell${wd === 0 || wd === 6 ? " weekend" : ""}`}>
                          <StatusCell
                            emp={emp}
                            day={d}
                            code={code}
                            adminMode={isAdmin(currentUser) && !emp._loading}
                            onSelect={handleCellSelect}
                          />
                        </td>
                      );
                    })}
                    <td className="mtd-total working">{rt.working}</td>
                    <td className="mtd-total rest">{rt.rest}</td>
                    <td className="mtd-total hours">{rt.hours}</td>
                    {isAdmin(currentUser) && (
                      <td className="mtd-act">
                        <button type="button" className="mtr-edit-btn" title="Tahrirlash" onClick={() => openEditEmp(emp)}><Pencil size={13} /></button>
                        <button type="button" className="mtr-del-btn" title="O'chirish" onClick={() => deleteEmp(emp)}><Trash2 size={13} /></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCell && selectedCell.info && (
        <div className="monthly-cell-info">
          <strong>{selectedCell.empName}</strong>
          <span>{selectedCell.day}-{MONTH_NAMES[month - 1]}:</span>
          <span className="mci-badge" style={{ background: selectedCell.info.bg || "#6b7280", color: selectedCell.info.fg || "#fff" }}>
            {selectedCell.code} — {selectedCell.info.name}
          </span>
        </div>
      )}

      <div className="time-panel">
        <div className="time-panel-icon"><Clock3 size={18} /></div>
        <div>
          <strong>Vaqt belgilari</strong>
          <p>{selectedCell ? `${selectedCell.empName}: ${selectedCell.day}-kun — ${selectedCell.info?.name || ""}` : isAdmin(currentUser) ? "Katak ustiga bosing — status tanlash uchun" : "Jadval ko'rish rejimi"}</p>
        </div>
      </div>
    </div>
  );

  const pickerPanel = pickerEmp && pickerDay != null ? (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }}
      onClick={closePicker}
    >
      <div
        style={{ width: "100%", background: "#fff", borderRadius: "16px 16px 0 0", padding: "16px 16px 40px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <strong style={{ fontSize: 15 }}>{pickerEmp.name} — {pickerDay}-{MONTH_NAMES[month - 1]}</strong>
          <button type="button" onClick={closePicker} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(DAILY_STATUSES).map(([code, info]) => (
            <button
              key={code}
              type="button"
              style={{ background: info.bg, color: info.fg, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", minWidth: 80 }}
              onClick={() => handleStatusPick(code)}
            >
              {code === "empty" ? "— Bo'sh" : `${code} — ${info.name}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  const confirmPanel = confirmModal ? (
    <div style={{ position:"fixed", inset:0, zIndex:10002, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={() => { if (!confirmModal.deleting) setConfirmModal(null); }}>
      <div style={{ width:"100%", maxWidth:460, background:"var(--card-bg,#fff)", borderRadius:"16px 16px 0 0", padding:"20px 20px 44px" }}
        onClick={(e) => e.stopPropagation()}>
        <p style={{ fontSize:"0.95rem", marginBottom:20, color:"var(--text-primary)", lineHeight:1.5 }}>{confirmModal.message}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button type="button" onClick={() => setConfirmModal(null)} disabled={confirmModal.deleting}
            style={{ flex:1, padding:"12px", border:"1.5px solid var(--border)", borderRadius:10, background:"transparent", cursor: confirmModal.deleting ? "not-allowed" : "pointer", color:"var(--text-primary)", font:"inherit", fontSize:"0.88rem", opacity: confirmModal.deleting ? 0.5 : 1 }}>
            Bekor qilish
          </button>
          <button type="button" onClick={confirmModal.deleting ? undefined : confirmModal.onConfirm} disabled={confirmModal.deleting}
            style={{ flex:1, padding:"12px", border:"none", borderRadius:10, background:"#ef4444", color:"#fff", cursor: confirmModal.deleting ? "not-allowed" : "pointer", font:"inherit", fontSize:"0.88rem", fontWeight:700, opacity: confirmModal.deleting ? 0.75 : 1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            {confirmModal.deleting
              ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"_spin .6s linear infinite" }} />O'chirilmoqda...</>
              : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const empModalPanel = empModal ? (
    <div style={{ position:"fixed", inset:0, zIndex:10001, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={() => { if (!empSaving) setEmpModal(null); }}>
      <div style={{ width:"100%", maxWidth:460, background:"var(--card-bg,#fff)", borderRadius:"16px 16px 0 0", padding:"20px 20px 40px" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <strong style={{ fontSize:16 }}>{empModal.mode === "add" ? "Yangi xodim qo'shish" : "Xodimni tahrirlash"}</strong>
          <button type="button" onClick={() => { if (!empSaving) setEmpModal(null); }}
            style={{ background:"none", border:"none", fontSize:22, cursor: empSaving ? "not-allowed" : "pointer", color:"#6b7280", opacity: empSaving ? 0.4 : 1 }}>✕</button>
        </div>
        <form onSubmit={saveEmpForm} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:4 }}>F.I.Sh *</label>
            <input value={empForm.name} onChange={(e) => setEmpForm({...empForm, name: e.target.value})}
              disabled={empSaving}
              placeholder="Abdullayev Abror Abdullayevich"
              style={{ width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:8, font:"inherit", fontSize:"0.88rem", background:"var(--bg)", color:"var(--text-primary)", opacity: empSaving ? 0.6 : 1 }} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:4 }}>Lavozim *</label>
            <input value={empForm.role} onChange={(e) => setEmpForm({...empForm, role: e.target.value})}
              disabled={empSaving}
              placeholder="Operator, Muxbir, Rejissyor..."
              style={{ width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:8, font:"inherit", fontSize:"0.88rem", background:"var(--bg)", color:"var(--text-primary)", opacity: empSaving ? 0.6 : 1 }} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:4 }}>Bo'lim</label>
            <select value={empForm.department} onChange={(e) => setEmpForm({...empForm, department: e.target.value})}
              disabled={empSaving}
              style={{ width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:8, font:"inherit", fontSize:"0.88rem", background:"var(--bg)", color:"var(--text-primary)", opacity: empSaving ? 0.6 : 1 }}>
              <option value="operator">Oddiy operatorlar</option>
              <option value="pull">Tasvirga olish</option>
              <option value="dron">Dron operatorlar</option>
              <option value="tjk">TJK</option>
              <option value="montaj">Montaj</option>
              <option value="smm">SMM</option>
              <option value="admin">Admin</option>
              <option value="reporter">Muxbirlar</option>
            </select>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <button type="button" onClick={() => { if (!empSaving) setEmpModal(null); }} disabled={empSaving}
              style={{ flex:1, padding:"11px", border:"1.5px solid var(--border)", borderRadius:8, background:"transparent", cursor: empSaving ? "not-allowed" : "pointer", color:"var(--text-primary)", font:"inherit", fontSize:"0.85rem", opacity: empSaving ? 0.5 : 1 }}>
              Bekor qilish
            </button>
            <button type="submit" disabled={empSaving}
              style={{ flex:2, padding:"11px", border:"none", borderRadius:8, background:"#6366f1", color:"#fff", cursor: empSaving ? "not-allowed" : "pointer", font:"inherit", fontSize:"0.85rem", fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {empSaving
                ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"_spin .6s linear infinite" }} />Saqlanmoqda...</>
                : empModal.mode === "add" ? "Qo'shish" : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  if (!fullscreen) return (
    <>
      <section className="monthly-page">{monthlyBody}</section>
      {pickerPanel}
      {empModalPanel}
      {confirmPanel}
    </>
  );

  return createPortal((
    <>
      <div className="monthly-fullscreen-backdrop" role="dialog" aria-modal="true" aria-label="Oylik grafik" onClick={onClose}>
        <section className="monthly-fullscreen" onClick={(event) => event.stopPropagation()}>
          <header className="monthly-fullscreen-head">
            <button type="button" onClick={onClose} aria-label="Orqaga"><ChevronLeft size={20} />Orqaga</button>
            <div><strong>Oylik grafik</strong><span>{MONTH_NAMES[month - 1]} {year}</span></div>
            <i />
          </header>
          <div className="monthly-fullscreen-body">
            <section className="monthly-page">{monthlyBody}</section>
          </div>
        </section>
      </div>
      {pickerPanel}
      {empModalPanel}
      {confirmPanel}
    </>
  ), document.body);
}

function WeeklyPage({ activeDay, currentUser, dashboard, onCreate, onDeleteSchedule, onDayChange, onOpenMonthly, onStatusChange }) {
  const [openMetric, setOpenMetric] = useState("");
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [todayDailyCount, setTodayDailyCount] = useState(null);
  const todayName = todayDayName();

  useEffect(() => {
    const today = localDateStr(new Date());
    const [y, m] = today.split("-").map(Number);
    api(`/api/daily-status?year=${y}&month=${m}`)
      .then((data) => {
        const statuses = data.statuses || {};
        const counts = {};
        for (const empStatuses of Object.values(statuses)) {
          const code = empStatuses[today];
          if (code && code !== "empty") counts[code] = (counts[code] || 0) + 1;
        }
        setTodayDailyCount(counts);
      })
      .catch(() => {});
  }, []);
  const filteredGroups = useMemo(() => {
    const byDay = activeDay === "Barcha kunlar"
      ? dashboard.groups
      : dashboard.groups.filter((group) => group.day === (activeDay === "Bugun" ? todayName : activeDay));
    return byDay.filter((group) => group.people.length > 0);
  }, [activeDay, dashboard.groups, todayName]);
  const visiblePeople = useMemo(() => filteredGroups.flatMap((group) => group.people.map((person) => ({ ...person, groupTitle: group.title, groupMeta: group.meta }))), [filteredGroups]);
  const dayMetrics = useMemo(() => {
    const working = visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "working").length;
    const rest = visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "rest").length;
    return { working, rest, total: visiblePeople.length };
  }, [visiblePeople]);
  const statusSummary = useMemo(() => (
    STATUS_OPTIONS
      .map((status) => ({
        ...status,
        count: visiblePeople.filter((person) => person.statusType === status.id).length
      }))
      .filter((status) => status.count > 0)
      .map((status) => `${status.count} ${status.label}`)
      .join(" • ") || "Bugun uchun smena kiritilmagan"
  ), [visiblePeople]);
  const metricLists = useMemo(() => ({
    working: visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "working"),
    rest: visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "rest"),
    total: visiblePeople
  }), [visiblePeople]);
  const promoItems = useMemo(() => {
    const activePeople = visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric !== "rest");
    const source = activePeople.length ? activePeople : visiblePeople;
    return source.slice(0, 8).map((person) => ({
      id: `${person.groupTitle}-${person.id}-${person.statusType}`,
      name: person.name,
      place: person.groupMeta,
      title: person.groupTitle,
      status: STATUS_META[person.statusType]?.label || person.status,
      code: STATUS_META[person.statusType]?.code || "S",
      time: person.time
    }));
  }, [visiblePeople]);
  const activePromo = promoItems[promoIndex % Math.max(promoItems.length, 1)];

  useEffect(() => {
    setOpenMetric("");
    setOpenGroups(new Set());
    setSelectedPerson(null);
    setPromoIndex(0);
  }, [activeDay, dashboard.week.start]);

  useEffect(() => {
    if (promoItems.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setPromoIndex((value) => (value + 1) % promoItems.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [promoItems.length]);

  function toggleGroup(groupId) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  return (
    <>
      <section className="hero-block">
        <span>{activeDay === "Bugun" ? `Bugun ${dashboard.week.todayLabel}` : dashboard.week.range}</span>
        <h2>{activePromo ? `${activePromo.name} ishda` : "Bugungi ishlar"}</h2>
        <p>{activePromo ? `${activePromo.place} • ${activePromo.time} • ${activePromo.status}` : "Bugungi smena ma'lumotlari shu yerda almashib turadi."}</p>
        <em>{activePromo ? activePromo.code : <CalendarDays size={18} />}</em>
      </section>

      <div className="week-insight">
        <div>
          <span>{activeDay === "Bugun" ? "Bugungi smena" : activeDay}</span>
          <strong>{dayMetrics.working} ishda</strong>
          <p>{statusSummary}</p>
          {activeDay === "Bugun" && todayDailyCount && Object.keys(todayDailyCount).length > 0 && (
            <p className="week-daily-stat">
              {Object.entries(todayDailyCount).map(([code, cnt]) => (
                <span key={code} style={{ color: DAILY_STATUSES[code]?.bg || "#6b7280" }}>
                  <b>{cnt}</b> {DAILY_STATUSES[code]?.name || code}
                </span>
              )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, " • ", el], [])}
            </p>
          )}
        </div>
        <button className="week-insight-action" type="button" onClick={() => onOpenMonthly("weekly")} aria-label="Oylik grafikni ko'rish">
          <CalendarDays size={22} />
          <span>Oylik grafik</span>
        </button>
      </div>

      <section className="metric-grid">
        <MetricCard icon={<UserCheck size={18} />} value={dayMetrics.working} label="Ishlayotganlar" tone="green" active={openMetric === "working"} onClick={() => setOpenMetric(openMetric === "working" ? "" : "working")} />
        <MetricCard icon={<Umbrella size={18} />} value={dayMetrics.rest} label="Damda / ta'tilda" tone="blue" active={openMetric === "rest"} onClick={() => setOpenMetric(openMetric === "rest" ? "" : "rest")} />
        <MetricCard icon={<UsersRound size={19} />} value={dayMetrics.total} label="Jami" tone="purple" active={openMetric === "total"} onClick={() => setOpenMetric(openMetric === "total" ? "" : "total")} />
      </section>

      {openMetric && (
        <PeopleListPanel
          title={openMetric === "working" ? "Ishlayotganlar" : openMetric === "rest" ? "Damda / ta'tilda" : "Jami ro'yxat"}
          people={metricLists[openMetric]}
        />
      )}

      <div className="day-tabs" aria-label="Kunlar">
        {DAY_TABS.map((day) => (
          <button className={activeDay === day ? "active" : ""} type="button" key={day} onClick={() => onDayChange(day)}>
            {day}
          </button>
        ))}
      </div>

      <section className="schedule-groups">
        {filteredGroups.length ? filteredGroups.map((group) => (
          <StudioGroup
            key={group.id}
            group={group}
            open={openGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
            onPersonOpen={(person) => setSelectedPerson({ ...person, groupTitle: group.title, groupMeta: group.meta })}
            onStatusChange={onStatusChange}
          />
        )) : <EmptyCard text="Bu kunga jadval kiritilmagan" />}
      </section>

      {isAdmin(currentUser) && (
        <button className="create-button" type="button" onClick={() => onOpenMonthly("weekly")}>
          <CalendarDays size={17} />
          Oylik grafikda belgilash
        </button>
      )}
      {isSuper(currentUser) && dashboard.week.saved && (
        <button className="danger-button" type="button" onClick={onDeleteSchedule}>
          <Trash2 size={17} />
          Joriy jadvalni o'chirish
        </button>
      )}

      {selectedPerson && (
        <PersonDetailScreen
          person={selectedPerson}
          assignments={dashboard.groups.flatMap((group) => group.people
            .filter((person) => String(person.id) === String(selectedPerson.id))
            .map((person) => ({ ...person, groupTitle: group.title, groupMeta: group.meta, day: group.day })))}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}

function StudioPage({ currentUser, departments, onLoadDepartments, dashboard, onCreate, onDeleteEmployee, onNotify, onSaveEmployee, onOpenMonthly }) {
  const blankEmployee = { name: "", role: "", phone: "", telegram: "", department: "operator", avatar: "", portfolio: [] };
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [draft, setDraft] = useState(blankEmployee);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const visibleEmployees = dashboard.employees.filter((employee) => {
    const query = search.trim().toLowerCase();
    const matchesDepartment = activeDepartment === "all" || employee.department === activeDepartment;
    const matchesSearch = !query || [employee.name, employee.role, employee.phone, departmentMeta(employee.department).label]
      .join(" ")
      .toLowerCase()
      .includes(query);
    return matchesDepartment && matchesSearch;
  });

  function openAddEmployee() {
    setDraft(blankEmployee);
    setEditingId(null);
    setEmployeeModalOpen(true);
  }

  function openEditEmployee(employee) {
    setDraft({ ...blankEmployee, ...employee });
    setEditingId(employee.id);
    setSelectedPerson(null);
    setEmployeeModalOpen(true);
  }

  async function submitEmployee(event) {
    event.preventDefault();
    const invalid = [
      ["name", "F.I.Sh ni kiriting."],
      ["role", "Lavozimni kiriting."],
      ["phone", "Telefon raqamini kiriting."]
    ].find(([field]) => !String(draft[field] || "").trim());
    if (invalid) {
      onNotify(invalid[1], "error");
      formRef.current?.querySelector(`[name='team-${invalid[0]}']`)?.focus();
      return;
    }

    const saved = await onSaveEmployee({ ...draft, id: editingId || draft.id });
    if (!saved) return;
    setEmployeeModalOpen(false);
    setEditingId(null);
    setDraft(blankEmployee);
  }

  async function updateAvatar(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onNotify("Faqat rasm faylini yuklang.", "error");
      return;
    }
    setDraft({ ...draft, avatar: await readImageFile(file) });
  }

  return (
    <section className="team-page" aria-label="Jamoa bo'limi">
      <label className="team-search">
        <span><Search size={15} /></span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Jamoa azolarini ism yoki bo'lim bo'yicha qidirish..." />
      </label>

      <div className="team-actions">
        {isAdmin(currentUser) && (
          <button type="button" onClick={openAddEmployee}>
            <Plus size={15} />
            Yangi Xodim Qo'shish
          </button>
        )}
        {isAdmin(currentUser) && (
          <button className="primary" type="button" onClick={() => onOpenMonthly?.()}>
            <CalendarDays size={15} />
            Oylik grafikda belgilash
          </button>
        )}
      </div>

      <DepartmentTabs
        departments={departments}
        active={activeDepartment}
        onChange={setActiveDepartment}
        currentUser={currentUser}
        onManage={() => setDeptModalOpen(true)}
      />

      <section className="team-list">
        {visibleEmployees.length ? visibleEmployees.map((employee) => {
          const dynDept = departments.find((d) => d.name === employee.department);
          return (
            <button
              className="team-member-row"
              type="button"
              key={employee.id}
              style={{ borderLeftColor: deptColor(employee.department, departments) }}
              onClick={() => setSelectedPerson(employee)}
            >
              <Avatar person={employee} />
              <div className="team-member-main">
                <strong>{employee.name}</strong>
                <span>{employee.role || "Operator"}</span>
              </div>
              <span className="dept-badge" style={{ background: `rgba(${hexToRgb(deptColor(employee.department, departments))}, 0.12)`, color: deptColor(employee.department, departments) }}>
                {dynDept?.label || employee.department}
              </span>
            </button>
          );
        }) : <EmptyCard text="Bu bo'limda xodim yo'q" />}
      </section>

      {selectedPerson && (
        <TeamPersonModal
          currentUser={currentUser}
          person={selectedPerson}
          assignments={dashboard.groups.flatMap((group) => group.people
            .filter((person) => String(person.id) === String(selectedPerson.id))
            .map((person) => ({ ...person, groupTitle: group.title, groupMeta: group.meta, day: group.day })))}
          onClose={() => setSelectedPerson(null)}
          onDelete={(id) => {
            setSelectedPerson(null);
            onDeleteEmployee(id);
          }}
          onEdit={openEditEmployee}
        />
      )}

      {employeeModalOpen && createPortal((
        <div className="modal-backdrop team-modal-backdrop" role="dialog" aria-modal="true" aria-label={editingId ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"} onClick={() => setEmployeeModalOpen(false)}>
          <form ref={formRef} className="schedule-modal team-edit-modal" onSubmit={submitEmployee} onClick={(event) => event.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>{editingId ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}</strong>
              <button type="button" onClick={() => setEmployeeModalOpen(false)}>
                <LogOut size={15} />
                Chiqish
              </button>
            </div>
            <label>
              F.I.Sh
              <input name="team-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ali Valiyev" />
            </label>
            <label>
              Lavozim
              <input name="team-role" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Operator" />
            </label>
            <label>
              Bo'lim
              <select value={draft.department || "operator"} onChange={(event) => setDraft({ ...draft, department: event.target.value })}>
                {(departments.length > 0 ? departments : DEPARTMENTS.map((d) => ({ name: d.id, label: d.label }))).map((dept) => (
                  <option key={dept.name || dept.id} value={dept.name || dept.id}>{dept.label}</option>
                ))}
              </select>
            </label>
            <label>
              Telefon
              <input name="team-phone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+998 90 123 45 67" />
            </label>
            <label>
              Telegram
              <input value={draft.telegram || ""} onChange={(event) => setDraft({ ...draft, telegram: event.target.value })} placeholder="@username yoki link" />
            </label>
            <div className="avatar-upload-field">
              <div className="avatar-upload-preview">
                {draft.avatar ? <img src={draft.avatar} alt="Xodim rasmi" /> : <User size={28} />}
              </div>
              <div>
                <strong>Xodim rasmi</strong>
                <span>{draft.avatar ? "Rasm tanlangan" : "Rasm yuklanmagan"}</span>
              </div>
              <label>
                <Upload size={15} />
                Yuklash
                <input type="file" accept="image/*" onChange={(event) => updateAvatar(event.target.files?.[0])} />
              </label>
            </div>
            <button type="submit">
              <Save size={17} />
              Saqlash
            </button>
          </form>
        </div>
      ), document.body)}

      {scheduleModalOpen && createPortal((
        <div className="modal-backdrop team-modal-backdrop" role="dialog" aria-modal="true" aria-label="Yangi jadval yaratish" onClick={() => setScheduleModalOpen(false)}>
          <section className="schedule-modal team-edit-modal" onClick={(event) => event.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Yangi jadval yaratish</strong>
              <button type="button" onClick={() => setScheduleModalOpen(false)}>
                <LogOut size={15} />
                Chiqish
              </button>
            </div>
            <p className="team-modal-copy">Jadval avtomatik yaratiladi va mavjud hafta ma'lumotlari yangilanadi.</p>
            <button type="button" onClick={() => {
              setScheduleModalOpen(false);
              onCreate();
            }}>
              <RefreshCcw size={17} />
              Yaratish
            </button>
          </section>
        </div>
      ), document.body)}

      {deptModalOpen && (
        <DepartmentManagerModal
          departments={departments}
          onClose={() => setDeptModalOpen(false)}
          onSave={() => { onLoadDepartments(); setDeptModalOpen(false); }}
          onDelete={() => onLoadDepartments()}
          onNotify={onNotify}
        />
      )}
    </section>
  );
}

function TeamPersonModal({ assignments = [], currentUser, onClose, onDelete, onEdit, person }) {
  const department = departmentMeta(person.department);
  const kpi = calculateEfficiency(assignments);
  const [documentMode, setDocumentMode] = useState("word");

  return createPortal((
    <div className="team-person-backdrop" role="dialog" aria-modal="true" aria-label={`Xodimlarni boshqarish: ${person.name}`} onClick={onClose}>
      <button className="team-modal-exit" type="button" onClick={onClose}>
        <LogOut size={16} />
        Chiqish
      </button>
      <section className="team-person-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="team-sheet-handle" />
        <h2>Xodimlarni Boshqarish: {person.name}</h2>
        <div className="document-view-actions team-document-actions">
          <button className={documentMode === "word" ? "active" : ""} type="button" onClick={() => setDocumentMode("word")}>
            <FileText size={16} />
            Word ko'rish
          </button>
          <button className={documentMode === "excel" ? "active" : ""} type="button" onClick={() => setDocumentMode("excel")}>
            <FileSpreadsheet size={16} />
            Excel ko'rish
          </button>
          <button type="button" onClick={() => downloadEmployeeFiles(person, assignments)}>
            <Download size={16} />
            Yuklab olish
          </button>
        </div>
        <article className="team-person-card">
          <div className="team-person-head">
            <Avatar person={person} />
            <strong>{person.name}</strong>
          </div>
          <dl>
            <div><dt>Lavozimi:</dt><dd>{person.role || "Operator"}</dd></div>
            <div><dt>Bo'lim:</dt><dd>{department.label}</dd></div>
            <div><dt>Telefon:</dt><dd>
              {person.phone
                ? <a href={`tel:${cleanPhone(person.phone)}`} className="phone-link" onClick={(e) => e.stopPropagation()}>{person.phone}</a>
                : "+998 90 123 45 67"}
            </dd></div>
            <div><dt>Faoliyat:</dt><dd>Faol</dd></div>
          </dl>
          <section className="team-person-kpi" aria-label="Joriy oy samaradorligi">
            <div>
              <span>Joriy oy samaradorligi</span>
              <strong>{kpi}%</strong>
            </div>
            <i><b style={{ width: `${kpi}%` }} /></i>
          </section>
          <div className="team-person-actions">
            {isAdmin(currentUser) && (
              <button type="button" onClick={() => onEdit(person)}>
                <Edit3 size={15} />
                TAHRIRLASH
              </button>
            )}
            {isSuper(currentUser) && (
              <button className="danger" type="button" onClick={() => onDelete(person.id)}>
                <Trash2 size={15} />
                O'CHIRISH
              </button>
            )}
          </div>
        </article>
        <EmployeeDocumentView employee={person} assignments={assignments} mode={documentMode} />
      </section>
    </div>
  ), document.body);
}

function AttendancePanel({ attendance = {}, employees, onScan }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const rows = attendance.rows || [];
  const recent = attendance.recent || [];
  const selectedRow = rows.find((row) => String(row.employeeId) === String(selectedEmployeeId));
  const selectedActive = Boolean(selectedRow?.active);

  useEffect(() => {
    if (!selectedEmployeeId && employees.length) setSelectedEmployeeId(String(employees[0].id));
  }, [employees, selectedEmployeeId]);

  return (
    <section className="attendance-panel">
      <div className="attendance-head">
        <div>
          <h2>Face ID nazorati</h2>
          <p>Bugungi kirish-chiqish va oylik ish soatlari</p>
        </div>
        <span>{attendance.activeNow || 0} ichkarida</span>
      </div>

      <div className="attendance-scan">
        <label>
          Xodim
          <select value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)}>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name} - {departmentMeta(employee.department).shortLabel}</option>
            ))}
          </select>
        </label>
        <button type="button" disabled={!selectedEmployeeId} onClick={() => onScan(selectedEmployeeId)}>
          <UserCheck size={18} />
          {selectedActive ? "Face ID chiqish" : "Face ID kirish"}
        </button>
      </div>

      <div className="attendance-metrics">
        <div>
          <strong>{attendance.todayScans || 0}</strong>
          <span>bugungi skan</span>
        </div>
        <div>
          <strong>{formatDuration(attendance.todayMinutes)}</strong>
          <span>bugungi soat</span>
        </div>
        <div>
          <strong>{formatDuration(attendance.monthMinutes)}</strong>
          <span>oylik jami</span>
        </div>
      </div>

      <div className="attendance-list">
        {rows.length ? rows.map((row) => (
          <article className={row.active ? "active" : ""} key={row.employeeId}>
            <div>
              <strong>{row.name}</strong>
              <span>{row.active ? "Ishxonada" : "Chiqib ketgan"} • bugun {formatDuration(row.todayMinutes)}</span>
            </div>
            <em>{formatDuration(row.monthMinutes)}</em>
          </article>
        )) : (
          <p className="attendance-empty">Hozircha Face ID skanlari yo'q</p>
        )}
      </div>

      {recent.length > 0 && (
        <div className="attendance-recent">
          {recent.slice(0, 3).map((record) => (
            <span key={record.id}>{record.employeeName}: {record.checkOut ? "chiqish" : "kirish"} {formatDateTime(record.checkOut || record.checkIn)}</span>
          ))}
        </div>
      )}
    </section>
  );
}

const StudioGroup = React.memo(function StudioGroup({ group, open = true, onPersonOpen, onToggle, onStatusChange }) {
  return (
    <article className="group-card">
      <button className={`group-head ${group.tone}`} type="button" onClick={onToggle} aria-expanded={open}>
        <strong>{group.title}</strong>
        <span>{group.meta}</span>
        <span className="group-count">{group.people.length} ta</span>
        <ChevronDown className={open ? "open" : ""} size={20} />
      </button>
      {open && (
        <div className="group-people">
          {group.people.map((person) => (
            <StaffRow key={person.id} groupId={group.id} person={person} onPersonOpen={onPersonOpen} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </article>
  );
});

const StaffRow = React.memo(function StaffRow({ groupId, person, onPersonOpen, onStatusChange }) {
  const department = departmentMeta(person.department);
  const phone = cleanPhone(person.phone);
  const telegram = telegramHref(person.telegram);

  return (
    <article className={`staff-row department-${department.id}`}>
      <Avatar person={person} />
      <button className="staff-main" type="button" onClick={() => onPersonOpen?.(person)}>
        <strong>{person.name}</strong>
        <span>{department.label} • {person.employeeId ? `ID: ${person.employeeId}` : person.time}</span>
      </button>
      <ContactActions phone={phone} telegram={telegram} />
      {onStatusChange ? (
        <select className={`status-select ${person.statusType}`} value={person.statusType} onChange={(event) => onStatusChange(groupId, person.id, event.target.value)} aria-label={`${person.name} statusi`}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.id} value={status.id}>{status.code} - {status.label}</option>
          ))}
        </select>
      ) : (
        <span className={`status-pill ${person.statusType}`}>
          <i />
          {person.status}
        </span>
      )}
    </article>
  );
});

function PersonDetailScreen({ assignments, onClose, person }) {
  const department = departmentMeta(person.department);
  const phone = cleanPhone(person.phone);
  const telegram = telegramHref(person.telegram);
  const workingCount = assignments.filter((assignment) => STATUS_META[assignment.statusType]?.metric === "working").length;
  const restCount = assignments.filter((assignment) => STATUS_META[assignment.statusType]?.metric === "rest").length;
  const kpi = calculateEfficiency(assignments);

  return createPortal((
    <div className="person-sheet-backdrop" role="dialog" aria-modal="true" aria-label={`${person.name} ma'lumotlari`} onClick={onClose}>
      <section className="person-sheet" onClick={(event) => event.stopPropagation()}>
        <header className="person-sheet-top">
          <button className="person-sheet-exit" type="button" onClick={onClose}>
            <ChevronLeft size={18} />
            Orqaga
          </button>
          <span>{STATUS_META[person.statusType]?.code || "S"} - {STATUS_META[person.statusType]?.label || person.status}</span>
          <button className="person-sheet-close" type="button" onClick={onClose} aria-label="Chiqish">×</button>
        </header>

        <div className="person-sheet-head">
          <Avatar person={person} />
          <div>
            <strong>{person.name}</strong>
            <span>{department.label}</span>
          </div>
        </div>

        <section className="person-kpi">
          <div>
            <span>Joriy oy samaradorligi</span>
            <strong>{kpi}%</strong>
          </div>
          <i><b style={{ width: `${kpi}%` }} /></i>
        </section>

        <section className="person-stats-grid">
          <div>
            <strong>{assignments.length}</strong>
            <span>Ushbu hafta smena</span>
          </div>
          <div>
            <strong>{workingCount}</strong>
            <span>Ishda</span>
          </div>
          <div>
            <strong>{restCount}</strong>
            <span>Dam/ta'til</span>
          </div>
        </section>

        <section className="person-contact-grid">
          <a className={!phone ? "disabled" : ""} href={phone ? `tel:${phone}` : undefined}>
            <Phone size={17} />
            <span>{person.phone || "Telefon yo'q"}</span>
          </a>
          <a className={!telegram ? "disabled" : ""} href={telegram || undefined} target="_blank" rel="noreferrer">
            <Send size={17} />
            <span>{telegram ? "Telegram" : "Telegram yo'q"}</span>
          </a>
        </section>

        <section className="person-assignments">
          <strong>Yaqin smenkalar</strong>
          {assignments.length ? assignments.slice(0, 6).map((assignment) => {
            const status = STATUS_META[assignment.statusType] || STATUS_META.working;
            return (
              <article key={`${assignment.groupTitle}-${assignment.groupMeta}-${assignment.statusType}`}>
                <div>
                  <span>{assignment.groupTitle}</span>
                  <em>{assignment.groupMeta} • {assignment.time}</em>
                </div>
                <b className={assignment.statusType}>{status.code}</b>
              </article>
            );
          }) : <EmptyCard text="Yaqin smenkalar topilmadi" />}
        </section>
      </section>
    </div>
  ), document.body);
}

function PeopleListPanel({ title, people }) {
  return (
    <section className="people-list-panel">
      <div className="people-list-head">
        <strong>{title}</strong>
        <span>{people.length} ta</span>
      </div>
      {people.length ? people.map((person) => {
        const status = STATUS_META[person.statusType] || STATUS_META.working;
        return (
          <article className={`people-list-row ${person.statusType}`} key={`${person.groupTitle}-${person.id}-${person.statusType}`}>
            <Avatar person={person} />
            <div>
              <strong>{person.name}</strong>
              <span>{person.groupTitle} • {person.groupMeta}</span>
            </div>
            <em>{status.code} - {status.label}</em>
          </article>
        );
      }) : <p className="people-list-empty">Bu bo'limda xodim yo'q</p>}
    </section>
  );
}

function EmployeeManager({ employees, onDelete, onNotify, onSave }) {
  const blank = { name: "", role: "", phone: "", telegram: "", department: "operator", avatar: "", portfolio: [] };
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState("all");
  const formRef = useRef(null);
  const filteredEmployees = activeDepartment === "all" ? employees : employees.filter((employee) => employee.department === activeDepartment);

  function startEdit(employee) {
    setEditingId(employee.id);
    setDraft(employee);
    setModalOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    const requiredFields = [
      ["name", "F.I.Sh ni kiriting."],
      ["role", "Lavozimni kiriting."],
      ["phone", "Telefon raqamini kiriting."]
    ];
    const invalid = requiredFields.find(([field]) => !String(draft[field] || "").trim());
    if (invalid) {
      onNotify(invalid[1], "error");
      formRef.current?.querySelector(`[name='${invalid[0]}']`)?.focus();
      return;
    }

    const saved = await onSave(draft);
    if (!saved) return;
    setDraft(blank);
    setEditingId(null);
    setModalOpen(false);
  }

  async function updateAvatar(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onNotify("Faqat rasm faylini yuklang.", "error");
      return;
    }

    const image = await readImageFile(file);
    setDraft({ ...draft, avatar: image });
    onNotify("Xodim rasmi tanlandi");
  }

  return (
    <section className="employee-card">
      <div className="section-head">
        <h2>Xodimlar</h2>
        <span>{employees.length} ta</span>
      </div>
      <button className="employee-add-button" type="button" onClick={() => {
        setDraft(blank);
        setEditingId(null);
        setModalOpen(true);
      }}>
        <Plus size={18} />
        Yangi xodim qo'shish
      </button>
      <div className="department-tabs">
        <button className={activeDepartment === "all" ? "active" : ""} type="button" onClick={() => setActiveDepartment("all")}>Hammasi</button>
        {DEPARTMENTS.map((department) => (
          <button className={activeDepartment === department.id ? "active" : ""} type="button" key={department.id} onClick={() => setActiveDepartment(department.id)}>
            {department.shortLabel}
          </button>
        ))}
      </div>
      <div className="employee-list">
        {filteredEmployees.map((employee) => (
          <article className={`employee-row department-${employee.department || "operator"}`} key={employee.id}>
            <Avatar person={employee} />
            <div>
              <strong>{employee.name}</strong>
              <span>{departmentMeta(employee.department).label} • {employee.phone}</span>
            </div>
            <button type="button" aria-label="Tahrirlash" onClick={() => startEdit(employee)}><Edit3 size={16} /></button>
            <button type="button" aria-label="O'chirish" onClick={() => onDelete(employee.id)}><Trash2 size={16} /></button>
          </article>
        ))}
      </div>
      {modalOpen && createPortal((
        <div className="modal-backdrop employee-modal-backdrop" role="dialog" aria-modal="true" aria-label={editingId ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"} onClick={() => setModalOpen(false)}>
          <form ref={formRef} className="schedule-modal employee-modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>{editingId ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}</strong>
              <button type="button" onClick={() => setModalOpen(false)}>
                <LogOut size={15} />
                Chiqish
              </button>
            </div>
            <label>
              F.I.Sh
              <input name="name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="F.I.Sh" />
            </label>
            <label>
              Lavozim
              <input name="role" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Operator" />
            </label>
            <label>
              Bo'lim
              <select name="department" value={draft.department || "operator"} onChange={(event) => setDraft({ ...draft, department: event.target.value })}>
                {DEPARTMENTS.map((department) => (
                  <option key={department.id} value={department.id}>{department.label}</option>
                ))}
              </select>
            </label>
            <label>
              Telefon
              <input name="phone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+998 ..." />
            </label>
            <label>
              Telegram
              <input name="telegram" value={draft.telegram || ""} onChange={(event) => setDraft({ ...draft, telegram: event.target.value })} placeholder="@username yoki link" />
            </label>
            <div className="avatar-upload-field">
              <div className="avatar-upload-preview">
                {draft.avatar ? <img src={draft.avatar} alt="Xodim rasmi" /> : <User size={28} />}
              </div>
              <div>
                <strong>Xodim rasmi</strong>
                <span>{draft.avatar ? "Rasm tanlangan" : "Rasm yuklanmagan"}</span>
              </div>
              <label>
                <Upload size={15} />
                Yuklash
                <input type="file" accept="image/*" onChange={(event) => updateAvatar(event.target.files?.[0])} />
              </label>
            </div>
            <button type="submit">
              {editingId ? <Save size={17} /> : <Plus size={17} />}
              {editingId ? "Saqlash" : "Qo'shish"}
            </button>
          </form>
        </div>
      ), document.body)}
    </section>
  );
}

function DocumentsPage({ employees, onNotify, onSaveEmployee, currentUser }) {
  // All non-admin users see only their own employee's documents
  const xodimEmployee = (() => {
    if (isAdmin(currentUser)) return null; // admins see all via dropdown
    if (currentUser?.employeeId != null) {
      const found = employees.find((e) => String(e.id) === String(currentUser.employeeId));
      if (found) return found;
    }
    const nm = normalizeLookupName(currentUser?.name || "");
    if (!nm) return null;
    return employees.find((e) => {
      const en = normalizeLookupName(e.name || "");
      return en === nm || en.split(" ")[0] === nm.split(" ")[0];
    }) || null;
  })();
  const isOwnEmployee = !isAdmin(currentUser) && xodimEmployee != null;
  const ownEmpId = xodimEmployee ? String(xodimEmployee.id) : null;
  // For admins: find their own employee to default the dropdown to
  const adminOwnEmployee = (() => {
    if (!isAdmin(currentUser)) return null;
    if (currentUser?.employeeId != null) {
      return employees.find(e => String(e.id) === String(currentUser.employeeId)) || null;
    }
    const nm = normalizeLookupName(currentUser?.name || "");
    if (!nm) return null;
    return employees.find(e => {
      const en = normalizeLookupName(e.name || "");
      return en === nm || en.split(" ")[0] === nm.split(" ")[0];
    }) || null;
  })();
  const visibleEmployees = isOwnEmployee
    ? employees.filter((e) => String(e.id) === ownEmpId)
    : employees;
  const [selectedId, setSelectedId] = useState(() => {
    if (isOwnEmployee) return ownEmpId || "";
    // Admins: default to their own employee, else first in list
    return adminOwnEmployee ? String(adminOwnEmployee.id) : (employees[0]?.id || "");
  });
  const [draft, setDraft] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [documentMode, setDocumentMode] = useState("word");
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingCat, setUploadingCat] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCatOpen, setShareCatOpen] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [tgDocModal, setTgDocModal] = useState(null);
  const formRef = useRef(null);
  const catInputRefs = useRef({});

  const DOC_CATEGORIES = [
    { id: "passport-front", label: "Pasport — old tomoni", emoji: "🛂" },
    { id: "passport-back", label: "Pasport — orqa tomoni", emoji: "🛂" },
    { id: "photo3x4", label: "3×4 rasm", emoji: "📷" },
    { id: "intpassport-front", label: "Xorijiy pasport — old tomoni", emoji: "✈️" },
    { id: "intpassport-back", label: "Xorijiy pasport — orqa tomoni", emoji: "✈️" },
    { id: "other", label: "Boshqa hujjatlar", emoji: "📄" },
  ];

  function getFilesByCategory(cat) {
    return uploadedFiles.filter((f) => f.category === cat || (!f.category && cat === "other"));
  }

  async function sendToTelegram() {
    if (!draft) return;
    if (!tgChatId.trim()) { onNotify("Chat ID kiriting", "error"); return; }
    setTgSending(true);
    try {
      const model = employeeDocumentModel(draft);
      let blob, fileName;
      if (tgFileType === "jpeg") {
        blob = await buildEmployeeJpegBlob(model);
        fileName = `${safeFileName(draft.name)}.jpg`;
      } else if (tgFileType === "word") {
        blob = buildDocxBlob(model);
        fileName = `${safeFileName(draft.name)}.docx`;
      } else {
        blob = buildXlsxBlob(model);
        fileName = `${safeFileName(draft.name)}.xlsx`;
      }
      if (!blob) throw new Error("Fayl yaratib bo'lmadi");
      const dept = departmentMeta(draft.department).label;
      const caption = `👤 ${draft.name}\n💼 ${draft.role || "Operator"}\n🏢 ${dept}\n📞 ${draft.phone || "—"}${draft.telegram ? `\n✈️ ${draft.telegram}` : ""}`;
      const fd = new FormData();
      fd.append("chatId", tgChatId.trim());
      fd.append("caption", caption);
      fd.append("employeeId", String(draft.id));
      fd.append("file", new File([blob], fileName, { type: blob.type }));
      const res = await apiFetch("/api/share-to-telegram", { method: "POST", body: fd });
      onNotify(res.message || "Telegram ga yuborildi ✓");
      setTgShareOpen(false);
      setTgChatId("");
    } catch (err) {
      onNotify(err.message || "Yuborishda xato", "error");
    } finally {
      setTgSending(false);
    }
  }

  useEffect(() => {
    if (!selectedId) return;
    if (!isAdmin(currentUser) && !isOwnEmployee) return;
    const id = selectedId;
    apiFetch(`/api/employees/${id}/uploaded-files`)
      .then((data) => setUploadedFiles(data.files || []))
      .catch(() => setUploadedFiles([]));
  }, [selectedId, currentUser]);

  async function handleFileUpload(e, category) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { onNotify("Fayl hajmi 15MB dan oshmasligi kerak", "error"); return; }
    setUploadingCat(category);
    try {
      const result = await apiFetch(`/api/employees/${selectedId}/upload-document?category=${encodeURIComponent(category)}`, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream", "X-Filename": encodeURIComponent(file.name) },
        body: file
      });
      setUploadedFiles((prev) => [result, ...prev]);
      onNotify("Fayl muvaffaqiyatli yuklandi ✓");
    } catch (err) {
      onNotify(err.message || "Yuklashda xato", "error");
    } finally {
      setUploadingCat(null);
      if (catInputRefs.current[category]) catInputRefs.current[category].value = "";
    }
  }

  async function downloadCombinedDocJpeg() {
    const imageFiles = uploadedFiles.filter((f) => f.type === "image");
    if (!imageFiles.length) { onNotify("Yuklangan rasm topilmadi", "warning"); return; }
    try {
      const loaded = await Promise.all(imageFiles.map((f) => new Promise((res, rej) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res({ img, f });
        img.onerror = () => res(null);
        img.src = `${f.url}?t=${Date.now()}`;
      })));
      const valid = loaded.filter(Boolean);
      if (!valid.length) { onNotify("Rasmlarni yuklashda xato", "error"); return; }
      const COLS = 2;
      const CELL_W = 420;
      const CELL_H = 300;
      const LABEL_H = 28;
      const HEADER_H = 52;
      const rows = Math.ceil(valid.length / COLS);
      const W = COLS * CELL_W;
      const H = HEADER_H + rows * CELL_H;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#1e40af"; ctx.fillRect(0, 0, W, HEADER_H);
      ctx.fillStyle = "#fff"; ctx.font = "bold 17px Arial";
      ctx.fillText(`${draft?.name || ""} — Shaxsiy hujjatlar`, 16, 34);
      valid.forEach(({ img, f }, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = col * CELL_W;
        const y = HEADER_H + row * CELL_H;
        ctx.fillStyle = "#f1f5f9"; ctx.fillRect(x, y, CELL_W, LABEL_H);
        ctx.fillStyle = "#334155"; ctx.font = "12px Arial";
        const catLabel = DOC_CATEGORIES.find((c) => c.id === f.category)?.label || "Hujjat";
        ctx.fillText(`${catLabel}`, x + 8, y + 18);
        ctx.strokeStyle = "#e2e8f0"; ctx.strokeRect(x, y, CELL_W, CELL_H);
        const drawH = CELL_H - LABEL_H;
        const scale = Math.min((CELL_W - 16) / img.naturalWidth, (drawH - 16) / img.naturalHeight);
        const iw = img.naturalWidth * scale;
        const ih = img.naturalHeight * scale;
        ctx.drawImage(img, x + (CELL_W - iw) / 2, y + LABEL_H + (drawH - ih) / 2, iw, ih);
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.download = `${safeFileName(draft?.name || "xodim")}-hujjatlar.jpg`;
      link.click();
      onNotify("Hujjatlar JPEG sifatida yuklandi ✓");
    } catch (err) { onNotify("Xato: " + err.message, "error"); }
  }

  function openCatShare(catFiles, cat, platform, enc) {
    setShareCatOpen(null);
    if (platform === "tg") {
      setTgDocModal({ cat, catFiles, empId: draft?.id });
      return;
    }
    if (!catFiles.length) { onNotify("Bu bo'limda fayl yuklanmagan", "warning"); return; }
    const shareFile = catFiles[0];
    if (platform === "wa") window.open(`https://wa.me/?text=${enc}`, "_blank");
    else if (platform === "em") window.open(`mailto:?subject=${encodeURIComponent(cat.label)}&body=${enc}`);
    else if (platform === "fb") window.open(`https://www.facebook.com/sharer/sharer.php?quote=${enc}&u=https%3A%2F%2F95.111.247.157`, "_blank");
    else {
      if (shareFile.type === "image") {
        const a = document.createElement("a");
        a.href = `${shareFile.url}?t=${Date.now()}`;
        a.download = shareFile.filename || "doc.jpg";
        a.click();
      }
    }
  }

  async function deleteUploadedFile(filename) {
    if (!await showConfirm(`"${filename}" faylini o'chirasizmi?`)) return;
    try {
      await apiFetch(`/api/employees/${selectedId}/uploaded-files/${encodeURIComponent(filename)}`, { method: "DELETE" });
      setUploadedFiles((prev) => prev.filter((f) => f.filename !== filename));
      onNotify("Fayl o'chirildi");
    } catch (err) {
      onNotify(err.message || "O'chirishda xato", "error");
    }
  }

  useEffect(() => {
    const emp = visibleEmployees.find((e) => String(e.id) === String(selectedId)) || visibleEmployees[0] || null;
    if (!emp) { setDraft(null); return; }
    setDraft({
      id: emp.id,
      name: emp.name || "",
      role: emp.role || "",
      phone: emp.phone || "",
      telegram: emp.telegram || "",
      department: emp.department || "operator",
      address: emp.address || "",
      portfolio: emp.portfolio || [],
      avatar: emp.avatar || "",
      documents: {}
    });
    if (String(emp.id) !== String(selectedId)) setSelectedId(emp.id);
  }, [visibleEmployees, selectedId]);

  useEffect(() => {
    if (!selectedId) return undefined;
    if (!isAdmin(currentUser) && !isOwnEmployee) return undefined;
    let cancelled = false;
    api(`/api/employees/${selectedId}/documents`).then((result) => {
      if (cancelled || !result) return;
      setDraft((prev) => (prev && String(prev.id) === String(selectedId)
        ? { ...prev, address: result.address || prev.address, documents: result.documents || {} }
        : prev));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [selectedId, currentUser]);

  function openEdit() {
    if (!draft) return;
    const documents = draft.documents || {};
    const passportInfo = documents.passportInfo || {};
    setEditDraft({
      id: draft.id,
      name: draft.name || "",
      role: draft.role || "",
      phone: draft.phone || "",
      telegram: draft.telegram || "",
      department: draft.department || "operator",
      address: draft.address || "",
      portfolio: (draft.portfolio || []).map((item) => ({ ...item })),
      avatar: draft.avatar || "",
      photo3x4: documents.photo3x4 || "",
      passportUz: documents.passportUz || "",
      passportSeries: passportInfo.series || "",
      passportNumber: passportInfo.number || "",
      passportPinfl: passportInfo.pinfl || "",
      passportBirthDate: passportInfo.birthDate || "",
      passportIssuedBy: passportInfo.issuedBy || "",
      passportIssuedDate: passportInfo.issuedDate || "",
      passportExpiryDate: passportInfo.expiryDate || ""
    });
    setEditOpen(true);
  }

  async function updateDocumentImage(field, file) {
    if (!file) return;
    try {
      const image = await readImageFile(file);
      setEditDraft((prev) => ({ ...prev, [field]: image }));
    } catch (error) {
      onNotify(error.message || "Faylni yuklab bo'lmadi", "error");
    }
  }

  function updatePortfolio(index, field, value) {
    const portfolio = [...(editDraft.portfolio || [])];
    portfolio[index] = { ...(portfolio[index] || {}), [field]: value };
    setEditDraft({ ...editDraft, portfolio });
  }

  function addPortfolioItem() {
    setEditDraft({
      ...editDraft,
      portfolio: [
        ...(editDraft.portfolio || []),
        { title: "", url: "", date: new Date().toISOString().slice(0, 10) }
      ]
    });
    onNotify("Portfolio qatori qo'shildi. Syomka nomi va linkini to'ldiring.");
  }

  function removePortfolioItem(index) {
    setEditDraft({
      ...editDraft,
      portfolio: (editDraft.portfolio || []).filter((_, i) => i !== index)
    });
  }

  async function submit(event) {
    event.preventDefault();
    const requiredFields = [
      ["documents-name", editDraft.name, "Ism familiyani kiriting."],
      ["documents-role", editDraft.role, "Lavozimini kiriting."]
    ];
    const invalid = requiredFields.find(([, value]) => !String(value || "").trim());
    if (invalid) {
      onNotify(invalid[2], "error");
      formRef.current?.querySelector(`[name='${invalid[0]}']`)?.focus();
      return;
    }

    const invalidPortfolio = (editDraft.portfolio || []).findIndex((item) => !String(item.title || "").trim() || !String(item.url || "").trim());
    if (invalidPortfolio !== -1) {
      onNotify("Portfolio uchun syomka nomi va linkini to'liq kiriting.", "error");
      const item = (editDraft.portfolio || [])[invalidPortfolio];
      const field = !String(item?.title || "").trim() ? "title" : "url";
      formRef.current?.querySelector(`[name='portfolio-${field}-${invalidPortfolio}']`)?.focus();
      return;
    }

    setSaving(true);
    const saved = await onSaveEmployee({
      id: editDraft.id,
      name: editDraft.name,
      role: editDraft.role,
      phone: editDraft.phone,
      telegram: editDraft.telegram,
      department: editDraft.department,
      address: editDraft.address,
      portfolio: editDraft.portfolio,
      avatar: editDraft.avatar || editDraft.photo3x4 || ""
    });
    if (!saved) { setSaving(false); return; }

    try {
      const passportInfo = {
        series: editDraft.passportSeries,
        number: editDraft.passportNumber,
        pinfl: editDraft.passportPinfl,
        birthDate: editDraft.passportBirthDate,
        issuedBy: editDraft.passportIssuedBy,
        issuedDate: editDraft.passportIssuedDate,
        expiryDate: editDraft.passportExpiryDate
      };
      const documents = {
        ...(editDraft.photo3x4 ? { photo3x4: editDraft.photo3x4 } : {}),
        ...(editDraft.passportUz ? { passportUz: editDraft.passportUz } : {}),
        ...(Object.values(passportInfo).some((value) => String(value || "").trim()) ? { passportInfo } : {})
      };
      const result = await api(`/api/employees/${editDraft.id}/documents`, {
        method: "PUT",
        body: JSON.stringify({ address: editDraft.address, documents })
      });
      setDraft((prev) => (prev && String(prev.id) === String(editDraft.id)
        ? { ...prev, address: result?.address ?? editDraft.address, documents: result?.documents || documents }
        : prev));
    } catch (error) {
      onNotify(error.message || "Hujjat ma'lumotlarini saqlab bo'lmadi", "error");
    }

    setSaving(false);
    setEditOpen(false);
  }

  if (!draft) return <EmptyCard text="Xodimlar ro'yxati bo'sh" />;

  return (
    <section className="documents-page" onClick={() => { if (shareOpen) setShareOpen(false); if (shareCatOpen) setShareCatOpen(null); }}>
      <section className="documents-card">
        <div className="section-head">
          <h2>Hujjatlar</h2>
          <span>{(draft.portfolio || []).length} video</span>
        </div>
        {isAdmin(currentUser) && (
          <label className="document-select">
            Xodim
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
          </label>
        )}
        <div className="document-profile">
          <Avatar person={draft} />
          <div>
            <strong>{draft.name}</strong>
            <span>{draft.role}</span>
          </div>
        </div>
        {(isAdmin(currentUser) || isOwnEmployee) && (
          <div className="document-view-actions">
            <button className={documentMode === "word" ? "active" : ""} type="button" onClick={() => setDocumentMode("word")}>
              <FileText size={16} />
              Word ko'rish
            </button>
            <button className={documentMode === "excel" ? "active" : ""} type="button" onClick={() => setDocumentMode("excel")}>
              <FileSpreadsheet size={16} />
              Excel ko'rish
            </button>
            <button className={documentMode === "jpeg" ? "active" : ""} type="button" onClick={() => setDocumentMode("jpeg")}>
              <Image size={16} />
              JPEG ko'rish
            </button>
            <button type="button" onClick={() => {
              const model = employeeDocumentModel(draft);
              const fileName = safeFileName(model.name);
              downloadBlob(buildDocxBlob(model), `${fileName}.docx`);
              window.setTimeout(() => downloadBlob(buildXlsxBlob(model), `${fileName}.xlsx`), 120);
              window.setTimeout(() => {
                buildEmployeeJpegBlob(model, uploadedFiles).then((blob) => {
                  if (blob) downloadBlob(blob, `${fileName}.jpg`);
                });
              }, 240);
            }}>
              <Download size={16} />
              Yuklab olish
            </button>
            <div className="share-btn-wrap">
              <button type="button" onClick={() => setShareOpen((v) => !v)}>
                <Send size={16} />
                Ulashish
              </button>
              {shareOpen && draft && (() => {
                const dept = departmentMeta(draft.department).label;
                const shareText = `${draft.name}\nLavozim: ${draft.role || "Operator"}\nBo'lim: ${dept}\nTelefon: ${draft.phone || "—"}${draft.telegram ? `\nTelegram: ${draft.telegram}` : ""}`;
                const enc = encodeURIComponent(shareText);
                async function withJpeg(cb) {
                  try {
                    const blob = await buildEmployeeJpegBlob(employeeDocumentModel(draft), uploadedFiles);
                    if (blob) downloadBlob(blob, `${safeFileName(draft.name)}.jpg`);
                  } catch {}
                  cb();
                }
                return (
                  <div className="share-panel" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="share-option tg" onClick={() => {
                      setShareOpen(false);
                      withJpeg(() => {
                        const a = document.createElement("a");
                        a.href = `tg://msg?text=${enc}`;
                        a.click();
                      });
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
                      Telegram
                    </button>
                    <button type="button" className="share-option wa" onClick={() => { setShareOpen(false); withJpeg(() => window.open(`https://wa.me/?text=${enc}`, "_blank")); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </button>
                    <button type="button" className="share-option em" onClick={() => { setShareOpen(false); window.open(`mailto:?subject=${encodeURIComponent(draft.name)}&body=${enc}`); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      Email
                    </button>
                    <button type="button" className="share-option fb" onClick={() => { setShareOpen(false); withJpeg(() => window.open(`https://www.facebook.com/sharer/sharer.php?quote=${enc}&u=https%3A%2F%2F95.111.247.157`, "_blank")); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        {(isAdmin(currentUser) || isOwnEmployee) && (
          <button className="document-edit-open" type="button" onClick={openEdit}>
            <Edit3 size={17} />
            Ma'lumotlarni tahrirlash
          </button>
        )}

        {/* ── Categorized document upload ── */}
        <div className="doc-categories">
          {DOC_CATEGORIES.map((cat) => {
            const catFiles = getFilesByCategory(cat.id);
            const isUploading = uploadingCat === cat.id;
            return (
              <div className="doc-category-slot" key={cat.id}>
                <div className="doc-category-header">
                  <span className="doc-category-label">{cat.emoji} {cat.label}</span>
                  {(isAdmin(currentUser) || isOwnEmployee) && (
                    <div className="doc-cat-actions">
                      <div className="share-btn-wrap">
                        <button type="button" className="doc-category-share-btn" onClick={(e) => { e.stopPropagation(); setShareCatOpen((v) => v === cat.id ? null : cat.id); }}>
                          <Send size={13} />
                          Ulashish
                        </button>
                        {shareCatOpen === cat.id && (() => {
                          const shareText = `${draft?.name || ""} — ${cat.emoji} ${cat.label}`;
                          const enc = encodeURIComponent(shareText);
                          return (
                            <div className="share-panel" onClick={(e) => e.stopPropagation()}>
                              <button type="button" className="share-option tg" onClick={() => openCatShare(catFiles, cat, "tg", enc)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
                                Telegram
                              </button>
                              <button type="button" className="share-option wa" onClick={() => openCatShare(catFiles, cat, "wa", enc)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                              </button>
                              <button type="button" className="share-option em" onClick={() => openCatShare(catFiles, cat, "em", enc)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                Email
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      <label className={`doc-category-upload-btn${isUploading ? " uploading" : ""}`}>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          style={{ display: "none" }}
                          disabled={isUploading}
                          ref={(el) => { catInputRefs.current[cat.id] = el; }}
                          onChange={(e) => handleFileUpload(e, cat.id)}
                        />
                        <Upload size={13} />
                        {isUploading ? "Yuklanmoqda..." : catFiles.length ? "Yana yuklash" : "Yuklash"}
                      </label>
                    </div>
                  )}
                </div>
                {catFiles.length > 0 && (
                  <div className="doc-category-files">
                    {catFiles.map((doc) => (
                      <div className="doc-item" key={doc.filename} onClick={() => setPreviewFile({ ...doc, catLabel: cat.label })} style={{ cursor: "pointer" }}>
                        {doc.type === "image" && (
                          <img src={doc.url} alt={cat.label} className="doc-item-thumbnail" />
                        )}
                        {doc.type !== "image" && (
                          <div className="doc-file-icon"><FileText size={18} /></div>
                        )}
                        <div className="doc-item-info">
                          <span className="doc-item-name">{cat.label}</span>
                          {doc.uploadedAt && <span className="doc-item-meta">{new Date(doc.uploadedAt).toLocaleDateString("uz-UZ")}</span>}
                        </div>
                        <a href={doc.url} download className="doc-download-btn" onClick={(e) => e.stopPropagation()} aria-label="Yuklab olish">
                          <Download size={14} />
                        </a>
                        {(isAdmin(currentUser) || isOwnEmployee) && (
                          <button type="button" className="doc-delete-btn" onClick={(e) => { e.stopPropagation(); deleteUploadedFile(doc.filename); }} aria-label="O'chirish">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {uploadedFiles.filter((f) => f.type === "image").length > 0 && (
          <button type="button" className="doc-combine-btn" onClick={downloadCombinedDocJpeg}>
            <Download size={15} /> Barcha rasmlarni bitta JPEG sifatida yuklab olish
          </button>
        )}
      </section>

      <EmployeeDocumentView employee={draft} mode={documentMode} />

      {isAdmin(currentUser) && (
        <section className="documents-summary">
          {employees.map((employee) => (
            <button className={`${String(employee.id) === String(draft.id) ? "active" : ""} department-${employee.department || "operator"}`} key={employee.id} type="button" onClick={() => setSelectedId(employee.id)}>
              <Avatar person={employee} />
              <div>
                <strong>{employee.name}</strong>
                <span>{departmentMeta(employee.department).label} • {(employee.portfolio || []).length} video</span>
              </div>
            </button>
          ))}
        </section>
      )}
      {previewFile && createPortal(
        <div className="doc-preview-backdrop" onClick={() => setPreviewFile(null)}>
          <div className="doc-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="doc-preview-header">
              <span className="doc-preview-title">{previewFile.catLabel || previewFile.filename}</span>
              <button type="button" className="doc-preview-close" onClick={() => setPreviewFile(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="doc-preview-body">
              {previewFile.type === "image" ? (
                <img src={previewFile.url} alt={previewFile.catLabel} className="doc-preview-img" />
              ) : (
                <div className="doc-preview-file-placeholder">
                  <FileText size={56} />
                  <p>{previewFile.filename}</p>
                  <a href={previewFile.url} target="_blank" rel="noreferrer" className="doc-preview-open-btn">Faylni ochish</a>
                </div>
              )}
            </div>
            <div className="doc-preview-footer">
              <a href={previewFile.url} download onClick={(e) => e.stopPropagation()} className="doc-preview-download-btn">
                <Download size={15} /> Yuklab olish
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
      {tgDocModal && createPortal(
        <TgDocSendModal
          modal={tgDocModal}
          draft={draft}
          uploadedFiles={uploadedFiles}
          onClose={() => setTgDocModal(null)}
          onNotify={onNotify}
        />,
        document.body
      )}
      {editOpen && editDraft && createPortal((
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Hujjatlarni tahrirlash" onClick={() => setEditOpen(false)}>
          <form ref={formRef} className="schedule-modal documents-modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Hujjatlarni tahrirlash</strong>
              <button type="button" onClick={() => setEditOpen(false)}>
                <LogOut size={15} />
                Chiqish
              </button>
            </div>
            <label>
              Ism familiya
              <input name="documents-name" value={editDraft.name || ""} onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })} placeholder="Abduqodirxo'jayev Izzat" />
            </label>
            <label>
              Lavozimi
              <input name="documents-role" value={editDraft.role || ""} onChange={(event) => setEditDraft({ ...editDraft, role: event.target.value })} placeholder="Tasvir yozish operatori" />
            </label>
            <label>
              Bo'lim
              <select value={editDraft.department || "operator"} onChange={(event) => setEditDraft({ ...editDraft, department: event.target.value })}>
                {DEPARTMENTS.map((department) => (
                  <option key={department.id} value={department.id}>{department.label}</option>
                ))}
              </select>
            </label>
            <div className="modal-grid two">
              <label>
                Telefon
                <input name="documents-phone" value={editDraft.phone || ""} onChange={(event) => setEditDraft({ ...editDraft, phone: event.target.value })} placeholder="+998 90 000 00 00" inputMode="tel" />
              </label>
              <label>
                Telegram
                <input name="documents-telegram" value={editDraft.telegram || ""} onChange={(event) => setEditDraft({ ...editDraft, telegram: event.target.value })} placeholder="@username" />
              </label>
            </div>
            <label>
              Manzil
              <input name="documents-address" value={editDraft.address || ""} onChange={(event) => setEditDraft({ ...editDraft, address: event.target.value })} placeholder="Yashash manzili" />
            </label>
            <div className="avatar-upload-field">
              <div className="avatar-upload-preview">
                {editDraft.photo3x4 ? <img src={editDraft.photo3x4} alt="3x4 rasm" /> : <User size={28} />}
              </div>
              <div>
                <strong>3x4 rasm</strong>
                <span>{editDraft.photo3x4 ? "Rasm yuklangan" : "Rasm yuklanmagan"}</span>
              </div>
              <label>
                <Upload size={15} />
                Yuklash
                <input type="file" accept="image/*" onChange={(event) => updateDocumentImage("photo3x4", event.target.files?.[0])} />
              </label>
            </div>
            <section className="portfolio-editor modal-portfolio passport-editor">
              <div className="section-head">
                <h2>Pasport ma'lumotlari</h2>
              </div>
              <div className="avatar-upload-field">
                <div className="avatar-upload-preview">
                  {editDraft.passportUz ? <img src={editDraft.passportUz} alt="Pasport nusxasi" /> : <FileText size={28} />}
                </div>
                <div>
                  <strong>Pasport nusxasi</strong>
                  <span>{editDraft.passportUz ? "Fayl yuklangan" : "Fayl yuklanmagan"}</span>
                </div>
                <label>
                  <Upload size={15} />
                  Yuklash
                  <input type="file" accept="image/*" onChange={(event) => updateDocumentImage("passportUz", event.target.files?.[0])} />
                </label>
              </div>
              <div className="modal-grid two">
                <label>
                  Seriya va raqam
                  <input name="documents-passport-series" value={editDraft.passportSeries || ""} onChange={(event) => setEditDraft({ ...editDraft, passportSeries: event.target.value })} placeholder="AD 1234567" />
                </label>
                <label>
                  JSHSHIR
                  <input name="documents-passport-pinfl" value={editDraft.passportPinfl || ""} onChange={(event) => setEditDraft({ ...editDraft, passportPinfl: event.target.value })} placeholder="12345678901234" inputMode="numeric" />
                </label>
              </div>
              <div className="modal-grid two">
                <label>
                  Tug'ilgan sana
                  <input type="date" value={editDraft.passportBirthDate || ""} onChange={(event) => setEditDraft({ ...editDraft, passportBirthDate: event.target.value })} />
                </label>
                <label>
                  Bergan organ
                  <input name="documents-passport-issuer" value={editDraft.passportIssuedBy || ""} onChange={(event) => setEditDraft({ ...editDraft, passportIssuedBy: event.target.value })} placeholder="IIB nomi" />
                </label>
              </div>
              <div className="modal-grid two">
                <label>
                  Berilgan sana
                  <input type="date" value={editDraft.passportIssuedDate || ""} onChange={(event) => setEditDraft({ ...editDraft, passportIssuedDate: event.target.value })} />
                </label>
                <label>
                  Amal qilish muddati
                  <input type="date" value={editDraft.passportExpiryDate || ""} onChange={(event) => setEditDraft({ ...editDraft, passportExpiryDate: event.target.value })} />
                </label>
              </div>
            </section>
            <section className="portfolio-editor modal-portfolio">
              <div className="section-head">
                <h2>Portfolio</h2>
                <button type="button" onClick={addPortfolioItem}>
                  <Plus size={15} />
                  Link
                </button>
              </div>
              {(editDraft.portfolio || []).map((item, index) => (
                <article className="portfolio-row" key={`${index}-${item.url}`}>
                  <input name={`portfolio-title-${index}`} value={item.title || ""} onChange={(event) => updatePortfolio(index, "title", event.target.value)} placeholder="Syomka nomi" />
                  <input name={`portfolio-url-${index}`} value={item.url || ""} onChange={(event) => updatePortfolio(index, "url", event.target.value)} placeholder="Video yoki efir linki" />
                  <input type="date" value={item.date || ""} onChange={(event) => updatePortfolio(index, "date", event.target.value)} />
                  <button type="button" aria-label="Portfolio linkni o'chirish" onClick={() => removePortfolioItem(index)}>
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
              {!(editDraft.portfolio || []).length && <p className="portfolio-empty">Efirga ketgan syomka linklarini shu yerda yig'ib borasiz.</p>}
            </section>
            <button type="submit" disabled={saving}>
              <Save size={17} />
              {saving ? "Saqlanmoqda..." : "Ma'lumotlarni saqlash"}
            </button>
          </form>
        </div>
      ), document.body)}

    </section>
  );
}

function TgDocSendModal({ modal, draft, uploadedFiles, onClose, onNotify }) {
  const { cat, empId } = modal;
  const catFiles = (uploadedFiles || []).filter((f) => f.category === cat.id || (!f.category && cat.id === "other"));
  const hasFile = catFiles.length > 0;
  const [chatId, setChatId] = useState("");
  const [sending, setSending] = useState(false);
  const [chatNotFound, setChatNotFound] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  async function send() {
    const tid = chatId.trim();
    if (!tid) { onNotify("Chat ID yoki @username kiritilmagan", "error"); return; }
    if (!hasFile) { onNotify("Avval faylni yuklang (Yuklash tugmasi)", "warning"); return; }
    setSending(true);
    setChatNotFound(false);
    try {
      const res = await apiFetch("/api/telegram/send-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId, category: cat.id, chatId: tid })
      });
      onNotify(res.message || "Telegram ga yuborildi ✓", "success");
      onClose();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("chat not found") || msg.includes("400")) {
        setChatNotFound(true);
      } else {
        onNotify(msg || "Yuborishda xato", "error");
      }
    } finally {
      setSending(false);
    }
  }

  function openManual() {
    if (hasFile) {
      const a = document.createElement("a");
      a.href = `${catFiles[0].url}?t=${Date.now()}`;
      a.download = catFiles[0].filename || "doc.jpg";
      a.click();
    }
    const username = chatId.trim().replace(/^@/, "");
    if (username) {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = `tg://resolve?domain=${username}`;
        a.click();
      }, 600);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="tg-doc-send-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tg-doc-send-head">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#2563eb"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
          <h3>Telegram ga yuborish</h3>
          <button type="button" className="tg-doc-send-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="tg-doc-send-info">
          <span className="tg-doc-send-emp">{draft?.name}</span>
          <span className="tg-doc-send-cat">{cat.emoji} {cat.label}</span>
          {!hasFile && <span className="tg-doc-send-warn">⚠️ Avval faylni yuklang — "Yuklash" tugmasidan foydalaning</span>}
        </div>
        {hasFile && catFiles[0].type === "image" && (
          <img src={catFiles[0].url} alt={cat.label} className="tg-doc-send-thumb" />
        )}

        {chatNotFound ? (
          <div className="tg-chat-not-found">
            <p className="tg-chat-not-found-title">⚠️ Chat topilmadi</p>
            <p className="tg-chat-not-found-desc">
              <strong>{chatId}</strong> — bu shaxsiy foydalanuvchi. Bot faqat avval "/start" yuborgan odamlarga yubora oladi.
            </p>
            <p className="tg-chat-not-found-desc">
              <strong>Yechim:</strong> Fayl qurilmangizga yuklanadi va Telegram da o'sha odam bilan chat ochiladi — siz faylni o'zingiz jo'natasiz.
            </p>
            <div className="tg-doc-send-actions" style={{ marginTop: "0.75rem" }}>
              <button type="button" className="btn-cancel" onClick={() => setChatNotFound(false)}>← Orqaga</button>
              <button type="button" className="btn-send-tg" onClick={openManual}>
                <Download size={15} /> Yuklab + Telegramda ochish
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="tg-doc-send-field">
              <label>Kimga yuborish?</label>
              <input
                ref={inputRef}
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="@guruh_nomi yoki -1001234567890"
                onKeyDown={(e) => e.key === "Enter" && !sending && send()}
                disabled={sending}
              />
              <p className="tg-doc-send-hint">
                <strong>Guruh/kanal</strong>: @username yoki raqamli chat ID (bot guruhda a'zo bo'lishi kerak).<br />
                <strong>Shaxsiy</strong>: odam avval botga /start yuborishi kerak.
              </p>
            </div>
            <div className="tg-doc-send-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Bekor qilish</button>
              <button type="button" className="btn-send-tg" onClick={send} disabled={sending || !chatId.trim()}>
                {sending ? "Yuborilmoqda..." : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg> Yuborish</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmployeeDocumentView({ assignments = [], employee, mode = "word" }) {
  const model = employeeDocumentModel(employee, assignments);
  const [jpegUrl, setJpegUrl] = useState("");

  useEffect(() => {
    if (mode !== "jpeg") return undefined;
    let cancelled = false;
    let objectUrl = "";
    setJpegUrl("");
    buildEmployeeJpegBlob(model).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setJpegUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, employee.id, employee.avatar, employee.address, JSON.stringify(employee.documents || {})]);

  if (mode === "jpeg") {
    return (
      <section className="employee-document jpeg-mode" aria-label={`${model.name} JPEG ko'rinishi`}>
        <header>
          <span>Avtomatik karta</span>
          <strong>JPEG xodim kartasi</strong>
          <p>{model.generatedAt} da shakllantirildi</p>
        </header>
        <div className="employee-jpeg-preview print-area">
          {jpegUrl ? <img src={jpegUrl} alt={`${model.name} kartasi`} /> : <p>Karta tayyorlanmoqda...</p>}
        </div>
        <button type="button" className="jpeg-print-btn" onClick={() => window.print()} disabled={!jpegUrl}>
          <Printer size={16} />
          Chop etish
        </button>
      </section>
    );
  }

  if (mode === "excel") {
    return (
      <section className="employee-document excel-mode" aria-label={`${model.name} Excel ko'rinishi`}>
        <div className="excel-document-head">
          <FileSpreadsheet size={18} />
          <strong>{model.name}</strong>
          <span>{model.generatedAt}</span>
        </div>
        <div className="employee-excel-table">
          {model.summary.map(([label, value]) => (
            <React.Fragment key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </React.Fragment>
          ))}
        </div>
        <div className="employee-excel-table assignments">
          <span>Smena</span>
          <span>Bo'lim</span>
          <span>Vaqt</span>
          <span>Status</span>
          {model.assignments.length ? model.assignments.map((assignment) => (
            <React.Fragment key={`${assignment.groupTitle}-${assignment.groupMeta}-${assignment.statusType}`}>
              <strong>{assignment.groupTitle || assignment.day}</strong>
              <strong>{assignment.groupMeta}</strong>
              <strong>{assignment.time}</strong>
              <strong>{STATUS_META[assignment.statusType]?.label || assignment.status}</strong>
            </React.Fragment>
          )) : (
            <>
              <strong>Haftalik smena topilmadi</strong>
              <strong>-</strong>
              <strong>-</strong>
              <strong>-</strong>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="employee-document word-mode" aria-label={`${model.name} Word ko'rinishi`}>
      <header>
        <span>Rasmiy ma'lumotnoma</span>
        <strong>Xodim shaxsiy ma'lumotnomasi</strong>
        <p>{model.generatedAt} da avtomatik shakllantirildi</p>
      </header>
      <div className="word-document-profile">
        <Avatar person={employee} />
        <div>
          <strong>{model.name}</strong>
          <span>{model.role} • {model.department}</span>
        </div>
        <em>{model.status}</em>
      </div>
      <dl className="word-document-grid">
        {model.summary.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <section className="word-document-section">
        <strong>Haftalik smena ma'lumotlari</strong>
        {model.assignments.length ? model.assignments.slice(0, 8).map((assignment) => (
          <article key={`${assignment.groupTitle}-${assignment.groupMeta}-${assignment.statusType}`}>
            <span>{assignment.groupTitle || assignment.day}</span>
            <p>{assignment.groupMeta} • {assignment.time}</p>
            <em>{STATUS_META[assignment.statusType]?.label || assignment.status}</em>
          </article>
        )) : <p>Haftalik smena topilmadi.</p>}
      </section>
    </section>
  );
}

function ContactActions({ phone, telegram }) {
  return (
    <div className="contact-actions">
      {phone && (
        <a href={`tel:${phone}`} aria-label="Telefon qilish">
          <Phone size={15} />
        </a>
      )}
      {telegram && (
        <a href={telegram} target="_blank" rel="noreferrer" aria-label="Telegramda yozish">
          <Send size={15} />
        </a>
      )}
    </div>
  );
}

function CompactStaffCard({ person }) {
  const department = departmentMeta(person.department);
  const phone = cleanPhone(person.phone);
  const telegram = telegramHref(person.telegram);
  const portfolioUrl = person.portfolio?.find((item) => item.url)?.url;

  return (
    <article className={`compact-staff department-${department.id}`}>
      <Avatar person={person} />
      <div>
        <strong>{person.name}</strong>
        <span>{department.label} • {person.phone}</span>
      </div>
      <ContactActions phone={phone} telegram={telegram} />
      {portfolioUrl && (
        <a className="portfolio-action" href={portfolioUrl} target="_blank" rel="noreferrer" aria-label="Portfolio linkini ochish">
          <PlayCircle size={16} />
        </a>
      )}
      <em className={person.statusType}>{person.status}</em>
    </article>
  );
}

function WeeklyOverview({ rows, days }) {
  return (
    <section className="overview-card">
      <div className="overview-grid header">
        <span />
        {days.map((day) => (
          <span key={day.label}>{day.label}<br />{day.date}</span>
        ))}
      </div>
      {rows.map((row) => (
        <div className="overview-grid" key={row.name}>
          <strong>{row.name}</strong>
          {row.days.map((value, index) => (
            <span className={`cell ${value}`} key={`${row.name}-${index}`}>
              {value === "work" ? <Check size={16} /> : value === "rest" ? "x" : null}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}

function ReportsPage({ dashboard, departments = [] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const reportItems = dashboard.reports || [];
  const max = Math.max(...reportItems.map((item) => item.value), 1);
  const allPeople = dashboard.groups.flatMap((group) => group.people.map((person) => ({
    ...person,
    groupTitle: group.title,
    groupMeta: group.meta,
    day: group.day
  })));
  const filteredPeople = allPeople.filter((person) => {
    const searchText = [person.name, person.role, person.groupTitle, person.groupMeta, STATUS_META[person.statusType]?.label]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query.trim() || searchText.includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || person.statusType === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const deptList = departments.length > 0
    ? departments.map((d) => ({ id: d.id || d.name, label: d.label, shortLabel: d.label.split(" ")[0] }))
    : DEPARTMENTS;
  const departmentCounts = deptList.map((department) => ({
    ...department,
    value: dashboard.employees.filter((employee) => employee.department === department.id).length
  }));
  const coverage = Math.round((dashboard.metrics.working / Math.max(dashboard.metrics.total, 1)) * 100);
  const statusSummary = [
    { label: "Ishda", value: dashboard.metrics.working, tone: "success" },
    { label: "Dam/ta'til", value: dashboard.metrics.rest, tone: "danger" },
    { label: "Safarda", value: dashboard.metrics.trip, tone: "warning" },
    { label: "TJK", value: dashboard.metrics.tjk, tone: "info" }
  ];

  return (
    <section className="reports-page">
      <section className="reports-dashboard-hero">
        <div>
          <span>Haftalik hisobot</span>
          <strong>{dashboard.week.range}</strong>
          <p>{dashboard.metrics.total} xodim, {dashboard.groups.length} smena guruhi va real vaqt statuslari.</p>
        </div>
        <div className="reports-coverage" style={{ background: `conic-gradient(var(--success) ${coverage}%, color-mix(in srgb, var(--border) 70%, transparent) 0)` }}>
          <b>{coverage}%</b>
          <span>qamrov</span>
        </div>
      </section>

      <section className="reports-kpi-row">
        {statusSummary.map((item) => (
          <article className={`reports-kpi-card ${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <i><b style={{ width: `${(item.value / Math.max(dashboard.metrics.total, 1)) * 100}%` }} /></i>
          </article>
        ))}
      </section>

      <section className="reports-toolbar">
        <label>
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Xodim, smena yoki bo'lim bo'yicha qidirish" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Status bo'yicha filter">
          <option value="all">Barcha statuslar</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.id} value={status.id}>{status.label}</option>
          ))}
        </select>
      </section>

      <section className="reports-grid">
        <article className="reports-panel">
          <div className="reports-panel-head">
            <strong>Statuslar taqsimoti</strong>
            <span>{reportItems.length} ko'rsatkich</span>
          </div>
          <div className="report-chart-list">
            {reportItems.map((item) => (
              <div className="report-chart-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <i><b style={{ width: `${(item.value / max) * 100}%` }} /></i>
              </div>
            ))}
          </div>
        </article>

        <article className="reports-panel">
          <div className="reports-panel-head">
            <strong>Bo'limlar kesimi</strong>
            <span>{dashboard.employees.length} xodim</span>
          </div>
          <div className="department-chart">
            {departmentCounts.map((department) => (
              <div key={department.id}>
                <span>{department.shortLabel}</span>
                <i><b style={{ height: `${Math.max(12, (department.value / Math.max(dashboard.employees.length, 1)) * 100)}%` }} /></i>
                <strong>{department.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="reports-panel reports-table-panel">
        <div className="reports-panel-head">
          <strong>Tezkor status ro'yxati</strong>
          <span>{filteredPeople.length} natija</span>
        </div>
        <div className="reports-table">
          {filteredPeople.slice(0, 18).map((person) => {
            const status = STATUS_META[person.statusType] || STATUS_META.working;
            return (
              <article key={`${person.groupTitle}-${person.id}-${person.statusType}`}>
                <Avatar person={person} />
                <div>
                  <strong>{person.name}</strong>
                  <span>{person.groupTitle} • {person.groupMeta}</span>
                </div>
                <em className={person.statusType}>{status.code} - {status.label}</em>
              </article>
            );
          })}
          {!filteredPeople.length && <EmptyCard text="Filter bo'yicha natija topilmadi" />}
        </div>
      </section>
    </section>
  );
}

function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api("/api/audit-logs")
      .then((data) => setLogs(data.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const matchSearch =
      !search.trim() ||
      [log.action, log.entity, log.entityId, log.details]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    const matchFilter = filter === "all" || log.action === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <SkeletonPage />;

  return (
    <section className="audit-page">
      <div className="audit-head">
        <div>
          <h2>Audit Jurnal</h2>
          <p>Tizimda barcha o'zgarishlar tarixi · Jami {logs.length} ta</p>
        </div>
      </div>
      <div className="reports-toolbar">
        <label>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Amal, xodim yoki tafsilot bo'yicha qidirish"
          />
        </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Barcha amallar</option>
          <option value="login">Kirish</option>
          <option value="create">Yaratish</option>
          <option value="update">O'zgartirish</option>
          <option value="delete">O'chirish</option>
          <option value="generate">Yaratish (jadval)</option>
          <option value="checkin">Kirish (Face ID)</option>
          <option value="checkout">Chiqish (Face ID)</option>
          <option value="add_group">Guruh qo'shish</option>
          <option value="status_update">Status</option>
        </select>
      </div>
      <div className="audit-list">
        {filtered.map((log) => (
          <article key={log.id} className="audit-row">
            <span className={`audit-badge ${String(log.action).toLowerCase().replace(/_/g, "-")}`}>
              {log.action}
            </span>
            <div className="audit-main">
              <strong>
                {log.entityId || log.entity}
                <em className="audit-entity"> · {log.entity}</em>
              </strong>
              {log.details && <p>{log.details}</p>}
            </div>
            <time className="audit-time">
              {new Date(log.createdAt).toLocaleString("uz-UZ", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </time>
          </article>
        ))}
        {!filtered.length && <EmptyCard text="Hozircha audit yozuvlari yo'q" />}
      </div>
    </section>
  );
}

function ProfilePage({ currentUser, dashboard, theme, onLogout, onRefresh, onThemeChange, onSaveContact, onDeleteContact, onUpdateUser, onSaveEmployee, onNotify }) {
  const [notify, setNotify] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(currentUser);
  const [contactDraft, setContactDraft] = useState({ type: "Muxbir", name: "", vehicle: "", phone: "" });
  const [contactSearch, setContactSearch] = useState("");
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [todaySlide, setTodaySlide] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date()));
  const [profileStatuses, setProfileStatuses] = useState({});
  const [profileCalYear, setProfileCalYear] = useState(() => new Date().getFullYear());
  const [profileCalMonth, setProfileCalMonth] = useState(() => new Date().getMonth() + 1);
  const [statsLoading, setStatsLoading] = useState(false);
  const formRef = useRef(null);
  const operators = dashboard.employees.filter((employee) => employee.role.includes("Operator")).length;
  const reporters = dashboard.employees.filter((employee) => employee.role.includes("Muxbir")).length;
  const contacts = dashboard.contacts || [];
  const drivers = contacts.filter((contact) => contact.type === "Haydovchi").length;
  const profileEmployee = useMemo(() => {
    if (currentUser?.employeeId != null) {
      const found = dashboard.employees.find(
        (e) => String(e.id) === String(currentUser.employeeId)
      );
      if (found) return found;
    }
    const userName = normalizeLookupName(currentUser.name);
    return dashboard.employees.find((employee) => {
      const employeeName = normalizeLookupName(employee.name);
      return employeeName === userName ||
        employeeName.includes(userName) ||
        userName.includes(employeeName);
    }) || null;
  }, [currentUser.employeeId, currentUser.name, dashboard.employees]);
  const shootingAssignment = useMemo(() => findShootingAssignmentForEmployee(profileEmployee), [profileEmployee]);
  const driverContact = useMemo(() => contacts.find((contact) => contact.type === "Haydovchi"), [contacts]);
  const todayAssignments = useMemo(() => {
    if (!profileEmployee) return [];
    return dashboard.groups
      .filter((group) => group.day === todayDayName())
      .flatMap((group) => group.people
        .filter((person) => String(person.id) === String(profileEmployee.id))
        .map((person) => ({ ...person, groupTitle: group.title, groupMeta: group.meta })));
  }, [dashboard.groups, profileEmployee]);
  const activeAssignment = todayAssignments[todaySlide % Math.max(todayAssignments.length, 1)];
  const todayPlan = activeAssignment || shootingAssignment;

  const calendarInfo = useMemo(() => {
    const year = profileCalYear;
    const month0 = profileCalMonth - 1;
    const firstDay = new Date(year, month0, 1);
    const totalDays = new Date(year, month0 + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;
    const blanks = Array.from({ length: offset }, () => null);
    const empStatuses = profileEmployee ? (profileStatuses[profileEmployee.id] || {}) : {};
    const days = Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(year, month0, index + 1);
      const dateText = toInputDate(date);
      const dow = date.getDay(); // 0=Yak, 1=Du, 2=Se, 3=Cho, 4=Pay, 5=Jum, 6=Sha
      const explicitCode = empStatuses[dateText];
      const code = explicitCode || "empty";
      const status = codeToMonthlyStatus(code);
      return { date, dateText, day: index + 1, status, code, isToday: dateText === toInputDate(new Date()) };
    });
    return { title: `${MONTH_NAMES[month0]} ${year}`, days: [...blanks, ...days] };
  }, [profileEmployee, profileStatuses, profileCalYear, profileCalMonth]);

  const monthlyStats = useMemo(() => {
    const empStatuses = profileEmployee ? (profileStatuses[profileEmployee.id] || {}) : {};
    const daysInMonth = new Date(profileCalYear, profileCalMonth, 0).getDate();
    const prefix = `${profileCalYear}-${String(profileCalMonth).padStart(2, "0")}`;
    let working = 0, rest = 0, trip = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const code = empStatuses[`${prefix}-${String(d).padStart(2, "0")}`] || "";
      if (["I", "S", "T", "A", "P"].includes(code)) working++;
      else if (code === "K") trip++;
      else if (["D", "M", "O", "B", "U"].includes(code)) rest++;
    }
    return { working, rest, hours: working * 8, trip };
  }, [profileEmployee, profileStatuses, profileCalYear, profileCalMonth]);

  const selectedDay = calendarInfo.days.find((day) => day?.dateText === selectedDate) || calendarInfo.days.find((day) => day?.isToday) || calendarInfo.days.find(Boolean);
  const selectedStatusMeta = selectedDay ? (MONTHLY_STATUS_OPTIONS[selectedDay.status] || STATUS_META[selectedDay.status]) : null;
  const bannerStatusMeta = activeAssignment ? STATUS_META[activeAssignment.statusType] : selectedStatusMeta;
  const showAssignmentDetail = selectedDay && !["rest", "vacation", "otpiska", "empty"].includes(selectedDay.status);

  useEffect(() => {
    setDraft({
      ...currentUser,
      name: profileEmployee?.name || currentUser.name,
      phone: profileEmployee?.phone || currentUser.phone || "",
      telegram: profileEmployee?.telegram || currentUser.telegram || "",
      avatar: profileEmployee?.avatar || currentUser.avatar || "",
    });
  }, [currentUser, profileEmployee]);

  useEffect(() => {
    setStatsLoading(true);
    api(`/api/daily-status?year=${profileCalYear}&month=${profileCalMonth}`)
      .then((data) => setProfileStatuses(data.statuses || {}))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [profileCalYear, profileCalMonth]);

  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split("-").map(Number);
      if (y !== profileCalYear || m !== profileCalMonth) {
        setSelectedDate(toInputDate(new Date(profileCalYear, profileCalMonth - 1, 1)));
      }
    }
  }, [profileCalYear, profileCalMonth]);

  useEffect(() => {
    setTodaySlide(0);
  }, [profileEmployee?.id, dashboard.week.start]);

  useEffect(() => {
    if (todayAssignments.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setTodaySlide((value) => (value + 1) % todayAssignments.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [todayAssignments.length]);

  function prevProfileMonth() {
    if (profileCalMonth === 1) { setProfileCalMonth(12); setProfileCalYear((y) => y - 1); }
    else setProfileCalMonth((m) => m - 1);
  }
  function nextProfileMonth() {
    if (profileCalMonth === 12) { setProfileCalMonth(1); setProfileCalYear((y) => y + 1); }
    else setProfileCalMonth((m) => m + 1);
  }

  async function submitProfile(event) {
    event.preventDefault();
    if (!String(draft.name || "").trim()) {
      onNotify("Ism familiyani kiriting.", "error");
      formRef.current?.querySelector("[name='profile-name']")?.focus();
      return;
    }
    onUpdateUser({ name: draft.name, phone: draft.phone, telegram: draft.telegram, avatar: draft.avatar });
    if (profileEmployee && onSaveEmployee) {
      await onSaveEmployee({
        id: profileEmployee.id,
        name: draft.name || profileEmployee.name,
        role: profileEmployee.role,
        phone: draft.phone || profileEmployee.phone,
        telegram: draft.telegram || profileEmployee.telegram || "",
        department: profileEmployee.department || "operator",
        address: profileEmployee.address || "",
        portfolio: profileEmployee.portfolio || [],
        avatar: draft.avatar || profileEmployee.avatar || "",
      });
    }
    setEditOpen(false);
  }

  async function updateAvatar(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setDraft({ ...draft, avatar: await readImageFile(file) });
  }

  async function submitContact(event) {
    event.preventDefault();
    const normalizedContact = {
      ...contactDraft,
      vehicle: contactDraft.type === "Haydovchi" ? contactDraft.vehicle : ""
    };
    const saved = await onSaveContact(normalizedContact);
    if (saved) {
      setContactDraft({ type: "Muxbir", name: "", vehicle: "", phone: "" });
      setContactFormOpen(false);
    }
  }

  const filteredContacts = (dashboard.contacts || []).filter((c) => {
    const q = contactSearch.toLowerCase().trim();
    return !q || [c.name, c.phone, c.vehicle, c.type].join(" ").toLowerCase().includes(q);
  });

  return (
    <section className="profile-page">
      <div className="profile-topbar">
        <h2>Profil</h2>
        <button type="button" className="logout-top-btn" onClick={onLogout}>
          <LogOut size={16} />
          Chiqish
        </button>
      </div>

      <div className="profile-hero">
        <span className="profile-avatar large">
          {(profileEmployee?.avatar || currentUser.avatar)
            ? <img src={profileEmployee?.avatar || currentUser.avatar} alt={profileEmployee?.name || currentUser.name} />
            : <User size={38} />}
        </span>
        <div>
          <strong>{profileEmployee?.name || currentUser.name}</strong>
          <p>{profileEmployee?.role || currentUser.role}</p>
        </div>
        <button type="button" aria-label="Profilni tahrirlash" onClick={() => setEditOpen((value) => !value)}>
          <Edit3 size={17} />
        </button>
      </div>

      {editOpen && (
        <section className="profile-edit-card">
          <div className="section-head">
            <h2>Profilni tahrirlash</h2>
            <button type="button" onClick={() => setEditOpen(false)}>Yopish</button>
          </div>
          <form ref={formRef} className="profile-edit-form" onSubmit={submitProfile}>
            <div className="avatar-upload-field profile-avatar-upload">
              <div className="avatar-upload-preview">
                {draft.avatar ? <img src={draft.avatar} alt="Profil rasmi" /> : <User size={28} />}
              </div>
              <div>
                <strong>Profil rasmi</strong>
                <span>{draft.avatar ? "Rasm tanlangan" : "Rasm yuklanmagan"}</span>
              </div>
              <label>
                <Upload size={15} />
                Yuklash
                <input type="file" accept="image/*" onChange={(event) => updateAvatar(event.target.files?.[0])} />
              </label>
            </div>
            <label>
              Ism familiya
              <input name="profile-name" value={draft.name || ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Administrator" />
            </label>
            <label>
              Telefon
              <input name="profile-phone" value={draft.phone || ""} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+998 90 000 00 00" inputMode="tel" />
            </label>
            <label>
              Telegram
              <input name="profile-telegram" value={draft.telegram || ""} onChange={(event) => setDraft({ ...draft, telegram: event.target.value })} placeholder="@username" />
            </label>
            <button type="submit">
              <Save size={17} />
              Saqlash
            </button>
          </form>
        </section>
      )}

      <section className={`profile-today-banner ${activeAssignment?.statusType || "empty"}`}>
        <div>
          <span>Bugungi ish</span>
          <strong>{todayPlan ? (activeAssignment ? activeAssignment.groupMeta : shootingAssignment?.topic || "Bugungi reja") : "Bugungi ish topilmadi"}</strong>
          <p>
            {activeAssignment
              ? `${activeAssignment.groupTitle} • ${activeAssignment.time}`
              : todayPlan
                ? `Kamera ${extractCameraNumber(shootingAssignment?.camera) || "—"} • ${shootingAssignment?.time || "—"}`
                : "Profil nomi xodimlar ro'yxatidagi F.I.Sh bilan mos bo'lsa, bugungi smena shu yerda chiqadi."}
          </p>
        </div>
        <em>
          {todayPlan
            ? (activeAssignment
              ? `${bannerStatusMeta?.code || "S"} - ${bannerStatusMeta?.label || activeAssignment.status}`
              : `${bannerStatusMeta?.label || "K"} - ${bannerStatusMeta?.shift || "Reja"}`)
            : "Bo'sh"}
        </em>
      </section>

      <section className="profile-calendar-card">
        <div className="section-head profile-cal-head">
          <button type="button" className="cal-nav-btn" onClick={prevProfileMonth} aria-label="Oldingi oy">
            <ChevronLeft size={18} />
          </button>
          <h2>{calendarInfo.title}</h2>
          <button type="button" className="cal-nav-btn" onClick={nextProfileMonth} aria-label="Keyingi oy">
            <ChevronRight size={18} />
          </button>
        </div>

        {profileEmployee ? (
          <div className="profile-monthly-stats-row">
            <span className="pms-chip pms-work" title="Ish kunlari">
              <strong>{statsLoading ? "—" : monthlyStats.working}</strong>
              <em>Ish</em>
            </span>
            <span className="pms-chip pms-rest" title="Dam olish">
              <strong>{statsLoading ? "—" : monthlyStats.rest}</strong>
              <em>Dam</em>
            </span>
            <span className="pms-chip pms-trip" title="Komandirovka">
              <strong>{statsLoading ? "—" : monthlyStats.trip}</strong>
              <em>Safar</em>
            </span>
            <span className="pms-chip pms-hours" title="Jami soat">
              <strong>{statsLoading ? "—" : monthlyStats.hours}</strong>
              <em>Soat</em>
            </span>
          </div>
        ) : (
          <div className="profile-no-emp-banner">
            <span>Profil xodim ro'yxatiga ulanmagan</span>
            <p>Admin panel → Foydalanuvchilar → <strong>employeeId</strong> bilan bog'lash kerak</p>
          </div>
        )}

        <div className="profile-calendar-weekdays">
          {["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"].map((day) => <span key={day}>{day}</span>)}
        </div>

        <div className={`profile-calendar-grid${statsLoading ? " loading-dim" : ""}`}>
          {calendarInfo.days.map((day, index) => {
            if (!day) return <i key={`blank-${index}`} />;
            const info = DAILY_STATUSES[day.code] || null;
            const isEmpty = day.code === "empty" || !info;
            return (
              <button
                key={day.dateText}
                type="button"
                className={`pcal-day${isEmpty ? " pcal-empty" : ""} ${day.isToday ? "today" : ""} ${selectedDate === day.dateText ? "selected" : ""}`}
                style={!isEmpty ? { background: info.bg, color: info.fg } : undefined}
                onClick={() => setSelectedDate(day.dateText)}
                title={info?.name || "Belgilanmagan"}
              >
                <strong>{day.day}</strong>
                <span>{!isEmpty ? day.code : ""}</span>
              </button>
            );
          })}
        </div>

        <div className="pcal-legend">
          {Object.entries(DAILY_STATUSES).filter(([k]) => k !== "empty").map(([code, info]) => (
            <span key={code} style={{ background: info.bg, color: info.fg }} title={info.name}>
              <strong>{code}</strong> — {info.name}
            </span>
          ))}
        </div>

        {selectedDay && (() => {
          const selInfo = DAILY_STATUSES[selectedDay.code];
          const isEmpty = selectedDay.code === "empty" || !selInfo;
          const workCodes = ["I", "S", "T", "K", "A", "P"];
          const hours = isEmpty ? 0 : workCodes.includes(selectedDay.code) ? 9 : 0;
          return (
            <article
              className="profile-day-detail-v2"
              style={selInfo ? { borderColor: selInfo.bg + "55", background: selInfo.bg + "18" } : undefined}
            >
              <div className="pdv2-left">
                <div
                  className="pdv2-badge"
                  style={selInfo ? { background: selInfo.bg, color: selInfo.fg } : undefined}
                >
                  {isEmpty ? "—" : selectedDay.code}
                </div>
                <div>
                  <strong>{isEmpty ? "Belgilanmagan" : selInfo.name}</strong>
                  <span>{selectedDay.dateText}</span>
                </div>
              </div>
              <dl className="pdv2-meta">
                <div><dt>Xodim</dt><dd>{profileEmployee ? profileEmployee.name : "Ulanmagan"}</dd></div>
                <div><dt>Soat</dt><dd>{hours ? `${hours}:00` : "—"}</dd></div>
                {!isEmpty && workCodes.includes(selectedDay.code) && shootingAssignment && (
                  <div><dt>Kamera</dt><dd>{extractCameraNumber(shootingAssignment.camera) || "—"}</dd></div>
                )}
              </dl>
            </article>
          );
        })()}
      </section>

      <section className="profile-stats">
        <article>
          <strong>{dashboard.employees.length}</strong>
          <span>Xodim</span>
        </article>
        <article>
          <strong>{operators}</strong>
          <span>Operator</span>
        </article>
        <article>
          <strong>{reporters}</strong>
          <span>Muxbir</span>
        </article>
        <article>
          <strong>{drivers}</strong>
          <span>Haydovchi</span>
        </article>
      </section>

      <section className="contacts-card">
        <div className="contacts-head">
          <div>
            <Phone size={18} />
            <strong>Haydovchilar va muxbirlar</strong>
          </div>
          {isAdmin(currentUser) && (
            <button type="button" onClick={() => setContactFormOpen(true)}>
              <Plus size={16} />
              Qo'shish
            </button>
          )}
        </div>

        <label className="contact-search">
          <Search size={14} />
          <input
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            placeholder="Ism yoki telefon..."
          />
          {contactSearch && <button type="button" onClick={() => setContactSearch("")}>✕</button>}
        </label>

        <div className="contact-list">
          {filteredContacts.length ? filteredContacts.map((contact) => (
            <article key={contact.id} className="contact-row">
              <span className={contact.type === "Haydovchi" ? "driver" : ""}>
                {contact.type === "Haydovchi" ? <Car size={16} /> : <User size={16} />}
              </span>
              <div>
                <strong>{contact.type} {contact.name || contact.vehicle}</strong>
                {contact.vehicle && contact.vehicle !== contact.name && <em>{contact.vehicle}</em>}
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                  <Phone size={14} />
                  {contact.phone}
                </a>
              </div>
              {isAdmin(currentUser) && (
                <button type="button" aria-label="Kontaktni o'chirish" onClick={() => onDeleteContact(contact.id)}>
                  <Trash2 size={16} />
                </button>
              )}
            </article>
          )) : <EmptyCard text={contactSearch ? "Qidiruv natijalari yo'q" : "Kontaktlar hali kiritilmagan"} />}
        </div>
      </section>

      {contactFormOpen && createPortal((
        <div className="modal-backdrop contact-modal-backdrop" role="dialog" aria-modal="true" aria-label="Kontakt qo'shish" onClick={() => setContactFormOpen(false)}>
          <form className="schedule-modal contact-modal" onSubmit={submitContact} onClick={(event) => event.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Kontakt qo'shish</strong>
              <button type="button" onClick={() => setContactFormOpen(false)}>
                <LogOut size={15} />
                Chiqish
              </button>
            </div>
            <label>
              Kontakt turi
              <select
                value={contactDraft.type}
                onChange={(event) => setContactDraft({
                  ...contactDraft,
                  type: event.target.value,
                  vehicle: event.target.value === "Haydovchi" ? contactDraft.vehicle : ""
                })}
                aria-label="Kontakt turi"
              >
                <option>Muxbir</option>
                <option value="Haydovchi">Mashina</option>
              </select>
            </label>
            <label>
              {contactDraft.type === "Haydovchi" ? "Shofyor F.I.Sh" : "Muxbir F.I.Sh"}
              <input
                value={contactDraft.name}
                onChange={(event) => setContactDraft({ ...contactDraft, name: event.target.value })}
                placeholder={contactDraft.type === "Haydovchi" ? "Shofyor F.I.Sh" : "Muxbir F.I.Sh"}
              />
            </label>
            {contactDraft.type === "Haydovchi" && (
              <label>
                Mashina nomeri
                <input
                  value={contactDraft.vehicle}
                  onChange={(event) => setContactDraft({ ...contactDraft, vehicle: event.target.value })}
                  placeholder="Mashina nomeri, masalan 142 Caddy"
                />
              </label>
            )}
            <label>
              Telefon
              <input
                value={contactDraft.phone}
                onChange={(event) => setContactDraft({ ...contactDraft, phone: event.target.value })}
                placeholder="+998 90 302 55 92"
                inputMode="tel"
              />
            </label>
            <button type="submit">
              <Plus size={17} />
              Qo'shish
            </button>
          </form>
        </div>
      ), document.body)}

      <section className="settings-card">
        <div className="settings-head">
          <Settings size={18} />
          <strong>Sozlamalar</strong>
        </div>
        <ToggleRow label="Bildirishnomalar" active={notify} onClick={() => setNotify((value) => !value)} />
        <ToggleRow label="Dark mode" active={theme === "dark"} onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")} />
      </section>
    </section>
  );
}

function ToggleRow({ label, active, onClick }) {
  return (
    <button className="toggle-row" type="button" onClick={onClick}>
      <span>{label}</span>
      <i className={active ? "active" : ""}><b /></i>
    </button>
  );
}

function LegendItem({ tone, label }) {
  return (
    <div className="legend-item">
      <span className={`legend-mark ${tone}`}>
        {tone === "work" ? <Check size={15} /> : tone === "rest" ? "x" : tone === "tjk" ? "T" : tone === "studio" ? "S" : tone === "administration" ? "A" : tone === "presidential" ? "P" : null}
      </span>
      <p>{label}</p>
    </div>
  );
}

function MetricCard({ icon, value, label, tone, active = false, onClick }) {
  const Component = onClick ? "button" : "article";
  return (
    <Component className={`metric-card ${active ? "active" : ""}`} type={onClick ? "button" : undefined} onClick={onClick} aria-pressed={onClick ? active : undefined}>
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </Component>
  );
}

function Avatar({ person, size = "md" }) {
  const hasRealAvatar = person?.avatar && person.avatar.startsWith("data:image");
  const initials = String(person?.name || "?").trim().charAt(0).toUpperCase();
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#06b6d4", "#84cc16", "#a855f7"
  ];
  const colorIndex =
    (person?.name || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    colors.length;
  const bgColor = colors[colorIndex];

  if (hasRealAvatar) {
    return (
      <span className={`avatar avatar-${size}`}>
        <img src={person.avatar} alt={person.name} />
      </span>
    );
  }
  return (
    <span
      className={`avatar avatar-initials avatar-${size}`}
      style={{ backgroundColor: bgColor }}
      aria-label={person?.name}
    >
      {initials}
    </span>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="empty-card">
      <span className="empty-icon">📭</span>
      <p>{text}</p>
    </div>
  );
}

function UsersPage({ currentUser, employees = [], onNotify }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ employeeId: "", pin: "", role: "xodim" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [pinReveal, setPinReveal] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);

  const ROLES = [
    { id: "superadmin", label: "Super admin" },
    { id: "admin", label: "Administrator" },
    { id: "xodim", label: "Xodim" }
  ];

  const ROLE_COLORS = {
    superadmin: "#6366f1",
    admin: "#0ea5e9",
    xodim: "#6b7280"
  };

  useEffect(() => {
    api("/api/users").then((data) => {
      setUsers(data.users || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditUser(null);
    setForm({ employeeId: "", pin: "", role: "xodim" });
    setShowForm(true);
  }

  function openEdit(user) {
    setEditUser(user);
    setForm({ employeeId: user.employeeId ? String(user.employeeId) : "", pin: "", role: user.role });
    setShowForm(true);
  }

  async function saveUser(event) {
    event.preventDefault();
    if (!editUser && !form.employeeId) { onNotify("Xodimni tanlang", "error"); return; }
    if (!editUser && !form.pin.trim()) { onNotify("PIN kodni kiriting", "error"); return; }
    if (form.pin && !/^\d{8}$/.test(form.pin)) { onNotify("PIN kod 8 ta raqamdan iborat bo'lishi kerak", "error"); return; }
    setSaving(true);
    try {
      if (editUser) {
        const body = { role: form.role };
        if (form.pin) body.pin = form.pin;
        if (form.employeeId) body.employeeId = Number(form.employeeId);
        const updated = await api(`/api/users/${editUser.id}`, { method: "PUT", body: JSON.stringify(body) });
        setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
        onNotify(form.pin ? "Foydalanuvchi va PIN kod yangilandi" : "Foydalanuvchi yangilandi");
      } else {
        const body = { employeeId: Number(form.employeeId), pin: form.pin, role: form.role };
        const created = await api("/api/users", { method: "POST", body: JSON.stringify(body) });
        const { generatedPin, ...safeUser } = created;
        setUsers((prev) => [...prev, safeUser]);
        onNotify("Foydalanuvchi qo'shildi ✓");
        setPinReveal({ fullName: safeUser.fullName, username: safeUser.username, pin: form.pin || generatedPin });
      }
      setShowForm(false);
    } catch (err) {
      onNotify(err.message || "Xatolik", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user) {
    try {
      const updated = await api(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify({ isActive: !user.isActive }) });
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      onNotify(updated.isActive ? "Foydalanuvchi faollashtirildi" : "Foydalanuvchi nofaol qilindi", updated.isActive ? "success" : "warning");
    } catch (err) {
      onNotify(err.message || "Xatolik", "error");
    }
  }

  async function regeneratePin(user) {
    if (!await showConfirm(`${user.fullName} uchun yangi PIN kod yaratilsinmi? Eski PIN ishlamay qoladi.`)) return;
    setRegeneratingId(user.id);
    try {
      const updated = await api(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify({ regeneratePin: true }) });
      const { generatedPin, ...safeUser } = updated;
      setUsers((prev) => prev.map((u) => u.id === safeUser.id ? safeUser : u));
      if (generatedPin) setPinReveal({ fullName: safeUser.fullName, username: safeUser.username, pin: generatedPin });
    } catch (err) {
      onNotify(err.message || "Xatolik", "error");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function deleteUser(user) {
    if (!await showConfirm(`${user.fullName} ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api(`/api/users/${user.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      onNotify("Foydalanuvchi o'chirildi", "warning");
    } catch (err) {
      onNotify(err.message || "Xatolik", "error");
    }
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    superadmins: users.filter((u) => u.role === "superadmin").length,
    admins: users.filter((u) => u.role === "admin").length
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.fullName?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  return (
    <section className="users-page">
      <div className="users-header">
        <div className="users-title">
          <h2>Foydalanuvchilar</h2>
          <p>{stats.active} faol · {stats.total} jami</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      <div className="users-stats-grid">
        <div className="users-stat-card" style={{ borderColor: "#6366f1", color: "#6366f1" }}>
          <strong>{stats.total}</strong>
          <span>Jami</span>
        </div>
        <div className="users-stat-card" style={{ borderColor: "#22c55e", color: "#22c55e" }}>
          <strong>{stats.active}</strong>
          <span>Faol</span>
        </div>
        <div className="users-stat-card" style={{ borderColor: "#a855f7", color: "#a855f7" }}>
          <strong>{stats.superadmins}</strong>
          <span>Super admin</span>
        </div>
        <div className="users-stat-card" style={{ borderColor: "#0ea5e9", color: "#0ea5e9" }}>
          <strong>{stats.admins}</strong>
          <span>Admin</span>
        </div>
      </div>

      <div className="users-search" style={{ maxWidth: "100%" }}>
        <span className="users-search-icon"><Search size={15} /></span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Qidirish: ism, login, rol..."
        />
      </div>

      {showForm && createPortal(
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="schedule-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>{editUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"}</strong>
              <button type="button" className="modal-close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form className="users-form" onSubmit={saveUser}>
              {(() => {
                // Employees not yet linked to any user
                const linkedEmpIds = new Set(users.filter(u => u.employeeId).map(u => String(u.employeeId)));
                const availableEmps = employees.filter(e => !linkedEmpIds.has(String(e.id)) || String(e.id) === form.employeeId);
                const selectedEmp = employees.find(e => String(e.id) === form.employeeId);
                return (
                  <>
                    <label>
                      Xodim
                      <select
                        value={form.employeeId}
                        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                      >
                        <option value="">— Xodim tanlang —</option>
                        {availableEmps.map((e) => (
                          <option key={e.id} value={String(e.id)}>{e.name} · {e.role}</option>
                        ))}
                        {editUser && !availableEmps.find(e => String(e.id) === form.employeeId) && selectedEmp && (
                          <option value={String(selectedEmp.id)}>{selectedEmp.name} · {selectedEmp.role}</option>
                        )}
                      </select>
                    </label>
                    {selectedEmp && (
                      <div className="user-emp-preview">
                        <Avatar person={selectedEmp} size={32} />
                        <div>
                          <strong>{selectedEmp.name}</strong>
                          <span>{selectedEmp.role}</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              <label>
                PIN kod (8 raqam)
                <input
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                  placeholder={editUser ? "Bo'sh = o'zgarmaydi" : "12345678"}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                />
                {editUser && <span className="pw-hint">Bo'sh qoldirsangiz joriy PIN o'zgarmaydi</span>}
              </label>
              <label>
                Rol
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Bekor</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saqlanmoqda..." : (editUser ? "Yangilash" : "Qo'shish")}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {pinReveal && createPortal(
        <div className="modal-backdrop" onClick={() => setPinReveal(null)}>
          <div className="schedule-modal pin-reveal-modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Yangi PIN kod</strong>
              <button type="button" className="modal-close-btn" onClick={() => setPinReveal(null)}>✕</button>
            </div>
            <p className="pin-reveal-name">{pinReveal.fullName} <span>@{pinReveal.username}</span></p>
            <div className="pin-reveal-code">{pinReveal.pin}</div>
            <p className="pin-reveal-warning">
              Bu PIN faqat hozir ko'rsatilmoqda — keyin qayta ko'rib bo'lmaydi. Uni xodimga yozib/aytib qo'ying.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(pinReveal.pin).catch(() => {});
                  onNotify("PIN nusxalandi");
                }}
              >
                Nusxalash
              </button>
              <button type="button" className="btn-primary" onClick={() => setPinReveal(null)}>Yopish</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {loading ? <SkeletonPage /> : (
        <div className="users-list">
          {filtered.map((user) => (
            <div key={user.id} className={`user-card${user.isActive ? "" : " inactive"}`}>
              <label
                className={`user-avatar-circle${isSuper(currentUser) ? " editable" : ""}`}
                style={{ backgroundColor: user.avatar ? "transparent" : (ROLE_COLORS[user.role] || "#6b7280"), width: 40, height: 40, flexShrink: 0 }}
                title={isSuper(currentUser) ? "Rasm yuklash" : undefined}
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.fullName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>{user.fullName?.charAt(0).toUpperCase()}</span>
                }
                {isSuper(currentUser) && <div className="avatar-edit-overlay">📷</div>}
                {isSuper(currentUser) && (
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const b64 = await readImageFile(file);
                      try {
                        const updated = await api(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify({ avatar: b64 }) });
                        setUsers((prev) => prev.map((u) => u.id === updated.id ? { ...u, avatar: b64 } : u));
                        onNotify("Rasm yangilandi ✓");
                      } catch (err) { onNotify(err.message, "error"); }
                    }}
                  />
                )}
              </label>
              <div className="user-card-info">
                <span className="user-card-name">{user.fullName}</span>
                {user.employeeId && employees.find(e => String(e.id) === String(user.employeeId)) ? (
                  <span className="user-card-login" style={{ color: "#22c55e" }}>
                    ● ● ● ● ● ● ● ● &nbsp; PIN bilan kiradi
                  </span>
                ) : (
                  <span className="user-card-login">@{user.username}</span>
                )}
                <div className="user-card-badges">
                  <span className={`role-badge ${user.role}`}>
                    {ROLES.find((r) => r.id === user.role)?.label || user.role}
                  </span>
                  <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                    {user.isActive ? "Faol" : "Nofaol"}
                  </span>
                </div>
              </div>
              <div className="user-card-actions">
                <button
                  type="button"
                  className={`action-btn ${user.isActive ? "toggle-on" : "toggle-off"}`}
                  onClick={() => toggleActive(user)}
                  title={user.isActive ? "Nofaol qilish" : "Faollashtirish"}
                >
                  {user.isActive ? <Check size={15} /> : <Plus size={15} style={{ transform: "rotate(45deg)" }} />}
                </button>
                <button
                  type="button"
                  className="action-btn edit"
                  onClick={() => openEdit(user)}
                  title="Tahrirlash"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  className="action-btn pin-regen"
                  onClick={() => regeneratePin(user)}
                  disabled={regeneratingId === user.id}
                  title="PIN kodni qayta yaratish"
                >
                  <RefreshCcw size={15} className={regeneratingId === user.id ? "spin" : ""} />
                </button>
                {user.id !== currentUser?.id && (
                  <button
                    type="button"
                    className="action-btn delete"
                    onClick={() => deleteUser(user)}
                    title="O'chirish"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="empty-state">
              {search ? `"${search}" bo'yicha hech narsa topilmadi` : "Foydalanuvchilar yo'q"}
            </p>
          )}
        </div>
      )}

      {isSuper(currentUser) && <RestoreSection onNotify={onNotify} />}
    </section>
  );
}

function RestoreSection({ onNotify }) {
  const [sqlText, setSqlText] = useState("");
  const [filename, setFilename] = useState("");
  const [restoring, setRestoring] = useState(false);
  const fileRef = useRef(null);

  async function handleRestore() {
    if (!sqlText.trim()) return;
    if (!await showConfirm(`"${filename || "backup"}" faylidan ma'lumotlar tiklansinmi?`)) return;
    setRestoring(true);
    try {
      const res = await apiFetch("/api/admin/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sql: sqlText }) });
      onNotify?.(`Tiklandi: ${res.employees} ta xodim (${res.executed} SQL bajarildi)`, "success");
      setSqlText(""); setFilename("");
    } catch (err) { onNotify?.(err.message || "Tiklashda xato", "error"); }
    finally { setRestoring(false); }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setSqlText(ev.target.result);
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="restore-section">
      <h3>Ma'lumotlarni tiklash (SQL Backup)</h3>
      <p className="restore-hint">Telegramdan yuklangan <code>.sql</code> backup faylini tanlang yoki ichidagi matnni joylashtiring.</p>
      <div className="restore-actions">
        <button type="button" className="btn-sm" onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> .sql fayl tanlash
        </button>
        <input ref={fileRef} type="file" accept=".sql,.txt" onChange={handleFile} style={{ display: "none" }} />
        {filename && <span className="restore-filename">{filename}</span>}
      </div>
      {sqlText && (
        <p className="restore-preview">{sqlText.split("\n").slice(0,4).join("\n")}</p>
      )}
      <button type="button" className="restore-btn" onClick={handleRestore} disabled={restoring || !sqlText.trim()}>
        {restoring ? <RefreshCcw size={15} className="spin" /> : <Save size={15} />}
        {restoring ? "Tiklanmoqda..." : "Tiklash"}
      </button>
    </div>
  );
}

function MenuPanel({ onClose, onPageChange, onOpenMonthly, panelRef, currentUser, theme, onThemeChange }) {
  const links = [
    ["weekly", "Ish jadvali", CalendarDays],
    ["studio", "Jamoa va bo'limlar", UsersRound],
    ["documents", "Hujjatlar", ShieldCheck],
    ["monthly", "Oylik grafik", Clock3],
    ["shooting", "Tasvir jadvali", FileText],
    ["reports", "Hisobotlar", ChartColumn],
    ["tasks", "Vazifalar", BriefcaseBusiness],
    ...(isAdmin(currentUser) ? [["audit", "Audit jurnal", ShieldCheck]] : []),
    ...(isSuper(currentUser) ? [["users", "Foydalanuvchilar", UserCheck]] : []),
    ["bloknot", "Bloknot", BookOpen],
    ["profile", "Profil", User]
  ];

  return (
    <aside ref={panelRef} className="floating-panel menu-panel">
      <strong>Bo'limlar</strong>
      {links.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            if (id === "monthly") onOpenMonthly?.();
            else onPageChange(id);
            onClose();
          }}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
      <div className="menu-panel-divider" />
      <button
        type="button"
        className="menu-panel-theme-btn"
        onClick={() => { onThemeChange?.(theme === "dark" ? "light" : "dark"); onClose(); }}
      >
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
    </aside>
  );
}

function NotificationsPanel({ panelRef, notifications, onMarkRead, onMarkAllRead }) {
  const unread = notifications.filter((n) => !n.isRead);
  const typeIcon = { success: "✅", warning: "⚠️", task: "📋", info: "ℹ️" };

  return (
    <aside ref={panelRef} className="floating-panel notification-panel">
      <div className="notif-panel-head">
        <strong>Bildirishnomalar</strong>
        {unread.length > 0 && (
          <button className="notif-read-all" onClick={onMarkAllRead}>Hammasini o'qi</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="notif-empty">
          <span>🔔</span>
          <p>Bildirishnomalar yo'q</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item${!n.isRead ? " unread" : ""} type-${n.type}`}
              onClick={() => !n.isRead && onMarkRead(n.id)}
            >
              <div className="notif-icon">{typeIcon[n.type] || "ℹ️"}</div>
              <div className="notif-body">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <time>{new Date(n.createdAt).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time>
              </div>
              {!n.isRead && <span className="notif-dot" />}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

// ─── ClockTimePicker ─────────────────────────────────────────────────────────
function ClockTimePicker({ valueH, valueM, period, onSelect, label }) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState("h"); // "h" | "m"

  const CX = 100, CY = 100, R = 80;
  const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const MINS  = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  function angleFromEvent(e) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return (Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI + 90 + 360) % 360;
  }

  function pick(e) {
    const angle = angleFromEvent(e);
    if (angle === null) return;
    if (mode === "h") {
      const h = Math.round(angle / 30) % 12 || 12;
      onSelect(h, valueM, period);
    } else {
      const m = Math.round(angle / 6 / 5) * 5 % 60;
      onSelect(valueH, m, period);
    }
  }

  function handlePointerDown(e) { setDragging(true); pick(e); }
  function handlePointerMove(e) { if (dragging) pick(e); }
  function handlePointerUp()    { setDragging(false); }

  // Hour hand angle
  const hAngle = valueH != null ? ((valueH % 12) * 30 - 90) * Math.PI / 180 : null;
  const hx = hAngle !== null ? CX + R * 0.55 * Math.cos(hAngle) : null;
  const hy = hAngle !== null ? CY + R * 0.55 * Math.sin(hAngle) : null;

  // Minute hand angle (longer hand)
  const mAngle = valueM != null ? (valueM * 6 - 90) * Math.PI / 180 : null;
  const mx = mAngle !== null ? CX + R * 0.75 * Math.cos(mAngle) : null;
  const my = mAngle !== null ? CY + R * 0.75 * Math.sin(mAngle) : null;

  // Display
  const h24 = valueH != null
    ? period === "PM" && valueH !== 12 ? valueH + 12
    : period === "AM" && valueH === 12 ? 0
    : valueH : null;
  const displayStr = h24 != null
    ? `${String(h24).padStart(2, "0")}:${String(valueM ?? 0).padStart(2, "0")}`
    : null;

  const markers = mode === "h" ? HOURS : MINS;

  return (
    <div className="clock-picker">
      <div className="clock-picker-label">{label}</div>
      <div className="clock-mode-row">
        <button type="button" className={`clock-mode-btn${mode === "h" ? " active" : ""}`}
          onClick={() => setMode("h")}>Soat</button>
        <button type="button" className={`clock-mode-btn${mode === "m" ? " active" : ""}`}
          onClick={() => setMode("m")}>Daqiqa</button>
      </div>
      <svg
        ref={svgRef}
        width={200} height={200} viewBox="0 0 200 200"
        className="clock-face"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{ cursor: "crosshair", userSelect: "none", touchAction: "none" }}
      >
        <circle cx={CX} cy={CY} r={R + 10} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.5} />
        {/* tick marks */}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 - 90) * Math.PI / 180;
          const isMaj = i % 5 === 0;
          const r1 = R + 2, r2 = isMaj ? R + 8 : R + 5;
          return <line key={i}
            x1={CX + r1 * Math.cos(a)} y1={CY + r1 * Math.sin(a)}
            x2={CX + r2 * Math.cos(a)} y2={CY + r2 * Math.sin(a)}
            stroke={isMaj ? "#94a3b8" : "#cbd5e1"} strokeWidth={isMaj ? 1.5 : 0.8} />;
        })}
        {/* markers for current mode */}
        {markers.map((val, i) => {
          const a = (i * 30 - 90) * Math.PI / 180;
          const x = CX + R * 0.78 * Math.cos(a);
          const y = CY + R * 0.78 * Math.sin(a);
          const sel = mode === "h" ? val === valueH : val === (valueM ?? 0);
          return (
            <g key={val}>
              {sel && <circle cx={x} cy={y} r={14} fill={mode === "h" ? "var(--accent)" : "#0ea5e9"} />}
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                fill={sel ? "#fff" : "#334155"} fontSize={mode === "h" ? 13 : 11}
                fontWeight={sel ? "700" : "500"} style={{ pointerEvents: "none" }}>
                {mode === "h" ? val : String(val).padStart(2, "0")}
              </text>
            </g>
          );
        })}
        {/* Hour hand — short, blue */}
        {hx != null && <>
          <line x1={CX} y1={CY} x2={hx} y2={hy}
            stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
          <circle cx={hx} cy={hy} r={4} fill="var(--accent)" />
        </>}
        {/* Minute hand — long, cyan */}
        {mx != null && <>
          <line x1={CX} y1={CY} x2={mx} y2={my}
            stroke="#0ea5e9" strokeWidth={2} strokeLinecap="round" />
          <circle cx={mx} cy={my} r={3.5} fill="#0ea5e9" />
        </>}
        <circle cx={CX} cy={CY} r={4} fill="#475569" />
        {valueH == null && valueM == null && (
          <text x={CX} y={CY + 20} textAnchor="middle" fill="#94a3b8" fontSize={11}
            style={{ pointerEvents: "none" }}>Bosing</text>
        )}
      </svg>
      <div className="clock-period-row">
        {["AM", "PM"].map((p) => (
          <button key={p} type="button"
            className={`clock-period-btn${period === p ? " active" : ""}`}
            onClick={() => onSelect(valueH, valueM, p)}>
            {p}
          </button>
        ))}
      </div>
      <div className="clock-display">{displayStr || "—"}</div>
    </div>
  );
}

// ─── VazifalarPage ────────────────────────────────────────────────────────────
function VazifalarPage({ currentUser, onNotify, onNotificationsRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const emptyDraft = { title: "", description: "", assignedToId: "", dueDate: "", timeFromH: null, timeFromM: 0, timeFromP: "AM", timeToH: null, timeToM: 0, timeToP: "PM" };
  const [draft, setDraft] = useState(emptyDraft);
  const [editTask, setEditTask] = useState(null); // task being edited
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadTasks(); loadEmployees(); }, []);

  async function loadTasks() {
    try {
      const data = await api("/api/tasks");
      setTasks(data.tasks || []);
    } catch (err) { onNotify(err.message, "error"); }
    finally { setLoading(false); }
  }

  async function loadEmployees() {
    try {
      const data = await api("/api/employees");
      setEmployees(data.employees || []);
    } catch (err) { onNotify(err.message, "error"); }
  }

  function toHHMM(h, m, p) {
    if (h == null) return null;
    const h24 = p === "PM" && h !== 12 ? h + 12 : p === "AM" && h === 12 ? 0 : h;
    return `${String(h24).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  }

  function openEditModal(task) {
    const timeMatch = task.description?.match(/^\[(\d{2}:\d{2})–(\d{2}:\d{2})\]\n?/);
    const descText = timeMatch ? task.description.slice(timeMatch[0].length) : (task.description || "");
    function parseHHMM(str) {
      if (!str || str === "?") return { h: null, m: 0, p: "AM" };
      const [hh, mm] = str.split(":").map(Number);
      const p = hh >= 12 ? "PM" : "AM";
      const h = hh % 12 || 12;
      return { h, m: mm || 0, p };
    }
    const from = parseHHMM(timeMatch?.[1]);
    const to   = parseHHMM(timeMatch?.[2]);
    setDraft({
      title: task.title,
      description: descText,
      assignedToId: String(task.assignedToId),
      dueDate: task.dueDate || "",
      timeFromH: from.h, timeFromM: from.m, timeFromP: from.p,
      timeToH: to.h,   timeToM: to.m,   timeToP: to.p,
    });
    setEditTask(task);
    setModalOpen(true);
  }

  async function createTask(e) {
    e.preventDefault();
    if (!draft.title.trim()) { onNotify("Vazifa nomini kiriting", "error"); return; }
    if (!draft.assignedToId) { onNotify("Xodimni tanlang", "error"); return; }
    setSubmitting(true);
    const timeFrom = toHHMM(draft.timeFromH, draft.timeFromM, draft.timeFromP);
    const timeTo   = toHHMM(draft.timeToH,   draft.timeToM,   draft.timeToP);
    try {
      if (editTask) {
        await api(`/api/tasks/${editTask.id}`, { method: "PUT", body: JSON.stringify({ ...draft, timeFrom, timeTo }) });
        onNotify("Vazifa yangilandi ✓");
      } else {
        await api("/api/tasks", { method: "POST", body: JSON.stringify({ ...draft, timeFrom, timeTo }) });
        onNotify("Vazifa muvaffaqiyatli yuborildi ✓");
      }
      setModalOpen(false);
      setEditTask(null);
      setDraft(emptyDraft);
      loadTasks();
    } catch (err) { onNotify(err.message, "error"); }
    finally { setSubmitting(false); }
  }

  async function deleteTask(task) {
    if (!await showConfirm(`"${task.title}" vazifasini o'chirasizmi?`)) return;
    try {
      await api(`/api/tasks/${task.id}`, { method: "DELETE" });
      onNotify("Vazifa o'chirildi");
      loadTasks();
    } catch (err) { onNotify(err.message, "error"); }
  }

  async function updateStatus(taskId, status, reason = "") {
    try {
      await api(`/api/tasks/${taskId}/status`, { method: "PATCH", body: JSON.stringify({ status, rejectReason: reason }) });
      const msgs = { ACCEPTED: "Vazifa qabul qilindi ✓", COMPLETED: "Vazifa bajarildi ✓", REJECTED: "Vazifa rad etildi" };
      onNotify(msgs[status] || "Yangilandi");
      onNotificationsRefresh?.();
      loadTasks();
    } catch (err) { onNotify(err.message, "error"); }
  }

  const STATUS_INFO = {
    PENDING:   { label: "Kutilmoqda", color: "#f59e0b", bg: "#fef3c7" },
    ACCEPTED:  { label: "Qabul qilindi", color: "#3b82f6", bg: "#dbeafe" },
    COMPLETED: { label: "Bajarildi", color: "#22c55e", bg: "#dcfce7" },
    REJECTED:  { label: "Rad etildi", color: "#ef4444", bg: "#fee2e2" }
  };

  return (
    <section className="tasks-page">
      <div className="tasks-header">
        <div>
          <h2>Vazifalar</h2>
          <p>Jami {tasks.length} ta vazifa</p>
        </div>
        {isAdmin(currentUser) && (
          <button className="btn-primary" type="button" onClick={() => { setEditTask(null); setDraft(emptyDraft); setModalOpen(true); }}>
            <Plus size={17} /> Yangi vazifa
          </button>
        )}
      </div>

      {loading ? <SkeletonPage /> : (
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="empty-card">
              <span className="empty-icon">📋</span>
              <p>Hozircha vazifalar yo'q</p>
            </div>
          ) : tasks.map((task) => {
            const info = STATUS_INFO[task.status] || STATUS_INFO.PENDING;
            const timeMatch = task.description?.match(/^\[(\d{2}:\d{2})–(\d{2}:\d{2})\]\n?/);
            const taskTime = timeMatch ? `${timeMatch[1]} – ${timeMatch[2]}` : null;
            const descText = timeMatch ? task.description.slice(timeMatch[0].length) : task.description;
            return (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <strong>{task.title}</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="task-status-badge" style={{ background: info.bg, color: info.color }}>{info.label}</span>
                    {isAdmin(currentUser) && (
                      <>
                        <button type="button" className="task-icon-btn" title="Tahrirlash"
                          onClick={() => openEditModal(task)}>
                          <Edit3 size={14} />
                        </button>
                        <button type="button" className="task-icon-btn danger" title="O'chirish"
                          onClick={() => deleteTask(task)}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {descText && <p className="task-description">{descText}</p>}
                <div className="task-meta">
                  {isAdmin(currentUser)
                    ? <span>👤 {task.assignedTo?.fullName}</span>
                    : <span>📤 {task.assignedBy?.fullName}</span>
                  }
                  {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString("uz-UZ")}</span>}
                  {taskTime && <span>⏰ {taskTime}</span>}
                  <span>🕐 {new Date(task.createdAt).toLocaleDateString("uz-UZ")}</span>
                </div>
                {task.rejectReason && (
                  <div className="task-reject-reason"><strong>Sabab:</strong> {task.rejectReason}</div>
                )}
                {!isAdmin(currentUser) && task.status === "PENDING" && (
                  <div className="task-actions">
                    <button className="task-accept-btn" type="button" onClick={() => updateStatus(task.id, "ACCEPTED")}>✅ Qabul qilish</button>
                    <button className="task-reject-btn" type="button" onClick={() => { setRejectModal(task); setRejectReason(""); }}>❌ Rad etish</button>
                  </div>
                )}
                {!isAdmin(currentUser) && task.status === "ACCEPTED" && (
                  <div className="task-actions">
                    <button className="task-complete-btn" type="button" onClick={() => updateStatus(task.id, "COMPLETED")}>🎉 Bajarildi</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Yangi vazifa modal */}
      {modalOpen && createPortal((
        <div className="modal-backdrop" onClick={() => { setModalOpen(false); setEditTask(null); }}>
          <form className="schedule-modal task-create-modal" onSubmit={createTask} onClick={(e) => e.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>{editTask ? "Vazifani tahrirlash" : "Yangi vazifa tayinlash"}</strong>
              <button type="button" className="modal-close" onClick={() => { setModalOpen(false); setEditTask(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <label className="modal-field">
                <span>Vazifa nomi *</span>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Vazifa nomini kiriting" required />
              </label>
              <label className="modal-field">
                <span>Tavsif (ixtiyoriy)</span>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Vazifa haqida batafsil..." rows={3} />
              </label>
              <label className="modal-field">
                <span>Xodim tanlash *</span>
                <select value={draft.assignedToId} onChange={(e) => setDraft({ ...draft, assignedToId: e.target.value })} required>
                  <option value="">— Xodimni tanlang —</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </label>
              <label className="modal-field">
                <span>Muddat (ixtiyoriy)</span>
                <input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
              </label>
              <div className="modal-field">
                <span>Vaqt oralig'i (ixtiyoriy)</span>
                <div className="clock-pickers-row">
                  <ClockTimePicker
                    label="Dan"
                    valueH={draft.timeFromH}
                    valueM={draft.timeFromM}
                    period={draft.timeFromP}
                    onSelect={(h, m, p) => setDraft((d) => ({
                      ...d,
                      timeFromH: h ?? d.timeFromH,
                      timeFromM: m ?? d.timeFromM,
                      timeFromP: p ?? d.timeFromP
                    }))}
                  />
                  <div className="clock-pickers-divider">–</div>
                  <ClockTimePicker
                    label="Gacha"
                    valueH={draft.timeToH}
                    valueM={draft.timeToM}
                    period={draft.timeToP}
                    onSelect={(h, m, p) => setDraft((d) => ({
                      ...d,
                      timeToH: h ?? d.timeToH,
                      timeToM: m ?? d.timeToM,
                      timeToP: p ?? d.timeToP
                    }))}
                  />
                </div>
                {(draft.timeFromH || draft.timeToH) && (() => {
                  const fmt = (h, m, p) => {
                    if (h == null) return "—";
                    const h24 = p === "PM" && h !== 12 ? h + 12 : p === "AM" && h === 12 ? 0 : h;
                    return `${String(h24).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
                  };
                  return (
                    <div className="clock-range-preview">
                      ⏰ {fmt(draft.timeFromH, draft.timeFromM, draft.timeFromP)} – {fmt(draft.timeToH, draft.timeToM, draft.timeToP)}
                    </div>
                  );
                })()}
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={submitting}>
                <Send size={16} /> {submitting ? (editTask ? "Saqlanmoqda..." : "Yuborilmoqda...") : (editTask ? "Saqlash" : "Yuborish")}
              </button>
            </div>
          </form>
        </div>
      ), document.body)}

      {/* Rad etish modal */}
      {rejectModal && createPortal((
        <div className="modal-backdrop" onClick={() => setRejectModal(null)}>
          <div className="schedule-modal task-create-modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-handle" />
            <div className="modal-head">
              <strong>Rad etish sababi</strong>
              <button type="button" className="modal-close" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="task-reject-hint">"{rejectModal.title}" — nima sababdan rad etyapsiz?</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Sababni kiriting..."
                rows={4}
                className="task-reject-textarea"
              />
              <div className="task-reject-actions">
                <button type="button" className="btn-ghost" onClick={() => setRejectModal(null)}>Bekor</button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => {
                    if (!rejectReason.trim()) { onNotify("Sababni kiriting", "error"); return; }
                    updateStatus(rejectModal.id, "REJECTED", rejectReason);
                    setRejectModal(null);
                  }}
                >
                  Rad etish
                </button>
              </div>
            </div>
          </div>
        </div>
      ), document.body)}
    </section>
  );
}

function SkeletonPage() {
  return (
    <section className="skeleton-page">
      <div className="skeleton-hero" />
      <div className="skeleton-row" />
      <div className="skeleton-row short" />
      <div className="skeleton-row" />
      <div className="skeleton-row short" />
    </section>
  );
}

function LoadingScreen({ message = "Yuklanmoqda..." }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <strong>{message}</strong>
    </div>
  );
}

function ConfirmModal({ data, onClose }) {
  if (!data) return null;
  function answer(ok) {
    data.resolve(ok);
    onClose();
  }
  return createPortal(
    <div className="confirm-backdrop" onClick={() => answer(false)}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-msg">{data.message}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-btn-cancel" onClick={() => answer(false)}>Bekor</button>
          <button type="button" className="confirm-btn-ok" onClick={() => answer(true)}>Ha, tasdiqlash</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ToastViewport({ items }) {
  if (!items.length) return null;

  return createPortal(
    <div className="toast-viewport" aria-live="polite" aria-label="Xabarlar">
      {items.map((item) => (
        <div key={item.id} className={`toast-item toast-${item.type || "success"}`}>
          <span className="toast-icon">
            {item.type === "error" && "✕"}
            {item.type === "warning" && "!"}
            {item.type === "info" && "i"}
            {(!item.type || item.type === "success") && "✓"}
          </span>
          <p className="toast-message">{item.message}</p>
        </div>
      ))}
    </div>,
    document.body
  );
}

function BlotknotPage({ currentUser, onNotify }) {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    apiFetch("/api/notes")
      .then((data) => setEntries(data.entries || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  async function persistEntries(next) {
    try {
      await apiFetch("/api/notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries: next }) });
    } catch { onNotify?.("Saqlashda xatolik", "error"); }
  }

  async function addNote() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const entry = { id: Date.now(), type: "text", content: trimmed, createdAt: new Date().toISOString() };
    const next = [...entries, entry];
    setEntries(next);
    setNewText("");
    await persistEntries(next);
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setEditText(entry.content);
  }

  async function saveEdit(id) {
    const trimmed = editText.trim();
    setEditingId(null);
    if (!trimmed) return;
    const next = entries.map((e) => e.id === id ? { ...e, content: trimmed } : e);
    setEntries(next);
    await persistEntries(next);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiFetch("/api/bloknot/upload", {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream", "X-Filename": encodeURIComponent(file.name) },
        body: file
      });
      const entry = { id: Date.now(), type: result.type, url: result.url, filename: result.filename, createdAt: new Date().toISOString() };
      const next = [...entries, entry];
      setEntries(next);
      await persistEntries(next);
    } catch (err) { onNotify?.(err.message || "Yuklashda xato", "error"); }
    finally { setUploading(false); e.target.value = ""; }
  }

  async function deleteEntry(id) {
    const entry = entries.find((e) => e.id === id);
    if (entry?.url) {
      const filename = entry.url.split("/").pop();
      await apiFetch(`/api/bloknot/files/${filename}`, { method: "DELETE" }).catch(() => {});
    }
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    await persistEntries(next);
  }

  return (
    <section className="notepad-page">
      <div className="notepad-header">
        <BookOpen size={18} />
        <span>Bloknot</span>
      </div>
      <div className="notepad-scroll">
        {entries.length === 0 && (
          <div className="notepad-empty">Hali hech narsa yo'q. Quyida eslatma qo'shing.</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="notepad-row">
            <div className="notepad-row-content">
              {entry.type === "text" ? (
                editingId === entry.id ? (
                  <textarea
                    ref={editRef}
                    className="notepad-edit"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(entry.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(entry.id); }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <p className="notepad-text" onClick={() => startEdit(entry)}>{entry.content}</p>
                )
              ) : entry.type === "image" ? (
                <img src={entry.url} alt={entry.filename} className="notepad-img" onClick={() => window.open(entry.url, "_blank")} />
              ) : entry.type === "video" ? (
                <video src={entry.url} controls className="notepad-video" />
              ) : (
                <a href={entry.url} download className="notepad-file"><Paperclip size={14} /> {entry.filename}</a>
              )}
            </div>
            <button type="button" className="notepad-del" onClick={() => deleteEntry(entry.id)} title="O'chirish">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="notepad-bar">
        <button type="button" className="notepad-attach" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Fayl yuklash">
          {uploading ? <RefreshCcw size={18} className="spin" /> : <Paperclip size={18} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xlsx,.zip" onChange={handleFileChange} style={{ display: "none" }} />
        <input
          className="notepad-input"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
          placeholder="Yangi eslatma..."
        />
        <button type="button" className="notepad-add" onClick={addNote} disabled={!newText.trim()}>
          <Plus size={18} />
        </button>
      </div>
    </section>
  );
}

function BottomNav({ page, onPageChange }) {
  const items = [
    { id: "weekly", label: "Jadval", icon: CalendarDays },
    { id: "studio", label: "Jamoa", icon: UsersRound },
    { id: "tasks", label: "Vazifalar", icon: BriefcaseBusiness },
    { id: "documents", label: "Hujjatlar", icon: ShieldCheck },
    { id: "profile", label: "Profil", icon: User }
  ];

  return (
    <nav className="bottom-nav" aria-label="Pastki navigatsiya">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button className={page === item.id ? "active" : ""} type="button" key={item.id} onClick={() => onPageChange(item.id)}>
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

createRoot(document.getElementById("root")).render(<App />);
