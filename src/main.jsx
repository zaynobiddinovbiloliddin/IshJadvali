import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Edit3,
  Info,
  Menu,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  Trash2,
  User,
  UserCheck,
  UsersRound,
  Umbrella
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const DAY_TABS = ["Barcha kunlar", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

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

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setDashboard(await api(`/api/dashboard?weekStart=${weekStart}`));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

  function moveWeek(days) {
    setWeekStart((value) => addDays(value, days));
    setActiveDay("Barcha kunlar");
    setShowAllOverview(false);
  }

  const title = useMemo(() => {
    if (page === "studio") return "Studiyo jadvali";
    if (page === "reports") return "Hisobotlar";
    if (page === "profile") return "Profil";
    return "Ish jadvali";
  }, [page]);

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
                onStatusChange={updateStatus}
              />
            )}
            {page === "studio" && (
              <StudioPage
                dashboard={dashboard}
                showAllOverview={showAllOverview}
                onCreate={createSchedule}
                onDeleteEmployee={deleteEmployee}
                onSaveEmployee={saveEmployee}
                onMoveWeek={moveWeek}
                onToggleOverview={() => setShowAllOverview((value) => !value)}
              />
            )}
            {page === "reports" && <ReportsPage dashboard={dashboard} />}
            {page === "profile" && <ProfilePage onRefresh={loadDashboard} />}
          </>
        )}
      </main>

      <BottomNav page={page} onPageChange={setPage} />
    </div>
  );
}

function WeeklyPage({ activeDay, dashboard, onCreate, onDeleteSchedule, onDayChange, onMoveWeek, onStatusChange }) {
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
        <button type="button" onClick={() => onMoveWeek(-7)}>
          <ChevronLeft size={19} />
          Oldingi
        </button>
        <button type="button" className="primary" onClick={() => onMoveWeek(7)}>
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

function StudioPage({ dashboard, showAllOverview, onCreate, onDeleteEmployee, onSaveEmployee, onMoveWeek, onToggleOverview }) {
  const overviewRows = showAllOverview ? dashboard.overviewRows : dashboard.overviewRows.slice(0, 5);

  return (
    <>
      <section className="studio-panel">
        <div className="studio-period">
          <button className="icon-button dark" type="button" aria-label="Oldingi hafta" onClick={() => onMoveWeek(-7)}>
            <ChevronLeft size={23} />
          </button>
          <div>
            <h2>{dashboard.week.title}</h2>
            <p>{dashboard.week.range}</p>
          </div>
          <button className="icon-button dark" type="button" aria-label="Keyingi hafta" onClick={() => onMoveWeek(7)}>
            <ChevronRight size={23} />
          </button>
        </div>
        <button className="create-button flat" type="button" onClick={onCreate}>
          <RefreshCcw size={17} />
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

  function startEdit(employee) {
    setEditingId(employee.id);
    setDraft(employee);
  }

  function submit(event) {
    event.preventDefault();
    onSave(draft);
    setDraft(blank);
    setEditingId(null);
  }

  return (
    <section className="employee-card">
      <div className="section-head">
        <h2>Xodimlar</h2>
        <span>{employees.length} ta</span>
      </div>
      <form className="employee-form" onSubmit={submit}>
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="F.I.Sh" />
        <input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Lavozim" />
        <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+998 ..." />
        <button type="submit">
          {editingId ? <Save size={16} /> : <Plus size={16} />}
          {editingId ? "Saqlash" : "Qo'shish"}
        </button>
      </form>
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

function ProfilePage({ onRefresh }) {
  const [compact, setCompact] = useState(false);
  const [notify, setNotify] = useState(true);

  return (
    <section className="profile-page">
      <div className="profile-card main">
        <span className="profile-avatar"><User size={32} /></span>
        <div>
          <strong>Administrator</strong>
          <p>Jadval va xodimlar boshqaruvi</p>
        </div>
      </div>
      <ToggleRow label="Bildirishnomalar" active={notify} onClick={() => setNotify((value) => !value)} />
      <ToggleRow label="Ixcham ko'rinish" active={compact} onClick={() => setCompact((value) => !value)} />
      <button className="create-button flat" type="button" onClick={onRefresh}>
        <Settings size={17} />
        Ma'lumotlarni yangilash
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
