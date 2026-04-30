import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartColumn,
  Check,
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
  Plus,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  User,
  UserCheck,
  UsersRound,
  Umbrella
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const DAY_TABS = ["Barcha kunlar", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const MONTH_NAMES = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
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
  const hasLoadedDashboard = useRef(false);

  const loadDashboard = useCallback(async () => {
    if (!hasLoadedDashboard.current) setLoading(true);
    setError("");

    try {
      setDashboard(await api(`/api/dashboard?weekStart=${weekStart}`));
    } catch (loadError) {
      setError(loadError.message);
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
  }

  function handleLogout() {
    window.localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setPage("weekly");
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
    } catch (generateError) {
      setError(generateError.message);
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
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setGenerating(false);
    }
  }

  async function saveEmployee(employee) {
    setGenerating(true);
    setError("");

    try {
      if (employee.id) {
        await api(`/api/employees/${employee.id}`, { method: "PUT", body: JSON.stringify(employee) });
      } else {
        await api("/api/employees", { method: "POST", body: JSON.stringify(employee) });
      }
      await loadDashboard();
    } catch (saveError) {
      setError(saveError.message);
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
    } catch (deleteError) {
      setError(deleteError.message);
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
    } catch (statusError) {
      setError(statusError.message);
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
    } catch (scheduleError) {
      setError(scheduleError.message);
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
    if (page === "monthly") return "Oylik grafik";
    if (page === "shooting") return "Tasvir jadvali";
    if (page === "reports") return "Hisobotlar";
    if (page === "profile") return "Profil";
    return "Ish jadvali";
  }, [page]);

  if (!currentUser) {
    return <AuthPage onAuth={handleAuth} theme={theme} onThemeChange={setTheme} />;
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
                onMoveWeek={moveWeek}
                navDirection={navDirection}
                onToggleOverview={() => setShowAllOverview((value) => !value)}
              />
            )}
            {page === "monthly" && <MonthlyPage dashboard={dashboard} weekStart={weekStart} />}
            {page === "shooting" && <ShootingPage />}
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
    </div>
  );
}

function AuthPage({ onAuth, theme, onThemeChange }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "Administrator", email: "admin@uz24.local", password: "" });

  function submit(event) {
    event.preventDefault();
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
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>Register</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Ism familiya
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Administrator" />
            </label>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@uz24.local" />
          </label>
          <label>
            Parol
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Kamida 6 belgi" />
          </label>
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

function ShootingPage() {
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

  function updateRow(index, field, value) {
    setRows((currentRows) => currentRows.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  }

  function addRow(event) {
    event.preventDefault();
    setRows((currentRows) => [...currentRows, draftRow]);
    setDraftRow(blankRow);
    setAddOpen(false);
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
          <form className="schedule-modal" onSubmit={addRow}>
            <div className="modal-head">
              <strong>Yangi jadval qo'shish</strong>
              <button type="button" onClick={() => setAddOpen(false)}>×</button>
            </div>
            <label>
              Kamera raqami
              <input value={draftRow.camera} onChange={(event) => setDraftRow({ ...draftRow, camera: event.target.value })} placeholder="12 / +Avivest" />
            </label>
            <label>
              Chiqish vaqti
              <input value={draftRow.time} onChange={(event) => setDraftRow({ ...draftRow, time: event.target.value })} placeholder="09:00-18:00" />
            </label>
            <label>
              Operator va texnik xodim
              <textarea value={draftRow.operatorsText} onChange={(event) => setDraftRow({ ...draftRow, operatorsText: event.target.value })} placeholder="Operator F.I.Sh" />
            </label>
            <label>
              Tadbir joyi va mavzusi
              <textarea value={draftRow.topic} onChange={(event) => setDraftRow({ ...draftRow, topic: event.target.value })} placeholder="Tadbir haqida ma'lumot" />
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
        if ((operator.id * 2 + day) % 11 === 0) return "empty";
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
      rest: values.filter((value) => value === "rest").length
    };
  }, [matrix]);

  function getShift(operatorId, day, status) {
    if (status === "rest") return "Dam";
    if (status === "empty") return "Belgilanmagan";
    return SHIFT_LABELS[(operatorId + day) % 3];
  }

  function toggleCell(operator, dayIndex) {
    const current = matrix[operator.id]?.[dayIndex] || "empty";
    const next = current === "work" ? "rest" : current === "rest" ? "empty" : "work";
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
          <span><b>{totals.rest}</b> dam</span>
        </div>
      </div>

      <div className="monthly-table-wrap" role="region" aria-label="Oylik operatorlar grafigi">
        <div className="monthly-table" style={{ gridTemplateColumns: `132px repeat(${monthInfo.days.length}, 34px) 72px 72px` }}>
          <div className="month-sticky month-header">Operator</div>
          {monthInfo.days.map((day) => <div className="month-header day" key={day}>{day}</div>)}
          <div className="month-header summary">Ish</div>
          <div className="month-header summary">Dam</div>

          {operators.map((operator) => {
            const days = matrix[operator.id] || [];
            const workCount = days.filter((value) => value === "work").length;
            const restCount = days.filter((value) => value === "rest").length;

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
                    {value === "work" ? "K" : value === "rest" ? "D" : ""}
                  </button>
                ))}
                <div className="month-total work">{workCount}</div>
                <div className="month-total rest">{restCount}</div>
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
              ? `${selectedCell.operator}: ${selectedCell.day}-kun, ${selectedCell.shift}`
              : "Katakni bosing, shu operatorning kunlik vaqti shu yerda chiqadi."}
          </p>
        </div>
      </div>

      <section className="legend-card compact">
        <LegendItem tone="work" label="Ko'k katak - ishlagan kun" />
        <LegendItem tone="rest" label="Qizil katak - dam kuni" />
        <LegendItem tone="empty" label="Kulrang katak - belgilanmagan" />
      </section>
    </section>
  );
}

