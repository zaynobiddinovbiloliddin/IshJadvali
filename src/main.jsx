import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Edit3,
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
const DAY_TABS = ["Barcha kunlar", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const MONTH_NAMES = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const STATUS_OPTIONS = [
  { id: "working", code: "S", label: "Studiyada", metric: "working" },
  { id: "rest", code: "D", label: "Damda", metric: "rest" },
  { id: "trip", code: "K", label: "Komandirovka", metric: "away" },
  { id: "tjk", code: "T", label: "TJK ishda", metric: "working" },
  { id: "backup", code: "Z", label: "Zaxira", metric: "working" },
  { id: "vacation", code: "M", label: "Mehnat ta'tili", metric: "rest" },
  { id: "sick", code: "B", label: "Balnishniy", metric: "rest" }
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
  work: { label: "I", shift: "Ish kuni", hours: 9 },
  rest: { label: "D", shift: "Dam", hours: 0 },
  trip: { label: "K", shift: "Komandirovka", hours: 9 },
  tjk: { label: "T", shift: "TJK guruhi", hours: 9 },
  studio: { label: "S", shift: "Studiyada", hours: 9 },
  vacation: { label: "O", shift: "Otpusk", hours: 0 },
  sick: { label: "B", shift: "Balnishniy", hours: 0 }
};
const MONTHLY_STATUS_SEQUENCE = ["work", "studio", "trip", "tjk", "rest", "vacation", "sick"];
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
  },
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
  employees: []
};

async function api(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options
  });

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

