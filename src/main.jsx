import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  Bell,
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
  Info,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Phone,
  PlayCircle,
  Plus,
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
  UsersRound,
  Umbrella
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const WEEK_DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const DAY_TABS = ["Bugun", ...WEEK_DAYS, "Barcha kunlar"];
const MONTH_NAMES = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const STATUS_OPTIONS = [
  { id: "working", code: "S", label: "Studiyada", metric: "working" },
  { id: "rest", code: "D", label: "Damda", metric: "rest" },
  { id: "trip", code: "K", label: "Komandirovka", metric: "away" },
  { id: "tjk", code: "T", label: "TJK ishda", metric: "working" },
  { id: "backup", code: "Z", label: "Zaxira", metric: "working" },
  { id: "vacation", code: "M", label: "Mehnat ta'tili", metric: "rest" },
  { id: "administration", code: "A", label: "Administratsiya", metric: "working" },
  { id: "presidential", code: "P", label: "Prezidentskiy", metric: "working" },
  { id: "otpiska", code: "O", label: "Otpiska", metric: "rest" }
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
  work: { label: "I", shift: "Ishda", hours: 9 },
  rest: { label: "D", shift: "Dam", hours: 0 },
  trip: { label: "K", shift: "Komandirovka", hours: 9 },
  tjk: { label: "T", shift: "TJK guruhi", hours: 9 },
  studio: { label: "S", shift: "Studiyada", hours: 9 },
  vacation: { label: "M", shift: "Ta'tilda", hours: 0 },
  otpiska: { label: "O", shift: "Otpiska", hours: 0 },
  administration: { label: "A", shift: "Administratsiya", hours: 9 },
  presidential: { label: "P", shift: "Prezidentskiy", hours: 9 }
};
const MONTHLY_STATUS_SEQUENCE = ["work", "rest", "trip", "tjk", "studio", "vacation", "otpiska", "administration", "presidential"];
const DEPARTMENTS = [
  { id: "pull", label: "Pull xizmati", shortLabel: "Pull" },
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

function monthlyStatusForEmployee(employee, date) {
  if (!employee) return "rest";
  const day = date.getDate();
  const id = Number(employee.id) || 1;
  if ((id + day) % 7 === 0) return "rest";
  if ((id * 7 + day) % 29 === 0) return "vacation";
  if ((id * 5 + day) % 23 === 0) return "otpiska";
  if ((id * 3 + day) % 17 === 0) return "trip";
  if ((id * 2 + day) % 13 === 0) return "tjk";
  if ((id * 3 + day) % 11 === 0) return "studio";
  if ((id + day) % 19 === 0) return "administration";
  if ((id + day) % 23 === 0) return "presidential";
  return "work";
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

function App() {
  const [page, setPage] = useState("weekly");
  const [previousPage, setPreviousPage] = useState("weekly");
  const [weekStart, setWeekStart] = useState("2026-01-29");
  const [activeDay, setActiveDay] = useState("Bugun");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Yuklanmoqda...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAllOverview, setShowAllOverview] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => window.localStorage.getItem("theme") || "light");
  const [currentUser, setCurrentUser] = useState(() => readStoredJson("currentUser", null));
  const [departments, setDepartments] = useState([]);
  const [navDirection, setNavDirection] = useState("next");
  const [toasts, setToasts] = useState([]);
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

  const loadDepartments = useCallback(async () => {
    try {
      const data = await api("/api/departments");
      setDepartments(data?.departments || []);
    } catch {}
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!hasLoadedDashboard.current) setLoading(true);
    setError("");

    try {
      setDashboard(await api(`/api/dashboard?weekStart=${weekStart}`));
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
    loadDepartments();
  }, [loadDashboard, loadDepartments]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

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
      avatar: ""
    };
    window.localStorage.setItem("currentUser", JSON.stringify(userData));
    window.localStorage.setItem("authToken", token);
    setCurrentUser(userData);
    notify(`Xush kelibsiz, ${user.fullName}!`);
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
    window.localStorage.removeItem("currentUser");
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("authTokens");
    setCurrentUser(null);
    setPage("weekly");
    notify("Tizimdan chiqildi");
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
    if (!window.confirm("Ushbu hafta jadvalini o'chirasizmi?")) return;
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
        await api("/api/employees", { method: "POST", body: JSON.stringify(employee) });
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
    if (!window.confirm("Xodimni ro'yxatdan o'chirasizmi?")) return;
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
    return "Ish jadvali";
  }, [page]);

  if (!currentUser) {
    return (
      <>
        <AuthPage onAuth={handleAuth} onNotify={notify} theme={theme} onThemeChange={setTheme} />
        <ToastViewport items={toasts} />
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
    ["audit", "Audit jurnal", ShieldCheck],
    ...(isSuper(currentUser) ? [["users", "Foydalanuvchilar", UserCheck]] : []),
    ["profile", "Profil", User]
  ];

  return (
    <div className="app-shell">
      {generating && <LoadingScreen message={loadingMessage} />}

      <aside className="desktop-sidebar">
        <div className="desktop-sidebar-brand">
          <img src="/logo.svg" alt="O'zbekiston 24"
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
              src="/logo.svg"
              alt="O'zbekiston 24"
              className="topbar-logo"
              onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
            <span className="topbar-logo-fallback" style={{ display: "none" }}>
              O'Z<strong>24</strong>
            </span>
          </div>
          <button ref={notificationsButtonRef} className="icon-button" type="button" aria-label="Bildirishnomalar" onClick={() => {
            setNotificationsOpen((value) => !value);
            setMenuOpen(false);
          }}>
            <Bell size={20} fill="currentColor" />
          </button>
        </header>

        {menuOpen && <MenuPanel panelRef={menuPanelRef} onClose={() => setMenuOpen(false)} onPageChange={setPage} onOpenMonthly={openMonthly} currentUser={currentUser} />}
        {notificationsOpen && <NotificationsPanel panelRef={notificationsPanelRef} items={dashboard.notifications} />}

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
                />
              )}
              {page === "monthly" && <MonthlyPage dashboard={dashboard} weekStart={weekStart} fullscreen onClose={closeMonthly} currentUser={currentUser} onNotify={notify} />}
              {page === "documents" && <DocumentsPage employees={dashboard.employees} onNotify={notify} onSaveEmployee={saveEmployee} />}
              {page === "shooting" && <ShootingPage onNotify={notify} />}
              {page === "reports" && <ReportsPage dashboard={dashboard} />}
              {page === "audit" && <AuditPage />}
              {page === "users" && isSuper(currentUser) && (
                <UsersPage currentUser={currentUser} onNotify={notify} />
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
    if (!window.confirm(`"${dept.label}" bo'limini o'chirasizmi?`)) return;
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

function AuthPage({ onAuth, onNotify, theme, onThemeChange }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError("Login va parolni kiriting");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      onAuth(data.user, data.token);
    } catch (err) {
      setError(err.message || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <span><ShieldCheck size={24} /></span>
          <div>
            <strong>O'zbekiston 24</strong>
            <p>Ish jadvali boshqaruvi</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label>
            Login
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="superadmin"
              autoComplete="username"
            />
          </label>
          <label>
            Parol
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            <LogIn size={17} />
            {loading ? "Kirish..." : "Kirish"}
          </button>
        </form>
        <button className="theme-switch" type="button" onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
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
    summary: [
      ["Xodim ID", `EMP-${String(employee.id || 0).padStart(3, "0")}`],
      ["F.I.Sh", employee.name || "Kiritilmagan"],
      ["Lavozim", employee.role || "Kiritilmagan"],
      ["Bo'lim", department.label],
      ["Telefon", employee.phone || "Kiritilmagan"],
      ["Telegram", employee.telegram || "Kiritilmagan"],
      ["Holat", "Faol"],
      ["Haftalik smenalar", `${assignments.length} ta`],
      ["Ishdagi smenalar", `${activeAssignments.length} ta`],
      ["Dam/ta'til", `${restAssignments.length} ta`],
      ["Portfolio", `${portfolio.length} ta video`]
    ]
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

function downloadEmployeeFiles(employee, assignments = []) {
  const model = employeeDocumentModel(employee, assignments);
  const fileName = safeFileName(model.name);
  downloadBlob(buildDocxBlob(model), `${fileName}.docx`);
  window.setTimeout(() => downloadBlob(buildXlsxBlob(model), `${fileName}.xlsx`), 120);
}

function ShootingPage({ onNotify }) {
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
  const [draftRow, setDraftRow] = useState(blankRow);
  const addFormRef = useRef(null);

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
      <div className="shooting-actions">
        <div>
          <h2>Kunlik tasvirga olish jadvali</h2>
          <p>29 aprel 2026 yil uchun Excel uslubidagi forma</p>
        </div>
        <div className="shooting-action-buttons">
          <button type="button" onClick={() => setAddOpen(true)}>
            <Plus size={17} />
            Yangi jadval
          </button>
          <button type="button" onClick={downloadExcel}>
            <Save size={17} />
            Excel
          </button>
          <button type="button" onClick={() => window.print()}>
            <FileText size={17} />
            Print
          </button>
        </div>
      </div>

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
                      <input value={row.equipment} onChange={(event) => updateRow(index, "equipment", event.target.value)} aria-label="Kerakli jihoz va texnika" />
                    </td>
                  </tr>
                  <tr>
                    <td className="camera-cell"><textarea value={row.camera} onChange={(event) => updateRow(index, "camera", event.target.value)} aria-label="Kamera raqami" /></td>
                    <td className="time-cell"><textarea value={row.time} onChange={(event) => updateRow(index, "time", event.target.value)} aria-label="Chiqish vaqti" /></td>
                    <td><textarea value={row.operatorsText} onChange={(event) => updateRow(index, "operatorsText", event.target.value)} aria-label="Operator va texnik xodim" /></td>
                    <td className="topic-cell"><textarea value={row.topic} onChange={(event) => updateRow(index, "topic", event.target.value)} aria-label="Tadbir o'tkazilish joyi va mavzusi" /></td>
                    <td><textarea value={row.reportersText} onChange={(event) => updateRow(index, "reportersText", event.target.value)} aria-label="Muxbirlar" /></td>
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

const DAILY_STATUSES = {
  empty: { label: "", bg: "#e2e8f0", fg: "#94a3b8", name: "Bo'sh" },
  I:     { label: "I", bg: "#22c55e", fg: "#fff",    name: "Ishda" },
  S:     { label: "S", bg: "#3b82f6", fg: "#fff",    name: "Studiyada" },
  T:     { label: "T", bg: "#eab308", fg: "#fff",    name: "TJK guruhi" },
  K:     { label: "K", bg: "#f97316", fg: "#fff",    name: "Komandirovka" },
  D:     { label: "D", bg: "#ef4444", fg: "#fff",    name: "Dam olish" },
  M:     { label: "M", bg: "#a855f7", fg: "#fff",    name: "Ta'til" },
  O:     { label: "O", bg: "#6b7280", fg: "#fff",    name: "Otpiska" },
  A:     { label: "A", bg: "#06b6d4", fg: "#fff",    name: "Administratsiya" },
  P:     { label: "P", bg: "#ec4899", fg: "#fff",    name: "Prezidentskiy" }
};
const WORKING_DAILY = ["I", "S", "T", "A", "P"];

function localDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ─── Cell dropdown (Portal, avoids overflow-x clipping) ──────────────────────
function CellDropdown({ currentCode, buttonRect, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function onPointer(e) { if (!ref.current?.contains(e.target)) onClose(); }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [onClose]);

  const left = Math.min(
    Math.max(4, buttonRect.left + buttonRect.width / 2 - 80),
    window.innerWidth - 172
  );
  const top = buttonRect.bottom + 6;

  return createPortal(
    <div ref={ref} className="cell-dropdown" style={{ position: "fixed", top, left, zIndex: 9999 }}>
      {Object.entries(DAILY_STATUSES).map(([code, info]) => (
        <button
          key={code}
          type="button"
          className={`cell-dropdown-item${currentCode === code ? " active" : ""}`}
          onClick={() => { onSelect(code); onClose(); }}
        >
          <span className="cell-dropdown-dot" style={{ background: info.bg, color: info.fg }}>{info.label}</span>
          {info.name || "Bo'sh"}
          {currentCode === code && <span className="cell-dropdown-check">✓</span>}
        </button>
      ))}
    </div>,
    document.body
  );
}

function StatusCell({ emp, day, code, adminMode, onSelect }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);
  const info = DAILY_STATUSES[code] || DAILY_STATUSES.empty;

  const close = useCallback(() => setOpen(false), []);

  function handleClick() {
    if (!adminMode) return;
    setRect(btnRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="mc"
        style={{ background: info.bg, color: info.fg }}
        onClick={handleClick}
        disabled={!adminMode}
        title={adminMode ? `${emp.name}: ${info.name} — bosing` : info.name}
      >
        {info.label}
      </button>
      {open && rect && (
        <CellDropdown
          currentCode={code}
          buttonRect={rect}
          onSelect={(newCode) => onSelect(emp, day, newCode)}
          onClose={close}
        />
      )}
    </>
  );
}

function MonthlyPage({ dashboard, weekStart, fullscreen = false, onClose, currentUser, onNotify }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [statuses, setStatuses]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  const employees = dashboard.employees;
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [year, month, daysInMonth]);
  const pad2 = (n) => String(n).padStart(2, "0");
  const monthPrefix = `${year}-${pad2(month)}`;

  useEffect(() => {
    setLoading(true);
    api(`/api/daily-status?year=${year}&month=${month}`)
      .then((data) => setStatuses(data.statuses || {}))
      .catch(() => { setStatuses({}); onNotify?.("Statuslarni yuklashda xato", "error"); })
      .finally(() => setLoading(false));
  }, [year, month]);

  function getCode(empId, day) {
    return statuses[empId]?.[`${monthPrefix}-${pad2(day)}`] || "empty";
  }

  async function handleCellSelect(emp, day, newCode) {
    if (!isAdmin(currentUser)) return;
    const dateStr = `${monthPrefix}-${pad2(day)}`;
    const oldCode = getCode(emp.id, day);

    setStatuses((prev) => ({ ...prev, [emp.id]: { ...(prev[emp.id] || {}), [dateStr]: newCode } }));
    setSelectedCell({ empName: emp.name, day, code: newCode, info: DAILY_STATUSES[newCode] });

    try {
      await api("/api/daily-status", { method: "POST", body: JSON.stringify({ employeeId: emp.id, date: dateStr, statusCode: newCode }) });
      onNotify?.(`${emp.name}: ${DAILY_STATUSES[newCode]?.name || "Bo'sh"} ✓`);
    } catch (err) {
      setStatuses((prev) => ({ ...prev, [emp.id]: { ...(prev[emp.id] || {}), [dateStr]: oldCode } }));
      setSelectedCell(null);
      onNotify?.("Saqlashda xato: " + err.message, "error");
    }
  }

  const totals = useMemo(() => {
    const r = { I: 0, S: 0, T: 0, K: 0, D: 0, M: 0, O: 0, A: 0, P: 0, working: 0, rest: 0, hours: 0 };
    for (const emp of employees) {
      const empSt = statuses[emp.id] || {};
      for (let d = 1; d <= daysInMonth; d++) {
        const code = empSt[`${monthPrefix}-${pad2(d)}`] || "empty";
        if (code !== "empty") {
          if (r[code] !== undefined) r[code]++;
          if (WORKING_DAILY.includes(code)) { r.working++; r.hours += 9; }
          if (["D", "M", "O"].includes(code)) r.rest++;
        }
      }
    }
    return r;
  }, [statuses, employees, year, month, daysInMonth, monthPrefix]);

  function getRowTotals(empId) {
    const empSt = statuses[empId] || {};
    const r = { working: 0, rest: 0, hours: 0 };
    for (let d = 1; d <= daysInMonth; d++) {
      const code = empSt[`${monthPrefix}-${pad2(d)}`] || "empty";
      if (WORKING_DAILY.includes(code)) { r.working++; r.hours += 9; }
      if (["D", "M", "O"].includes(code)) r.rest++;
    }
    return r;
  }

  function prevMonth() { if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1); }
  function nextMonth() { if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1); }

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

      <div className="monthly-summary">
        {[["I","Ishda"],["S","Studiya"],["T","TJK"],["K","Safar"],["D","Dam"],["M","Ta'til"]].map(([code, label]) => (
          <span key={code}><b style={{ color: DAILY_STATUSES[code].bg }}>{totals[code]}</b> {label}</span>
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

      {loading ? (
        <div className="monthly-loading">Yuklanmoqda...</div>
      ) : (
        <div className="monthly-scroll" role="region" aria-label="Oylik grafik">
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
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => {
                const rt = getRowTotals(emp.id);
                return (
                  <tr key={emp.id} className="mtr">
                    <td className="mtd-num">{idx + 1}</td>
                    <td className="mtd-name">{emp.name}</td>
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
                            adminMode={isAdmin(currentUser)}
                            onSelect={handleCellSelect}
                          />
                        </td>
                      );
                    })}
                    <td className="mtd-total working">{rt.working}</td>
                    <td className="mtd-total rest">{rt.rest}</td>
                    <td className="mtd-total hours">{rt.hours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCell && (
        <div className="monthly-cell-info">
          <strong>{selectedCell.empName}</strong>
          <span>{selectedCell.day}-{MONTH_NAMES[month - 1]}:</span>
          <span className="mci-badge" style={{ background: selectedCell.info.bg, color: selectedCell.info.fg }}>
            {selectedCell.code} — {selectedCell.info.name}
          </span>
          {WORKING_DAILY.includes(selectedCell.code) && <span className="mci-word">✓ Word jadvalga tushadi</span>}
          {!WORKING_DAILY.includes(selectedCell.code) && selectedCell.code !== "empty" && <span className="mci-noword">✗ Word jadvalga tushmaydi</span>}
        </div>
      )}

      <div className="time-panel">
        <div className="time-panel-icon"><Clock3 size={18} /></div>
        <div>
          <strong>Vaqt belgilari</strong>
          <p>{selectedCell ? `${selectedCell.empName}: ${selectedCell.day}-kun — ${selectedCell.info.name}` : isAdmin(currentUser) ? "Katak ustiga bosing — status tanlash uchun" : "Jadval ko'rish rejimi"}</p>
        </div>
      </div>
    </div>
  );

  if (!fullscreen) return <section className="monthly-page">{monthlyBody}</section>;

  return createPortal((
    <div className="monthly-fullscreen-backdrop" role="dialog" aria-modal="true" aria-label="Oylik grafik" onClick={onClose}>
      <section className="monthly-fullscreen" onClick={(event) => event.stopPropagation()}>
        <header className="monthly-fullscreen-head">
          <button type="button" onClick={onClose} aria-label="Chiqish"><ChevronLeft size={20} />Chiqish</button>
          <div><strong>Oylik grafik</strong><span>{MONTH_NAMES[month - 1]} {year}</span></div>
          <i />
        </header>
        <div className="monthly-fullscreen-body">
          <section className="monthly-page">{monthlyBody}</section>
        </div>
      </section>
    </div>
  ), document.body);
}

function WeeklyPage({ activeDay, currentUser, dashboard, onCreate, onDeleteSchedule, onDayChange, onOpenMonthly, onStatusChange }) {
  const [openMetric, setOpenMetric] = useState("");
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const todayName = todayDayName();
  const filteredGroups = useMemo(() => {
    if (activeDay === "Barcha kunlar") return dashboard.groups;
    const selectedDay = activeDay === "Bugun" ? todayName : activeDay;
    return dashboard.groups.filter((group) => group.day === selectedDay);
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
        <button className="create-button" type="button" onClick={onCreate}>
          <RefreshCcw size={17} />
          Yangi jadval yaratish
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

function StudioPage({ currentUser, departments, onLoadDepartments, dashboard, onCreate, onDeleteEmployee, onNotify, onSaveEmployee }) {
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
  const today = dashboard.studioToday?.[0];
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
      <section className="team-daily-card">
        <div>
          <strong>KUNLIK JADVAL</strong>
          <span>BUGUN: 7-May, 2026</span>
          <span>Navbatchilik: Dron & TJK</span>
          <span>Bosh Operator: {today?.name || "A. Valiyev"}</span>
        </div>
        <button type="button">BATAFSIL</button>
      </section>

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
          <button className="primary" type="button" onClick={() => setScheduleModalOpen(true)}>
            <CalendarDays size={15} />
            Yangi Jadval Yaratish
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
            <div><dt>Telefon:</dt><dd>{person.phone || "+998 90 123 45 67"}</dd></div>
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

function StudioGroup({ group, open = true, onPersonOpen, onToggle, onStatusChange }) {
  return (
    <article className="group-card">
      <button className={`group-head ${group.tone}`} type="button" onClick={onToggle} aria-expanded={open}>
        <strong>{group.title}</strong>
        <span>{group.meta}</span>
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
}

function StaffRow({ groupId, person, onPersonOpen, onStatusChange }) {
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
}

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
            <LogOut size={18} />
            Chiqish
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

function DocumentsPage({ employees, onNotify, onSaveEmployee }) {
  const [selectedId, setSelectedId] = useState(employees[0]?.id || "");
  const [draft, setDraft] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [documentMode, setDocumentMode] = useState("word");
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const emp = employees.find((e) => String(e.id) === String(selectedId)) || employees[0] || null;
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
      avatar: emp.avatar || ""
    });
    if (String(emp.id) !== String(selectedId)) setSelectedId(emp.id);
  }, [employees, selectedId]);

  function openEdit() {
    if (!draft) return;
    setEditDraft({
      id: draft.id,
      name: draft.name || "",
      role: draft.role || "",
      phone: draft.phone || "",
      telegram: draft.telegram || "",
      department: draft.department || "operator",
      address: draft.address || "",
      portfolio: (draft.portfolio || []).map((item) => ({ ...item })),
      avatar: draft.avatar || ""
    });
    setEditOpen(true);
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
      avatar: editDraft.avatar
    });
    setSaving(false);
    if (!saved) return;
    setEditOpen(false);
  }

  if (!draft) return <EmptyCard text="Xodimlar ro'yxati bo'sh" />;

  return (
    <section className="documents-page">
      <section className="documents-card">
        <div className="section-head">
          <h2>Hujjatlar</h2>
          <span>{(draft.portfolio || []).length} video</span>
        </div>
        <label className="document-select">
          Xodim
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </label>
        <div className="document-profile">
          <Avatar person={draft} />
          <div>
            <strong>{draft.name}</strong>
            <span>{draft.role}</span>
          </div>
        </div>
        <div className="document-view-actions">
          <button className={documentMode === "word" ? "active" : ""} type="button" onClick={() => setDocumentMode("word")}>
            <FileText size={16} />
            Word ko'rish
          </button>
          <button className={documentMode === "excel" ? "active" : ""} type="button" onClick={() => setDocumentMode("excel")}>
            <FileSpreadsheet size={16} />
            Excel ko'rish
          </button>
          <button type="button" onClick={() => downloadEmployeeFiles(draft)}>
            <Download size={16} />
            Yuklab olish
          </button>
        </div>
        <button className="document-edit-open" type="button" onClick={openEdit}>
          <Edit3 size={17} />
          Ma'lumotlarni tahrirlash
        </button>
      </section>

      <EmployeeDocumentView employee={draft} mode={documentMode} />

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

function EmployeeDocumentView({ assignments = [], employee, mode = "word" }) {
  const model = employeeDocumentModel(employee, assignments);

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

function ReportsPage({ dashboard }) {
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
  const departmentCounts = DEPARTMENTS.map((department) => ({
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

function ProfilePage({ currentUser, dashboard, theme, onLogout, onRefresh, onThemeChange, onSaveContact, onDeleteContact, onUpdateUser, onNotify }) {
  const [notify, setNotify] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(currentUser);
  const [contactDraft, setContactDraft] = useState({ type: "Muxbir", name: "", vehicle: "", phone: "" });
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [todaySlide, setTodaySlide] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date()));
  const formRef = useRef(null);
  const operators = dashboard.employees.filter((employee) => employee.role.includes("Operator")).length;
  const reporters = dashboard.employees.filter((employee) => employee.role.includes("Muxbir")).length;
  const contacts = dashboard.contacts || [];
  const drivers = contacts.filter((contact) => contact.type === "Haydovchi").length;
  const profileEmployee = useMemo(() => {
    const userName = normalizeLookupName(currentUser.name);
    const matchedEmployee = dashboard.employees.find((employee) => {
      const employeeName = normalizeLookupName(employee.name);
      return employeeName === userName || employeeName.includes(userName) || userName.includes(employeeName);
    });
    return matchedEmployee || dashboard.employees[0] || null;
  }, [currentUser.name, dashboard.employees]);
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
    const base = new Date();
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;
    const blanks = Array.from({ length: offset }, () => null);
    const days = Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(year, month, index + 1);
      const dateText = toInputDate(date);
      const status = monthlyStatusForEmployee(profileEmployee, date);
      return {
        date,
        dateText,
        day: index + 1,
        status,
        isToday: dateText === toInputDate(new Date())
      };
    });
    return {
      title: `${MONTH_NAMES[month]} ${year}`,
      days: [...blanks, ...days]
    };
  }, [profileEmployee]);
  const selectedDay = calendarInfo.days.find((day) => day?.dateText === selectedDate) || calendarInfo.days.find((day) => day?.isToday) || calendarInfo.days.find(Boolean);
  const selectedStatusMeta = selectedDay ? (MONTHLY_STATUS_OPTIONS[selectedDay.status] || STATUS_META[selectedDay.status]) : null;
  const bannerStatusMeta = activeAssignment ? STATUS_META[activeAssignment.statusType] : selectedStatusMeta;
  const showAssignmentDetail = selectedDay && !["rest", "vacation", "otpiska"].includes(selectedDay.status);

  useEffect(() => {
    setDraft(currentUser);
  }, [currentUser]);

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

  function submitProfile(event) {
    event.preventDefault();
    const required = [
      ["profile-name", draft.name, "Ism familiyani kiriting."],
      ["profile-email", draft.email, "Emailni kiriting."],
      ["profile-role", draft.role, "Rolni kiriting."]
    ];
    const invalid = required.find(([, value]) => !String(value || "").trim());
    if (invalid) {
      onNotify(invalid[2], "error");
      formRef.current?.querySelector(`[name='${invalid[0]}']`)?.focus();
      return;
    }

    onUpdateUser(draft);
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

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <span className="profile-avatar large">
          {currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} /> : <User size={38} />}
        </span>
        <div>
          <strong>{currentUser.name}</strong>
          <p>{currentUser.role}</p>
          <em>{currentUser.email}</em>
        </div>
        <button type="button" aria-label="Profilni tahrirlash" onClick={() => setEditOpen((value) => !value)}>
          <Edit3 size={17} />
        </button>
      </div>

      {editOpen && (
        <section className="profile-edit-card">
          <div className="section-head">
            <h2>Profilni tahrirlash</h2>
            <button type="button" onClick={() => setEditOpen(false)}>
              Yopish
            </button>
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
              Email
              <input name="profile-email" type="email" value={draft.email || ""} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="admin@uz24.local" />
            </label>
            <label>
              Rol
              <input name="profile-role" value={draft.role || ""} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Jadval administratori" />
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
        <div className="section-head">
          <h2>Mening oylik kalendarim</h2>
          <span>{calendarInfo.title}</span>
        </div>
        <div className="profile-calendar-weekdays">
          {["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="profile-calendar-grid">
          {calendarInfo.days.map((day, index) => day ? (
            <button
              className={`${day.status} ${day.isToday ? "today" : ""} ${selectedDate === day.dateText ? "selected" : ""}`}
              type="button"
              key={day.dateText}
              onClick={() => setSelectedDate(day.dateText)}
            >
              <strong>{day.day}</strong>
              <span>{MONTHLY_STATUS_OPTIONS[day.status]?.label || STATUS_META[day.status]?.code || "K"}</span>
            </button>
          ) : <i key={`blank-${index}`} />)}
        </div>
        {selectedDay && (
          <article className={`profile-day-detail ${selectedDay.status}`}>
            <div>
              <span>{selectedDay.dateText}</span>
              <strong>{selectedStatusMeta?.shift || selectedStatusMeta?.label || "Ish kuni"}</strong>
              <p>{profileEmployee ? `${profileEmployee.name} uchun oylik status.` : "Profil xodimga ulanmagan."}</p>
            </div>
            <dl>
              <div><dt>Status</dt><dd>{selectedStatusMeta?.shift || selectedStatusMeta?.label || STATUS_META[selectedDay.status]?.code || "K"}</dd></div>
              <div><dt>Soat</dt><dd>{formatHourLabel(MONTHLY_STATUS_OPTIONS[selectedDay.status]?.hours ?? (STATUS_META[selectedDay.status]?.metric === "rest" ? 0 : 9))}</dd></div>
              {showAssignmentDetail && (
                <>
                  <div><dt>Kamera raqami</dt><dd>{extractCameraNumber(shootingAssignment?.camera) || "Kiritilmagan"}</dd></div>
                  <div><dt>Mashina</dt><dd>{driverContact?.vehicle || "Kiritilmagan"}</dd></div>
                  <div><dt>Haydovchi</dt><dd>{extractDriverInfo(shootingAssignment?.topic) || driverContact?.name || "Kiritilmagan"}</dd></div>
                  <div><dt>Muxbir</dt><dd>{shootingAssignment?.reporters?.join(", ") || "Kiritilmagan"}</dd></div>
                </>
              )}
            </dl>
          </article>
        )}
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

        <div className="contact-list">
          {contacts.length ? contacts.map((contact) => (
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
          )) : <EmptyCard text="Kontaktlar hali kiritilmagan" />}
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
        <button className="settings-row button" type="button" onClick={onRefresh}>
          <RefreshCcw size={17} />
          <span>Ma'lumotlarni yangilash</span>
        </button>
      </section>

      <button className="logout-button" type="button" onClick={() => window.confirm("Haqiqatan ham akkauntdan chiqib ketmoqchimisiz?") && onLogout()}>
        <LogOut size={18} />
        Chiqish
      </button>
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

function UsersPage({ currentUser, onNotify }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: "", password: "", fullName: "", role: "xodim" });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");

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
    setForm({ username: "", password: "", fullName: "", role: "xodim" });
    setShowPassword(false);
    setShowForm(true);
  }

  function openEdit(user) {
    setEditUser(user);
    setForm({ username: user.username, password: "", fullName: user.fullName, role: user.role });
    setShowPassword(false);
    setShowForm(true);
  }

  async function saveUser(event) {
    event.preventDefault();
    if (!form.fullName.trim()) { onNotify("To'liq ism kiritilmadi", "error"); return; }
    if (!editUser && (!form.username.trim() || !form.password.trim())) { onNotify("Login va parol kiritilmadi", "error"); return; }
    if (!editUser && form.password.length < 6) { onNotify("Parol kamida 6 belgi bo'lishi kerak", "error"); return; }
    setSaving(true);
    try {
      const body = { fullName: form.fullName, role: form.role };
      if (!editUser) { body.username = form.username; body.password = form.password; }
      else if (form.password) body.password = form.password;

      if (editUser) {
        const updated = await api(`/api/users/${editUser.id}`, { method: "PUT", body: JSON.stringify(body) });
        setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
        onNotify("Foydalanuvchi yangilandi");
      } else {
        const created = await api("/api/users", { method: "POST", body: JSON.stringify(body) });
        setUsers((prev) => [...prev, created]);
        onNotify("Foydalanuvchi qo'shildi");
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
      onNotify(updated.isActive ? "Foydalanuvchi faollashtirildi" : "Foydalanuvchi o'chirildi", updated.isActive ? "success" : "warning");
    } catch (err) {
      onNotify(err.message || "Xatolik", "error");
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`${user.fullName} ni o'chirishni tasdiqlaysizmi?`)) return;
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
              <label>
                To'liq ism
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Ism Familiya"
                />
              </label>
              <label>
                Login (username)
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                  placeholder="username"
                  autoComplete="off"
                  readOnly={editUser?.id === currentUser?.id}
                />
              </label>
              <label>
                Parol
                {editUser && <span className="pw-hint">Bo'sh qoldiring — o'zgarmaydi</span>}
                {!editUser && <span className="pw-hint">Kamida 6 belgi</span>}
                <div className="pw-field-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editUser ? "••••••••" : "Yangi parol"}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Yashirish" : "Ko'rsatish"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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

      {loading ? <SkeletonPage /> : (
        <div className="users-list">
          {filtered.map((user) => (
            <div key={user.id} className={`user-card${user.isActive ? "" : " inactive"}`}>
              <span
                className="avatar avatar-sm avatar-initials"
                style={{ backgroundColor: ROLE_COLORS[user.role] || "#6b7280", flexShrink: 0 }}
              >
                {user.fullName?.charAt(0).toUpperCase()}
              </span>
              <div className="user-card-info">
                <span className="user-card-name">{user.fullName}</span>
                <span className="user-card-login">@{user.username}</span>
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
    </section>
  );
}

function MenuPanel({ onClose, onPageChange, onOpenMonthly, panelRef, currentUser }) {
  const links = [
    ["weekly", "Ish jadvali", CalendarDays],
    ["studio", "Jamoa va bo'limlar", UsersRound],
    ["documents", "Hujjatlar", ShieldCheck],
    ["monthly", "Oylik grafik", Clock3],
    ["shooting", "Tasvir jadvali", FileText],
    ["reports", "Hisobotlar", ChartColumn],
    ["audit", "Audit jurnal", ShieldCheck],
    ...(isSuper(currentUser) ? [["users", "Foydalanuvchilar", UserCheck]] : []),
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
    </aside>
  );
}

function NotificationsPanel({ items, panelRef }) {
  return (
    <aside ref={panelRef} className="floating-panel notification-panel">
      <strong>Bildirishnomalar</strong>
      {items.map((item) => <p key={item}>{item}</p>)}
    </aside>
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

function BottomNav({ page, onPageChange }) {
  const items = [
    { id: "weekly", label: "Jadval", icon: CalendarDays },
    { id: "studio", label: "Jamoa", icon: UsersRound },
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