function WeeklyPage({ activeDay, dashboard, navDirection, onCreate, onDeleteSchedule, onDayChange, onMoveWeek, onStatusChange }) {
  const filteredGroups = useMemo(() => {
    if (activeDay === "Barcha kunlar") return dashboard.groups;
    return dashboard.groups.filter((group) => group.day === activeDay);
  }, [activeDay, dashboard.groups]);

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
        <MetricCard icon={<UserCheck size={18} />} value={dashboard.metrics.working} label="Ishlayotganlar" tone="green" />
        <MetricCard icon={<Umbrella size={18} />} value={dashboard.metrics.rest} label="Dam olish kuni" tone="blue" />
        <MetricCard icon={<UsersRound size={19} />} value={dashboard.metrics.total} label="Jami" tone="purple" />
      </section>

      <div className="day-tabs" aria-label="Kunlar">
        {DAY_TABS.map((day) => (
          <button className={activeDay === day ? "active" : ""} type="button" key={day} onClick={() => onDayChange(day)}>
            {day}
          </button>
        ))}
      </div>

      <section className="schedule-groups">
        {filteredGroups.length ? filteredGroups.map((group) => <StudioGroup key={group.id} group={group} onStatusChange={onStatusChange} />) : <EmptyCard text="Bu kunga jadval kiritilmagan" />}
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
    </>
  );
}