function App() {
  const [page, setPage] = useState("weekly");
  const [weekStart, setWeekStart] = useState("2026-01-29");
  const [activeDay, setActiveDay] = useState("Barcha kunlar");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAllOverview, setShowAllOverview] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => window.localStorage.getItem("theme") || "light");
  const [currentUser, setCurrentUser] = useState(() => readStoredJson("currentUser", null));
  const [navDirection, setNavDirection] = useState("next");
  const [toasts, setToasts] = useState([]);
  const hasLoadedDashboard = useRef(false);

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3000);
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
  }, [loadDashboard]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  function handleAuth(user) {
    const nextUser = {
      name: user.name.trim() || "Administrator",
      email: user.email.trim() || "admin@uz24.local",
      role: "Jadval administratori"
    };
    window.localStorage.setItem("currentUser", JSON.stringify(nextUser));
    setCurrentUser(nextUser);
    notify("Tizimga muvaffaqiyatli kirdingiz");
  }

  function handleLogout() {
    window.localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setPage("weekly");
    notify("Tizimdan chiqildi");
  }

  async function createSchedule() {
    setGenerating(true);
    setError("");

    try {
      const nextDashboard = await api("/api/schedules/generate", {
        method: "POST",
        body: JSON.stringify({ weekStart })
      });
      setDashboard(nextDashboard);
      setActiveDay("Barcha kunlar");
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

  async function addStudioSchedule(payload) {
    setGenerating(true);
    setError("");

    try {
      setDashboard(await api(`/api/schedules/${weekStart}/groups`, {
        method: "POST",
        body: JSON.stringify(payload)
      }));
      setActiveDay("Barcha kunlar");
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
    setActiveDay("Barcha kunlar");
    setShowAllOverview(false);
  }

  const title = useMemo(() => {
    if (page === "studio") return "Studiyo jadvali";
    if (page === "documents") return "Hujjatlar";
    if (page === "monthly") return "Oylik grafik";
    if (page === "shooting") return "Tasvir jadvali";
    if (page === "reports") return "Hisobotlar";
    if (page === "profile") return "Profil";
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

  return (
    <div className="app-shell">
      {generating && <LoadingScreen />}
      <header className="topbar">
        <button className="icon-button" type="button" aria-label="Menyu" onClick={() => setMenuOpen((value) => !value)}>
          <Menu size={23} />
        </button>
        <div className="topbar-title">
          {page === "weekly" && (
            <span className="title-icon">
              <CalendarDays size={17} />
            </span>
          )}
          <h1>{title}</h1>
        </div>
        <button className="icon-button" type="button" aria-label="Bildirishnomalar" onClick={() => setNotificationsOpen((value) => !value)}>
          <Bell size={20} fill="currentColor" />
        </button>
      </header>

      {menuOpen && <MenuPanel onClose={() => setMenuOpen(false)} onPageChange={setPage} />}
      {notificationsOpen && <NotificationsPanel items={dashboard.notifications} />}

      <main className="content">
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <SkeletonPage />
        ) : (
          <>
            {page === "weekly" && (
              <WeeklyPage
                activeDay={activeDay}
                dashboard={dashboard}
                onCreate={createSchedule}
                onDeleteSchedule={deleteSchedule}
                onDayChange={setActiveDay}
                onMoveWeek={moveWeek}
                navDirection={navDirection}
                onStatusChange={updateStatus}
              />
            )}
            {page === "studio" && (
              <StudioPage
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
            {page === "monthly" && <MonthlyPage dashboard={dashboard} weekStart={weekStart} />}
            {page === "documents" && <DocumentsPage employees={dashboard.employees} onNotify={notify} onSaveEmployee={saveEmployee} />}
            {page === "shooting" && <ShootingPage onNotify={notify} />}
            {page === "reports" && <ReportsPage dashboard={dashboard} />}
            {page === "profile" && (
              <ProfilePage
                currentUser={currentUser}
                dashboard={dashboard}
                notificationsEnabled={notificationsOpen}
                theme={theme}
                onLogout={handleLogout}
                onRefresh={loadDashboard}
                onThemeChange={setTheme}
              />
            )}
          </>
        )}
      </main>

      <BottomNav page={page} onPageChange={setPage} />
      <ToastViewport items={toasts} />
    </div>
  );
}

function AuthPage({ onAuth, onNotify, theme, onThemeChange }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const formRef = useRef(null);

  function submit(event) {
    event.preventDefault();
    const email = form.email.trim();
    const password = form.password.trim();
    const name = form.name.trim();

    if (mode === "register" && name.length < 3) {
      setFormError("Ism familiyani kiriting.");
      onNotify("Ism familiyani kiriting.", "error");
      formRef.current?.querySelector("[name='auth-name']")?.focus();
      return;
    }

    if (!email || !email.includes("@")) {
      setFormError("Email manzilni to'g'ri kiriting.");
      onNotify("Email manzilni to'g'ri kiriting.", "error");
      formRef.current?.querySelector("[name='auth-email']")?.focus();
      return;
    }

    if (password.length < 6) {
      setFormError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      onNotify("Parol kamida 6 ta belgidan iborat bo'lishi kerak.", "error");
      formRef.current?.querySelector("[name='auth-password']")?.focus();
      return;
    }

    setFormError("");
    onAuth(form);
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <span><ShieldCheck size={24} /></span>
          <div>
            <strong>O'zbekiston 24</strong>
            <p>Tasvirga olish jadvali boshqaruvi</p>
          </div>
        </div>
        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => {
            setMode("login");
            setFormError("");
          }}>Login</button>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => {
            setMode("register");
            setFormError("");
          }}>Register</button>
        </div>
        <form ref={formRef} className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Ism familiya
              <input name="auth-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Administrator" />
            </label>
          )}
          <label>
            Email
            <input name="auth-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@uz24.local" />
          </label>
          <label>
            Parol
            <input name="auth-password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Kamida 6 belgi" />
          </label>
          {formError && <p className="auth-error">{formError}</p>}
          <button type="submit">
            <LogIn size={17} />
            {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
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

      {addOpen && (
        <div className="modal-backdrop" role="presentation">
          <form ref={addFormRef} className="schedule-modal" onSubmit={addRow}>
            <div className="modal-head">
              <strong>Yangi jadval qo'shish</strong>
              <button type="button" onClick={() => setAddOpen(false)}>×</button>
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
      )}
    </section>
  );
}

function MonthlyPage({ dashboard, weekStart }) {
  const monthInfo = useMemo(() => {
    const base = new Date(`${weekStart}T00:00:00`);
    const year = base.getFullYear();
    const month = base.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return {
      title: `${MONTH_NAMES[month]} ${year}`,
      days: Array.from({ length: totalDays }, (_, index) => index + 1)
    };
  }, [weekStart]);

  const operators = useMemo(() => {
    const existing = dashboard.employees.map((employee) => employee.name);
    const names = [...existing, ...OPERATOR_NAMES].filter((name, index, list) => list.indexOf(name) === index);
    return names.slice(0, 48).map((name, index) => ({ id: index + 1, name }));
  }, [dashboard.employees]);

  const initialMatrix = useMemo(() => {
    const matrix = {};
    operators.forEach((operator) => {
      matrix[operator.id] = monthInfo.days.map((day) => {
        if ((operator.id + day) % 7 === 0) return "rest";
        if ((operator.id * 7 + day) % 29 === 0) return "vacation";
        if ((operator.id * 5 + day) % 23 === 0) return "sick";
        if ((operator.id * 3 + day) % 17 === 0) return "trip";
        if ((operator.id * 2 + day) % 13 === 0) return "tjk";
        if ((operator.id * 3 + day) % 11 === 0) return "studio";
        return "work";
      });
    });
    return matrix;
  }, [monthInfo.days, operators]);

  const [matrix, setMatrix] = useState(initialMatrix);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    setMatrix(initialMatrix);
    setSelectedCell(null);
  }, [initialMatrix]);

  const totals = useMemo(() => {
    const values = Object.values(matrix).flat();
    return {
      work: values.filter((value) => value === "work").length,
      rest: values.filter((value) => value === "rest").length,
      trip: values.filter((value) => value === "trip").length,
      tjk: values.filter((value) => value === "tjk").length,
      studio: values.filter((value) => value === "studio").length,
      vacation: values.filter((value) => value === "vacation").length,
      sick: values.filter((value) => value === "sick").length,
      hours: values.reduce((sum, value) => sum + (MONTHLY_STATUS_OPTIONS[value]?.hours || 0), 0)
    };
  }, [matrix]);

  function getShift(operatorId, day, status) {
    if (status !== "work") {
      return MONTHLY_STATUS_OPTIONS[status].shift;
    }
    return SHIFT_LABELS[(operatorId + day) % 3];
  }

  function toggleCell(operator, dayIndex) {
    const current = matrix[operator.id]?.[dayIndex] || "work";
    const currentIndex = MONTHLY_STATUS_SEQUENCE.indexOf(current);
    const next = MONTHLY_STATUS_SEQUENCE[(currentIndex + 1) % MONTHLY_STATUS_SEQUENCE.length];
    const day = monthInfo.days[dayIndex];

    setMatrix((currentMatrix) => ({
      ...currentMatrix,
      [operator.id]: currentMatrix[operator.id].map((value, index) => (index === dayIndex ? next : value))
    }));
    setSelectedCell({
      operator: operator.name,
      day,
      status: next,
      shift: getShift(operator.id, day, next)
    });
  }

  return (
    <section className="monthly-page">
      <div className="monthly-head">
        <div>
          <h2>{monthInfo.title}</h2>
          <p>{operators.length} operator uchun oylik ish grafigi</p>
        </div>
        <div className="monthly-counts">
          <span><b>{totals.work}</b> ish</span>
          <span><b>{totals.trip}</b> K</span>
          <span><b>{totals.tjk}</b> TJK</span>
          <span><b>{totals.studio}</b> studiya</span>
          <span><b>{totals.rest}</b> dam</span>
          <span><b>{totals.vacation}</b> otpusk</span>
          <span><b>{totals.sick}</b> baln.</span>
          <span><b>{totals.hours}</b> soat</span>
        </div>
      </div>

      <div className="monthly-table-wrap" role="region" aria-label="Oylik operatorlar grafigi">
        <div className="monthly-table" style={{ gridTemplateColumns: `132px repeat(${monthInfo.days.length}, 34px) 48px 48px 48px 48px 48px 48px 48px 72px` }}>
          <div className="month-sticky month-header">Operator</div>
          {monthInfo.days.map((day) => <div className="month-header day" key={day}>{day}</div>)}
          <div className="month-header summary">I</div>
          <div className="month-header summary">K</div>
          <div className="month-header summary">T</div>
          <div className="month-header summary">S</div>
          <div className="month-header summary">Dam</div>
          <div className="month-header summary">O</div>
          <div className="month-header summary">B</div>
          <div className="month-header summary">Soat</div>

          {operators.map((operator) => {
            const days = matrix[operator.id] || [];
            const workCount = days.filter((value) => value === "work").length;
            const restCount = days.filter((value) => value === "rest").length;
            const tripCount = days.filter((value) => value === "trip").length;
            const tjkCount = days.filter((value) => value === "tjk").length;
            const studioCount = days.filter((value) => value === "studio").length;
            const vacationCount = days.filter((value) => value === "vacation").length;
            const sickCount = days.filter((value) => value === "sick").length;
            const hourCount = days.reduce((sum, value) => sum + (MONTHLY_STATUS_OPTIONS[value]?.hours || 0), 0);

            return (
              <React.Fragment key={operator.id}>
                <div className="month-sticky operator-name"><b>{operator.id}</b>{operator.name}</div>
                {days.map((value, index) => (
                  <button
                    className={`month-cell ${value}`}
                    type="button"
                    key={`${operator.id}-${index}`}
                    title={`${operator.name}, ${monthInfo.days[index]}-${MONTH_NAMES[new Date(`${weekStart}T00:00:00`).getMonth()]}`}
                    onClick={() => toggleCell(operator, index)}
                  >
                    {MONTHLY_STATUS_OPTIONS[value]?.label || "I"}
                  </button>
                ))}
                <div className="month-total work">{workCount}</div>
                <div className="month-total trip">{tripCount}</div>
                <div className="month-total tjk">{tjkCount}</div>
                <div className="month-total studio">{studioCount}</div>
                <div className="month-total rest">{restCount}</div>
                <div className="month-total vacation">{vacationCount}</div>
                <div className="month-total sick">{sickCount}</div>
                <div className="month-total hours">{hourCount}</div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="time-panel">
        <div className="time-panel-icon"><Clock3 size={18} /></div>
        <div>
          <strong>Vaqt belgilari</strong>
          <p>
            {selectedCell
              ? `${selectedCell.operator}: ${selectedCell.day}-kun, ${selectedCell.shift}, ${MONTHLY_STATUS_OPTIONS[selectedCell.status]?.hours || 0} soat`
              : "Katakni bosing, shu operatorning kunlik vaqti shu yerda chiqadi."}
          </p>
        </div>
      </div>

      <section className="legend-card compact">
        <LegendItem tone="work" label="Yashil katak - ishlagan kun" />
        <LegendItem tone="trip" label="Sariq katak - komandirovka" />
        <LegendItem tone="rest" label="Qizil katak - dam kuni" />
        <LegendItem tone="tjk" label="Ko'k katak - TJK guruhi" />
        <LegendItem tone="studio" label="To'q yashil katak - studiyada" />
        <LegendItem tone="vacation" label="Kulrang katak - otpusk" />
        <LegendItem tone="sick" label="Binafsha katak - balnishniy" />
      </section>
    </section>
  );
}

function WeeklyPage({ activeDay, dashboard, navDirection, onCreate, onDeleteSchedule, onDayChange, onMoveWeek, onStatusChange }) {
  const [openMetric, setOpenMetric] = useState("");
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const [selectedPerson, setSelectedPerson] = useState(null);
  const filteredGroups = useMemo(() => {
    if (activeDay === "Barcha kunlar") return dashboard.groups;
    return dashboard.groups.filter((group) => group.day === activeDay);
  }, [activeDay, dashboard.groups]);
  const visiblePeople = useMemo(() => filteredGroups.flatMap((group) => group.people.map((person) => ({ ...person, groupTitle: group.title, groupMeta: group.meta }))), [filteredGroups]);
  const dayMetrics = useMemo(() => {
    const working = visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "working").length;
    const rest = visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "rest").length;
    return { working, rest, total: dashboard.metrics.total };
  }, [dashboard.metrics.total, visiblePeople]);
  const metricLists = useMemo(() => ({
    working: visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "working"),
    rest: visiblePeople.filter((person) => STATUS_META[person.statusType]?.metric === "rest"),
    total: dashboard.employees
  }), [dashboard.employees, visiblePeople]);

  useEffect(() => {
    setOpenMetric("");
    setOpenGroups(new Set());
  }, [activeDay, dashboard.week.start]);

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
        <h2>Haftalik jadval</h2>
        <p>Hafta kuni {dashboard.week.startLabel}</p>
      </section>

      <div className="week-nav">
        <button className={navDirection === "prev" ? "nav-active" : ""} type="button" onClick={() => onMoveWeek(-7)}>
          <ChevronLeft size={19} />
          Oldingi
        </button>
        <button type="button" className={navDirection === "next" ? "nav-active" : ""} onClick={() => onMoveWeek(7)}>
          Keyingi
          <ChevronRight size={19} />
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
          onClose={() => setOpenMetric("")}
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
            dashboard={dashboard}
            group={group}
            open={openGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
            onPersonOpen={setSelectedPerson}
            onStatusChange={onStatusChange}
          />
        )) : <EmptyCard text="Bu kunga jadval kiritilmagan" />}
      </section>

      <button className="create-button" type="button" onClick={onCreate}>
        <RefreshCcw size={17} />
        Yangi jadval yaratish
      </button>
      {dashboard.week.saved && (
        <button className="danger-button" type="button" onClick={onDeleteSchedule}>
          <Trash2 size={17} />
          Joriy jadvalni o'chirish
        </button>
      )}

      {selectedPerson && (
        <PersonProfileSheet
          dashboard={dashboard}
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}

function StudioPage({ dashboard, showAllOverview, navDirection, onAddSchedule, onCreate, onDeleteEmployee, onNotify, onSaveEmployee, onMoveWeek, onScanAttendance, onToggleOverview }) {
  const overviewRows = showAllOverview ? dashboard.overviewRows : dashboard.overviewRows.slice(0, 5);
  const scheduleBlank = {
    day: "Dushanba",
    meta: "3 Studiya",
    time: "09:00 - 18:00",
    statusType: "working",
    tone: "purple",
    employeeIds: ["", "", ""]
  };
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState(scheduleBlank);

  async function submitSchedule(event) {
    event.preventDefault();
    if (!scheduleDraft.meta.trim()) {
      onNotify("Studiya yoki joy nomini kiriting.", "error");
      event.currentTarget.querySelector("[name='schedule-meta']")?.focus();
      return;
    }
    if (!scheduleDraft.time.trim()) {
      onNotify("Ish vaqtini kiriting.", "error");
      event.currentTarget.querySelector("[name='schedule-time']")?.focus();
      return;
    }
    if (!scheduleDraft.employeeIds.some(Boolean)) {
      onNotify("Kamida bitta xodim tanlang.", "error");
      event.currentTarget.querySelector("[name='schedule-employee']")?.focus();
      return;
    }
    const saved = await onAddSchedule({
      ...scheduleDraft,
      employeeIds: scheduleDraft.employeeIds.filter(Boolean)
    });
    if (!saved) return;
    setScheduleDraft(scheduleBlank);
    setScheduleModalOpen(false);
  }

  return (
    <>
      <section className="studio-panel">
        <div className="studio-period">
          <button className={`icon-button dark ${navDirection === "prev" ? "nav-active" : ""}`} type="button" aria-label="Oldingi hafta" onClick={() => onMoveWeek(-7)}>
            <ChevronLeft size={23} />
          </button>
          <div>
            <h2>{dashboard.week.title}</h2>
            <p>{dashboard.week.range}</p>
          </div>
          <button className={`icon-button dark ${navDirection === "next" ? "nav-active" : ""}`} type="button" aria-label="Keyingi hafta" onClick={() => onMoveWeek(7)}>
            <ChevronRight size={23} />
          </button>
        </div>
        <button className="create-button flat" type="button" onClick={() => setScheduleModalOpen(true)}>
          <Plus size={17} />
          Jadval yaratish
        </button>
      </section>

      <section className="metric-grid studio">
        <MetricCard icon={<UsersRound size={20} />} value={dashboard.metrics.total} label="Xodimlar" tone="purple" />
        <MetricCard icon={<BriefcaseBusiness size={19} />} value={dashboard.metrics.workingToday} label="Ishlayotgan" tone="green" />
        <MetricCard icon={<Coffee size={19} />} value={dashboard.metrics.restToday} label="Bugun damda" tone="orange" />
      </section>

      <AttendancePanel attendance={dashboard.attendance} employees={dashboard.employees} onScan={onScanAttendance} />

      <EmployeeManager employees={dashboard.employees} onDelete={onDeleteEmployee} onNotify={onNotify} onSave={onSaveEmployee} />

      <div className="section-head">
        <h2>Bugungi jadval</h2>
        <span>{dashboard.week.todayLabel}</span>
      </div>
      <section className="today-card">
        {dashboard.studioToday.map((person) => (
          <CompactStaffCard key={person.id} person={person} />
        ))}
      </section>

      <div className="section-head overview">
        <h2>Haftalik umumiy ko'rinish</h2>
        <button type="button" onClick={onToggleOverview}>{showAllOverview ? "Yopish" : "Hammasini ko'rish"}</button>
      </div>
      <WeeklyOverview rows={overviewRows} days={dashboard.week.shortDays} />

      <section className="legend-card">
        <h3>Belgilar izohi</h3>
        <LegendItem tone="work" label="Ish smenasi" />
        <LegendItem tone="rest" label="Dam olish kuni" />
        <LegendItem tone="empty" label="Jadvalga kiritilmagan" />
      </section>

      <section className="algorithm-card">
        <div className="info-icon">
          <Info size={18} />
        </div>
        <div>
          <strong>Navbatma-navbat algoritmi</strong>
          <p>So'nggi yaratish: {dashboard.week.generatedAt}</p>
        </div>
      </section>

      {scheduleModalOpen && (
        <div className="modal-backdrop studio-modal-backdrop" role="presentation">
          <form className="schedule-modal studio-schedule-modal" onSubmit={submitSchedule}>
            <div className="modal-head">
              <strong>Studio jadvali yaratish</strong>
              <button type="button" onClick={() => setScheduleModalOpen(false)}>×</button>
            </div>
            <div className="modal-grid two">
              <label>
                Kun
                <select value={scheduleDraft.day} onChange={(event) => setScheduleDraft({ ...scheduleDraft, day: event.target.value })}>
                  {DAY_TABS.filter((day) => day !== "Barcha kunlar").map((day) => <option key={day} value={day}>{day}</option>)}
                  <option value="Yakshanba">Yakshanba</option>
                </select>
              </label>
              <label>
                Rang
                <select value={scheduleDraft.tone} onChange={(event) => setScheduleDraft({ ...scheduleDraft, tone: event.target.value })}>
                  <option value="purple">Binafsha</option>
                  <option value="blue">Ko'k</option>
                </select>
              </label>
            </div>
            <label>
              Studiya / joy
              <input name="schedule-meta" value={scheduleDraft.meta} onChange={(event) => setScheduleDraft({ ...scheduleDraft, meta: event.target.value })} placeholder="3 Studiya" />
            </label>
            <div className="modal-grid two">
              <label>
                Ish vaqti
                <input name="schedule-time" value={scheduleDraft.time} onChange={(event) => setScheduleDraft({ ...scheduleDraft, time: event.target.value })} placeholder="09:00 - 18:00" />
              </label>
              <label>
                Status
                <select value={scheduleDraft.statusType} onChange={(event) => setScheduleDraft({ ...scheduleDraft, statusType: event.target.value })}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.id} value={status.id}>{status.code} - {status.label}</option>
                  ))}
                </select>
              </label>
            </div>
            {[0, 1, 2].map((index) => (
              <label key={index}>
                Xodim {index + 1}
                <select name="schedule-employee" value={scheduleDraft.employeeIds[index]} onChange={(event) => {
                  const employeeIds = [...scheduleDraft.employeeIds];
                  employeeIds[index] = event.target.value;
                  setScheduleDraft({ ...scheduleDraft, employeeIds });
                }}>
                  <option value="">Tanlang</option>
                  {dashboard.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name} - {employee.role}</option>
                  ))}
                </select>
              </label>
            ))}
            <button type="submit">
              <Save size={17} />
              Jadvalga qo'shish
            </button>
            <button className="secondary-modal-button" type="button" onClick={onCreate}>
              <RefreshCcw size={17} />
              Avtomatik jadval yaratish
            </button>
          </form>
        </div>
      )}
    </>
  );
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