function StudioPage({ dashboard, showAllOverview, navDirection, onAddSchedule, onCreate, onDeleteEmployee, onSaveEmployee, onMoveWeek, onToggleOverview }) {
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

  function submitSchedule(event) {
    event.preventDefault();
    onAddSchedule({
      ...scheduleDraft,
      employeeIds: scheduleDraft.employeeIds.filter(Boolean)
    });
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

      <EmployeeManager employees={dashboard.employees} onDelete={onDeleteEmployee} onSave={onSaveEmployee} />

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
              <input value={scheduleDraft.meta} onChange={(event) => setScheduleDraft({ ...scheduleDraft, meta: event.target.value })} placeholder="3 Studiya" />
            </label>
            <div className="modal-grid two">
              <label>
                Ish vaqti
                <input value={scheduleDraft.time} onChange={(event) => setScheduleDraft({ ...scheduleDraft, time: event.target.value })} placeholder="09:00 - 18:00" />
              </label>
              <label>
                Status
                <select value={scheduleDraft.statusType} onChange={(event) => setScheduleDraft({ ...scheduleDraft, statusType: event.target.value })}>
                  <option value="working">Ishlamoqda</option>
                  <option value="rest">Damda</option>
                  <option value="backup">Zaxira</option>
                </select>
              </label>
            </div>
            {[0, 1, 2].map((index) => (
              <label key={index}>
                Xodim {index + 1}
                <select value={scheduleDraft.employeeIds[index]} onChange={(event) => {
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

function StudioGroup({ group, onStatusChange }) {
  return (
    <article className="group-card">
      <div className={`group-head ${group.tone}`}>
        <strong>{group.title}</strong>
        <span>{group.meta}</span>
      </div>
      <div className="group-people">
        {group.people.map((person) => (
          <StaffRow key={person.id} groupId={group.id} person={person} onStatusChange={onStatusChange} />
        ))}
      </div>
    </article>
  );
}

function StaffRow({ groupId, person, onStatusChange }) {
  return (
    <article className="staff-row">
      <Avatar person={person} />
      <div>
        <strong>{person.name}</strong>
        <span>{person.employeeId ? `ID: ${person.employeeId}` : `Ish vaqti - ${person.time}`}</span>
      </div>
      {onStatusChange ? (
        <select className={`status-select ${person.statusType}`} value={person.statusType} onChange={(event) => onStatusChange(groupId, person.id, event.target.value)} aria-label={`${person.name} statusi`}>
          <option value="working">Ishlamoqda</option>
          <option value="rest">Damda</option>
          <option value="backup">Zaxira</option>
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

function EmployeeManager({ employees, onDelete, onSave }) {
  const blank = { name: "", role: "", phone: "", avatar: "" };
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  function startEdit(employee) {
    setEditingId(employee.id);
    setDraft(employee);
    setModalOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    onSave(draft);
    setDraft(blank);
    setEditingId(null);
    setModalOpen(false);
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
      <div className="employee-list">
        {employees.map((employee) => (
          <article className="employee-row" key={employee.id}>
            <Avatar person={employee} />
            <div>
              <strong>{employee.name}</strong>
              <span>{employee.role} • {employee.phone}</span>
            </div>
            <button type="button" aria-label="Tahrirlash" onClick={() => startEdit(employee)}><Edit3 size={16} /></button>
            <button type="button" aria-label="O'chirish" onClick={() => onDelete(employee.id)}><Trash2 size={16} /></button>
          </article>
        ))}
      </div>
      {modalOpen && (
        <div className="modal-backdrop employee-modal-backdrop" role="presentation">
          <form className="schedule-modal employee-modal" onSubmit={submit}>
            <div className="modal-head">
              <strong>{editingId ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}</strong>
              <button type="button" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <label>
              F.I.Sh
              <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="F.I.Sh" />
            </label>
            <label>
              Lavozim
              <input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Operator" />
            </label>
            <label>
              Telefon
              <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+998 ..." />
            </label>
            <label>
              Rasm URL
              <input value={draft.avatar} onChange={(event) => setDraft({ ...draft, avatar: event.target.value })} placeholder="Avtomatik yaratiladi" />
            </label>
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

function CompactStaffCard({ person }) {
  return (
    <article className="compact-staff">
      <Avatar person={person} />
      <div>
        <strong>{person.name}</strong>
        <span>Ish vaqti - {person.time}</span>
      </div>
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
              {value === "work" ? <Check size={16} /> : value === "rest" ? "x" : null}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}

function ReportsPage({ dashboard }) {
  const max = Math.max(...dashboard.reports.map((item) => item.value), 1);

  return (
    <section className="reports-page">
      <div className="section-head">
        <h2>Haftalik hisobot</h2>
        <span>{dashboard.week.range}</span>
      </div>
      <div className="report-card">
        {dashboard.reports.map((item) => (
          <div className="report-row" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <i style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="profile-card">
        <ChartColumn size={28} />
        <div>
          <strong>Kunlik qamrov</strong>
          <p>{dashboard.metrics.working} ta xodim haftalik smenaga biriktirilgan.</p>
        </div>
      </div>
    </section>
  );
}

function ProfilePage({ currentUser, dashboard, theme, onLogout, onRefresh, onThemeChange }) {
  const [notify, setNotify] = useState(true);
  const operators = dashboard.employees.filter((employee) => employee.role.includes("Operator")).length;
  const reporters = dashboard.employees.filter((employee) => employee.role.includes("Muxbir")).length;

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
          <strong>{reporters}</strong>
          <span>Muxbir</span>
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
      <span className={`legend-mark ${tone}`}>{tone === "work" ? <Check size={15} /> : tone === "rest" ? "x" : null}</span>
      <p>{label}</p>
    </div>
  );
}

function MetricCard({ icon, value, label, tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function Avatar({ person }) {
  return (
    <span className="avatar">
      <img src={person.avatar} alt={person.name} />
    </span>
  );
}

function EmptyCard({ text }) {
  return <div className="empty-card">{text}</div>;
}

function MenuPanel({ onClose, onPageChange }) {
  const links = [
    ["weekly", "Jadval"],
    ["studio", "Jamoa"],
    ["monthly", "Oylik grafik"],
    ["shooting", "Tasvir jadvali"],
    ["reports", "Hisobotlar"],
    ["profile", "Profil"]
  ];

  return (
    <aside className="floating-panel menu-panel">
      {links.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            onPageChange(id);
            onClose();
          }}
        >
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

function BottomNav({ page, onPageChange }) {
  const items = [
    { id: "weekly", label: "Jadval", icon: CalendarDays },
    { id: "studio", label: "Jamoa", icon: UsersRound },
    { id: "monthly", label: "Oy", icon: Clock3 },
    { id: "shooting", label: "Tasvir", icon: FileText },
    { id: "reports", label: "Hisobotlar", icon: ChartColumn },
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