function StudioGroup({ dashboard, group, open = true, onToggle, onPersonOpen, onStatusChange }) {
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
            <StaffRow key={person.id} dashboard={dashboard} groupId={group.id} person={person} onPersonOpen={onPersonOpen} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </article>
  );
}

function StaffRow({ dashboard, groupId, person, onPersonOpen, onStatusChange }) {
  const department = departmentMeta(person.department);
  const phone = cleanPhone(person.phone);
  const telegram = telegramHref(person.telegram);
  const personStats = getPersonStats(dashboard, person);

  return (
    <article className={`staff-row department-${department.id}`}>
      <Avatar person={person} />
      <button className="staff-main" type="button" onClick={() => onPersonOpen?.(person)}>
        <strong>{person.name}</strong>
        <span>{department.label} • {personStats.shoots} syomka • KPI {personStats.kpi}%</span>
      </button>
      <ContactActions phone={phone} telegram={telegram} />
      {onStatusChange ? (
        <select className={`status-select ${person.statusType}`} value={person.statusType} onClick={(event) => event.stopPropagation()} onChange={(event) => onStatusChange(groupId, person.id, event.target.value)} aria-label={`${person.name} statusi`}>
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

function getPersonStats(dashboard, person) {
  const assignments = dashboard.groups.flatMap((group) => group.people.map((item) => ({ ...item, groupTitle: group.title, groupMeta: group.meta, day: group.day }))).filter((item) => String(item.id) === String(person.id));
  const working = assignments.filter((item) => STATUS_META[item.statusType]?.metric === "working").length;
  const rest = assignments.filter((item) => STATUS_META[item.statusType]?.metric === "rest").length;
  const away = assignments.filter((item) => STATUS_META[item.statusType]?.metric === "away").length;
  const portfolioCount = person.portfolio?.filter((item) => item.url)?.length || 0;
  const kpi = Math.max(0, Math.min(100, 55 + working * 7 + away * 4 + portfolioCount * 3 - rest * 5));
  return { assignments, shoots: assignments.length, working, rest, away, portfolioCount, kpi };
}

function PersonProfileSheet({ dashboard, person, onClose }) {
  const department = departmentMeta(person.department);
  const phone = cleanPhone(person.phone);
  const telegram = telegramHref(person.telegram);
  const stats = getPersonStats(dashboard, person);

  return (
    <div className="person-sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="person-sheet" role="dialog" aria-modal="true" aria-label={`${person.name} kartasi`} onClick={(event) => event.stopPropagation()}>
        <div className="people-list-grip" />
        <div className="person-sheet-head">
          <Avatar person={person} />
          <div>
            <strong>{person.name}</strong>
            <span>{department.label}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Kartani yopish">×</button>
        </div>

        <div className="person-kpi">
          <div>
            <span>Samaradorlik</span>
            <strong>{stats.kpi}%</strong>
          </div>
          <i><b style={{ width: `${stats.kpi}%` }} /></i>
        </div>

        <div className="person-stats-grid">
          <div><strong>{stats.shoots}</strong><span>Ushbu oy syomka</span></div>
          <div><strong>{stats.working}</strong><span>Ishda</span></div>
          <div><strong>{stats.rest}</strong><span>Dam/ta'til</span></div>
        </div>

        <div className="person-contact-grid">
          <a className={!phone ? "disabled" : ""} href={phone ? `tel:${phone}` : undefined}>
            <Phone size={16} />
            <span>{person.phone || "Telefon yo'q"}</span>
          </a>
          <a className={!telegram ? "disabled" : ""} href={telegram || undefined} target="_blank" rel="noreferrer">
            <Send size={16} />
            <span>{person.telegram || "Telegram yo'q"}</span>
          </a>
        </div>

        <div className="person-assignments">
          <strong>Yaqin syomkalar</strong>
          {stats.assignments.slice(0, 4).map((item) => (
            <article key={`${item.groupTitle}-${item.id}-${item.statusType}`}>
              <div>
                <span>{item.groupTitle}</span>
                <em>{item.groupMeta}</em>
              </div>
              <b>{STATUS_META[item.statusType]?.code || "I"}</b>
            </article>
          ))}
          {!stats.assignments.length && <p>Jadvalda biriktirilgan syomka yo'q.</p>}
        </div>
      </section>
    </div>
  );
}

function PeopleListPanel({ title, people, onClose }) {
  return (
    <div className="people-sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="people-list-panel" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="people-list-grip" />
        <div className="people-list-head">
          <div>
            <strong>{title}</strong>
            <span>{people.length} ta xodim</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Ro'yxatni yopish">×</button>
        </div>
        <div className="people-list-scroll">
          {people.length ? people.map((person) => {
            const status = STATUS_META[person.statusType];
            return (
              <article className={`people-list-row ${person.statusType || "total"}`} key={`${person.groupTitle || "employee"}-${person.id}-${person.statusType || "total"}`}>
                <Avatar person={person} />
                <div>
                  <strong>{person.name}</strong>
                  <span>{person.groupTitle ? `${person.groupTitle} • ${person.groupMeta}` : departmentMeta(person.department).label}</span>
                </div>
                <em>{status ? `${status.code} - ${status.label}` : "Ro'yxatda"}</em>
              </article>
            );
          }) : <p className="people-list-empty">Bu bo'limda xodim yo'q</p>}
        </div>
      </section>
    </div>
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
      {modalOpen && (
        <div className="modal-backdrop employee-modal-backdrop" role="presentation">
          <form ref={formRef} className="schedule-modal employee-modal" onSubmit={submit}>
            <div className="modal-head">
              <strong>{editingId ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}</strong>
              <button type="button" onClick={() => setModalOpen(false)}>×</button>
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
      )}
    </section>
  );
}

function DocumentsPage({ employees, onNotify, onSaveEmployee }) {
  const [selectedId, setSelectedId] = useState(employees[0]?.id || "");
  const selectedEmployee = employees.find((employee) => String(employee.id) === String(selectedId)) || employees[0];
  const [draft, setDraft] = useState(selectedEmployee || null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const nextEmployee = employees.find((employee) => String(employee.id) === String(selectedId)) || employees[0] || null;
    setDraft(nextEmployee);
    if (nextEmployee && String(nextEmployee.id) !== String(selectedId)) setSelectedId(nextEmployee.id);
  }, [employees, selectedId]);

  function updatePortfolio(index, field, value) {
    const portfolio = [...(draft.portfolio || [])];
    portfolio[index] = { ...(portfolio[index] || {}), [field]: value };
    setDraft({ ...draft, portfolio });
  }

  function addPortfolioItem() {
    setDraft({
      ...draft,
      portfolio: [
        ...(draft.portfolio || []),
        { title: "", url: "", date: new Date().toISOString().slice(0, 10) }
      ]
    });
    onNotify("Portfolio qatori qo'shildi. Syomka nomi va linkini to'ldiring.");
  }

  function removePortfolioItem(index) {
    setDraft({
      ...draft,
      portfolio: (draft.portfolio || []).filter((_, itemIndex) => itemIndex !== index)
    });
  }

  async function submit(event) {
    event.preventDefault();
    const requiredFields = [
      ["documents-name", draft.name, "Ism familiyani kiriting."],
      ["documents-role", draft.role, "Lavozimini kiriting."]
    ];
    const invalid = requiredFields.find(([, value]) => !String(value || "").trim());
    if (invalid) {
      onNotify(invalid[2], "error");
      formRef.current?.querySelector(`[name='${invalid[0]}']`)?.focus();
      return;
    }

    const invalidPortfolio = (draft.portfolio || []).findIndex((item) => !String(item.title || "").trim() || !String(item.url || "").trim());
    if (invalidPortfolio !== -1) {
      onNotify("Portfolio uchun syomka nomi va linkini to'liq kiriting.", "error");
      const item = (draft.portfolio || [])[invalidPortfolio];
      const field = !String(item?.title || "").trim() ? "title" : "url";
      formRef.current?.querySelector(`[name='portfolio-${field}-${invalidPortfolio}']`)?.focus();
      return;
    }

    setSaving(true);
    const saved = await onSaveEmployee(draft);
    setSaving(false);
    if (!saved) return;
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
        <form ref={formRef} className="documents-form" onSubmit={submit}>
          <div className="document-profile">
            <Avatar person={draft} />
            <div>
              <strong>{draft.name}</strong>
              <span>{draft.role}</span>
            </div>
          </div>
          <label>
            Ism familiya
            <input name="documents-name" value={draft.name || ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Abduqodirxo'jayev Izzat" />
          </label>
          <label>
            Lavozimi
            <input name="documents-role" value={draft.role || ""} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Tasvir yozish operatori" />
          </label>
          <div className="documents-field-grid">
            <label>
              Bo'lim
              <select value={draft.department || "operator"} onChange={(event) => setDraft({ ...draft, department: event.target.value })}>
                {DEPARTMENTS.map((department) => (
                  <option key={department.id} value={department.id}>{department.label}</option>
                ))}
              </select>
            </label>
            <label>
              Telegram
              <input name="documents-telegram" value={draft.telegram || ""} onChange={(event) => setDraft({ ...draft, telegram: event.target.value })} placeholder="@username" />
            </label>
          </div>
          <section className="portfolio-editor">
            <div className="section-head">
              <h2>Portfolio</h2>
              <button type="button" onClick={addPortfolioItem}>
                <Plus size={15} />
                Link
              </button>
            </div>
            {(draft.portfolio || []).map((item, index) => (
              <article className="portfolio-row" key={`${index}-${item.url}`}>
                <input name={`portfolio-title-${index}`} value={item.title || ""} onChange={(event) => updatePortfolio(index, "title", event.target.value)} placeholder="Syomka nomi" />
                <input name={`portfolio-url-${index}`} value={item.url || ""} onChange={(event) => updatePortfolio(index, "url", event.target.value)} placeholder="Video yoki efir linki" />
                <input type="date" value={item.date || ""} onChange={(event) => updatePortfolio(index, "date", event.target.value)} />
                <button type="button" aria-label="Portfolio linkni o'chirish" onClick={() => removePortfolioItem(index)}>
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
            {!(draft.portfolio || []).length && <p className="portfolio-empty">Efirga ketgan syomka linklarini shu yerda yig'ib borasiz.</p>}
          </section>
          <button className="documents-save-button" type="submit" disabled={saving}>
            <Save size={17} />
            {saving ? "Saqlanmoqda..." : "Ma'lumotlarni saqlash"}
          </button>
        </form>
      </section>

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
      <em>{person.status}</em>
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
              {value === "work" ? <Check size={16} /> : ["rest", "vacation", "sick"].includes(value) ? "x" : value === "tjk" ? "T" : null}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}

function ReportsPage({ dashboard }) {
  const [openReport, setOpenReport] = useState("");
  const [activeReportTab, setActiveReportTab] = useState("summary");
  const allPeople = useMemo(() => dashboard.groups.flatMap((group) => group.people.map((person) => ({ ...person, groupTitle: group.title, groupMeta: group.meta, day: group.day }))), [dashboard.groups]);
  const todayPeople = useMemo(() => allPeople.filter((person) => person.day === "Dushanba"), [allPeople]);
  const statusRows = useMemo(() => STATUS_OPTIONS.map((status) => ({
    ...status,
    people: allPeople.filter((person) => person.statusType === status.id)
  })).filter((status) => status.people.length || ["working", "rest", "trip", "vacation", "sick"].includes(status.id)), [allPeople]);
  const dayRows = useMemo(() => DAY_TABS.filter((day) => day !== "Barcha kunlar").map((day) => {
    const people = allPeople.filter((person) => person.day === day);
    return {
      id: day,
      label: day,
      people,
      working: people.filter((person) => STATUS_META[person.statusType]?.metric === "working").length,
      rest: people.filter((person) => STATUS_META[person.statusType]?.metric === "rest").length,
      away: people.filter((person) => STATUS_META[person.statusType]?.metric === "away").length
    };
  }), [allPeople]);
  const studioRows = useMemo(() => dashboard.groups.map((group) => {
    const people = group.people.map((person) => ({ ...person, groupTitle: group.title, groupMeta: group.meta, day: group.day }));
    return {
      id: group.id,
      label: `${group.day} • ${group.meta}`,
      people,
      working: people.filter((person) => STATUS_META[person.statusType]?.metric === "working").length,
      rest: people.filter((person) => STATUS_META[person.statusType]?.metric === "rest").length
    };
  }), [dashboard.groups]);
  const reportLists = useMemo(() => {
    const lists = {
      today: todayPeople,
      working: allPeople.filter((person) => STATUS_META[person.statusType]?.metric === "working"),
      rest: allPeople.filter((person) => STATUS_META[person.statusType]?.metric === "rest"),
      away: allPeople.filter((person) => STATUS_META[person.statusType]?.metric === "away"),
      total: dashboard.employees
    };
    for (const status of statusRows) lists[`status-${status.id}`] = status.people;
    for (const day of dayRows) lists[`day-${day.id}`] = day.people;
    for (const studio of studioRows) lists[`studio-${studio.id}`] = studio.people;
    return lists;
  }, [allPeople, dashboard.employees, dayRows, statusRows, studioRows, todayPeople]);
  const reportTitle = useMemo(() => {
    if (openReport === "today") return "Bugungi smena";
    if (openReport === "working") return "Ishlayotganlar";
    if (openReport === "rest") return "Damda / ta'tilda";
    if (openReport === "away") return "Komandirovka";
    if (openReport === "total") return "Jami xodimlar";
    const status = statusRows.find((item) => openReport === `status-${item.id}`);
    if (status) return status.label;
    const day = dayRows.find((item) => openReport === `day-${item.id}`);
    if (day) return `${day.label} hisoboti`;
    const studio = studioRows.find((item) => openReport === `studio-${item.id}`);
    if (studio) return studio.label;
    return "Hisobot";
  }, [dayRows, openReport, statusRows, studioRows]);
  const workingRate = dashboard.metrics.total ? Math.round((dashboard.metrics.working / dashboard.metrics.total) * 100) : 0;
  const restRate = dashboard.metrics.total ? Math.round((dashboard.metrics.rest / dashboard.metrics.total) * 100) : 0;
  const tabContent = {
    summary: (
      <div className="report-list">
        {statusRows.map((status) => (
          <ReportDrillRow
            key={status.id}
            label={`${status.code} - ${status.label}`}
            value={status.people.length}
            hint={status.metric === "working" ? "ish faol" : status.metric === "rest" ? "dam/ta'til" : "safar"}
            onClick={() => setOpenReport(`status-${status.id}`)}
          />
        ))}
      </div>
    ),
    days: (
      <div className="report-list">
        {dayRows.map((day) => (
          <ReportDrillRow
            key={day.id}
            label={day.label}
            value={day.people.length}
            hint={`${day.working} ishda • ${day.rest} dam • ${day.away} safar`}
            onClick={() => setOpenReport(`day-${day.id}`)}
          />
        ))}
      </div>
    ),
    studios: (
      <div className="report-list">
        {studioRows.map((studio) => (
          <ReportDrillRow
            key={studio.id}
            label={studio.label}
            value={studio.people.length}
            hint={`${studio.working} ishda • ${studio.rest} dam`}
            onClick={() => setOpenReport(`studio-${studio.id}`)}
          />
        ))}
      </div>
    )
  };

  return (
    <section className="reports-page">
      <div className="section-head">
        <h2>Haftalik hisobot</h2>
        <span>{dashboard.week.range}</span>
      </div>
      <section className="report-hero">
        <div>
          <span>Hafta qamrovi</span>
          <strong>{workingRate}%</strong>
          <p>{dashboard.metrics.working} ta ishda, {dashboard.metrics.rest} ta damda yoki ta'tilda.</p>
        </div>
        <button type="button" onClick={() => setOpenReport("total")}>
          <UsersRound size={17} />
          Jami {dashboard.metrics.total}
        </button>
      </section>

      <section className="report-kpi-grid">
        <ReportKpi icon={<BriefcaseBusiness size={18} />} label="Ishda" value={dashboard.metrics.working} hint={`${workingRate}% qamrov`} onClick={() => setOpenReport("working")} />
        <ReportKpi icon={<Umbrella size={18} />} label="Dam/ta'til" value={dashboard.metrics.rest} hint={`${restRate}%`} onClick={() => setOpenReport("rest")} />
        <ReportKpi icon={<CalendarDays size={18} />} label="Bugungi smena" value={todayPeople.length} hint="Dushanba" onClick={() => setOpenReport("today")} />
        <ReportKpi icon={<ChartColumn size={18} />} label="Safar" value={dashboard.metrics.trip || 0} hint="komandirovka" onClick={() => setOpenReport("away")} />
      </section>

      <section className="report-tabs-card">
        <div className="report-tabs" role="tablist" aria-label="Hisobot turlari">
          <button className={activeReportTab === "summary" ? "active" : ""} type="button" onClick={() => setActiveReportTab("summary")}>Status</button>
          <button className={activeReportTab === "days" ? "active" : ""} type="button" onClick={() => setActiveReportTab("days")}>Kunlar</button>
          <button className={activeReportTab === "studios" ? "active" : ""} type="button" onClick={() => setActiveReportTab("studios")}>Studiya</button>
        </div>
        {tabContent[activeReportTab]}
      </section>

      <section className="report-ready-card">
        <div>
          <strong>Tayyor hisobotlar</strong>
          <span>Bitta bosishda ro'yxat ochiladi</span>
        </div>
        <div className="report-ready-actions">
          <button type="button" onClick={() => setOpenReport("working")}>Ishdagilar</button>
          <button type="button" onClick={() => setOpenReport("rest")}>Damdagilar</button>
          <button type="button" onClick={() => setOpenReport("today")}>Bugun</button>
        </div>
      </section>

      {openReport && (
        <PeopleListPanel
          title={reportTitle}
          people={reportLists[openReport] || []}
          onClose={() => setOpenReport("")}
        />
      )}
    </section>
  );
}

function ReportKpi({ icon, label, value, hint, onClick }) {
  return (
    <button className="report-kpi" type="button" onClick={onClick}>
      <span>{icon}</span>
      <strong>{value}</strong>
      <em>{label}</em>
      <small>{hint}</small>
    </button>
  );
}

function ReportDrillRow({ label, value, hint, onClick }) {
  return (
    <button className="report-drill-row" type="button" onClick={onClick}>
      <div>
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <em>{value}</em>
      <ChevronRight size={18} />
    </button>
  );
}

function ProfilePage({ currentUser, dashboard, theme, onLogout, onRefresh, onThemeChange }) {
  const [notify, setNotify] = useState(true);
  const operators = dashboard.employees.filter((employee) => employee.role.includes("Operator")).length;
  const tjkCount = dashboard.metrics.tjk || 0;

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <span className="profile-avatar large"><User size={38} /></span>
        <div>
          <strong>{currentUser.name}</strong>
          <p>{currentUser.role}</p>
          <em>{currentUser.email}</em>
        </div>
      </div>

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
          <strong>{tjkCount}</strong>
          <span>TJK</span>
        </article>
      </section>

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

      <button className="logout-button" type="button" onClick={onLogout}>
        <LogOut size={18} />
        Log out
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
        {tone === "work" ? <Check size={15} /> : tone === "rest" ? "x" : tone === "trip" ? "K" : tone === "tjk" ? "T" : tone === "studio" ? "S" : tone === "vacation" ? "O" : tone === "sick" ? "B" : null}
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

function Avatar({ person }) {
  return (
    <span className="avatar">
      {person.avatar ? <img src={person.avatar} alt={person.name} /> : <User size={20} />}
    </span>
  );
}

function EmptyCard({ text }) {
  return <div className="empty-card">{text}</div>;
}

function MenuPanel({ onClose, onPageChange }) {
  const links = [
    ["weekly", "Ish jadvali", CalendarDays],
    ["studio", "Jamoa va bo'limlar", UsersRound],
    ["documents", "Hujjatlar", ShieldCheck],
    ["monthly", "Oylik grafik", Clock3],
    ["shooting", "Tasvir jadvali", FileText],
    ["reports", "Hisobotlar", ChartColumn],
    ["profile", "Profil", User]
  ];

  return (
    <aside className="floating-panel menu-panel">
      <strong>Bo'limlar</strong>
      {links.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            onPageChange(id);
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

function NotificationsPanel({ items }) {
  return (
    <aside className="floating-panel notification-panel">
      <strong>Bildirishnomalar</strong>
      {items.map((item) => <p key={item}>{item}</p>)}
    </aside>
  );
}

function SkeletonPage() {
  return (
    <section className="skeleton-page">
      <span />
      <span />
      <span />
      <span />
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <strong>Yaratilmoqda...</strong>
    </div>
  );
}

function ToastViewport({ items }) {
  if (!items.length) return null;

  return (
    <section className="toast-stack" aria-live="polite" aria-label="Xabarlar">
      {items.map((item) => (
        <article className={`toast ${item.type || "success"}`} key={item.id}>
          <span>{item.type === "error" ? "!" : <Check size={14} />}</span>
          <p>{item.message}</p>
        </article>
      ))}
    </section>
  );
}

function BottomNav({ page, onPageChange }) {
  const items = [
    { id: "weekly", label: "Jadval", icon: CalendarDays },
    { id: "studio", label: "Jamoa", icon: UsersRound },
    { id: "documents", label: "Hujjat", icon: ShieldCheck },
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
