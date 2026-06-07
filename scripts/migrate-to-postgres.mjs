// One-shot import: data/mock-db.json (read-only, never modified) -> PostgreSQL.
// Safe to re-run — it wipes and re-populates the Postgres tables from the
// current JSON snapshot, so it always converges to match mock-db.json exactly
// (modulo the "pull" -> "pool" department-id fix applied on the way in).
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DB_FILE = join(__dirname, "..", "data", "mock-db.json");
const prisma = new PrismaClient();

const DEPARTMENT_ID_FIX = { pull: "pool" };

// Walks employees / schedule blobs and rewrites any `department: "pull"`
// (the internal id, not the user-facing "Pool xizmati" label) to "pool".
function deepFixDepartmentIds(node) {
  if (Array.isArray(node)) {
    for (const item of node) deepFixDepartmentIds(item);
  } else if (node && typeof node === "object") {
    if (typeof node.department === "string" && node.department in DEPARTMENT_ID_FIX) {
      node.department = DEPARTMENT_ID_FIX[node.department];
    }
    for (const value of Object.values(node)) deepFixDepartmentIds(value);
  }
  return node;
}

async function resetSequence(table, column = "id") {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', '${column}'), COALESCE((SELECT MAX("${column}") FROM "${table}"), 0) + 1, false)`
  );
}

async function main() {
  const raw = await readFile(DB_FILE, "utf8");
  const db = JSON.parse(raw);

  console.log(
    `Loaded mock-db.json: ${db.employees.length} employees, ${db.users.length} users, ` +
    `${db.contacts.length} contacts, ${Object.keys(db.schedules || {}).length} schedules, ` +
    `${(db.dailyStatuses || []).length} daily statuses, ${(db.attendance || []).length} attendance, ` +
    `${(db.auditLogs || []).length} audit logs, ${(db.tasks || []).length} tasks, ${(db.notifications || []).length} notifications`
  );

  deepFixDepartmentIds(db.employees);
  deepFixDepartmentIds(db.schedules);
  const fixedCount = db.employees.filter((e) => e.department === "pool").length;
  console.log(`Department fix: ${fixedCount} employee(s) now use department id "pool" (was "pull")`);

  console.log("Wiping existing Postgres tables (local dev DB — known stale seed data)...");
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.task.deleteMany(),
    prisma.dailyStatus.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.schedule.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.user.deleteMany(),
    prisma.department.deleteMany()
  ]);

  console.log(`Importing ${db.employees.length} employees...`);
  for (const emp of db.employees) {
    await prisma.employee.create({
      data: {
        id: emp.id,
        name: emp.name,
        role: emp.role || "Operator",
        phone: emp.phone || "+998 90 000 00 00",
        telegram: emp.telegram || "",
        department: emp.department || "operator",
        avatar: emp.avatar || "",
        address: emp.address || "",
        portfolio: emp.portfolio || [],
        documents: emp.documents || {},
        isActive: emp.isActive !== false,
        createdAt: new Date(emp.createdAt || Date.now()),
        updatedAt: new Date(emp.updatedAt || emp.createdAt || Date.now())
      }
    });
  }
  await resetSequence("Employee");

  console.log(`Importing ${db.users.length} users...`);
  for (const user of db.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        pinCode: user.pinCode,
        fullName: user.fullName,
        role: user.role || "xodim",
        employeeId: user.employeeId ?? null,
        isActive: user.isActive !== false,
        createdAt: new Date(user.createdAt || Date.now()),
        updatedAt: new Date(user.updatedAt || user.createdAt || Date.now())
      }
    });
  }
  await resetSequence("User");

  console.log(`Importing ${db.contacts.length} contacts...`);
  for (const contact of db.contacts) {
    await prisma.contact.create({
      data: {
        id: String(contact.id),
        type: contact.type === "Haydovchi" ? "Haydovchi" : "Muxbir",
        name: contact.name || "",
        vehicle: contact.vehicle || "",
        phone: contact.phone || ""
      }
    });
  }

  const scheduleEntries = Object.entries(db.schedules || {});
  console.log(`Importing ${scheduleEntries.length} weekly schedules...`);
  for (const [weekStart, data] of scheduleEntries) {
    await prisma.schedule.create({ data: { weekStart, data } });
  }

  console.log(`Importing ${(db.dailyStatuses || []).length} daily statuses...`);
  for (const status of db.dailyStatuses || []) {
    await prisma.dailyStatus.create({
      data: {
        id: String(status.id),
        employeeId: Number(status.employeeId),
        date: status.date,
        statusCode: status.statusCode ?? status.code ?? null,
        createdAt: new Date(status.createdAt || Date.now()),
        updatedAt: new Date(status.updatedAt || status.createdAt || Date.now())
      }
    });
  }

  console.log(`Importing ${(db.attendance || []).length} attendance records...`);
  for (const record of db.attendance || []) {
    await prisma.attendance.create({
      data: {
        id: String(record.id),
        employeeId: Number(record.employeeId),
        employeeName: record.employeeName || "",
        date: record.date,
        checkIn: new Date(record.checkIn),
        checkOut: record.checkOut ? new Date(record.checkOut) : null,
        method: record.method || "face"
      }
    });
  }

  console.log(`Importing ${(db.auditLogs || []).length} audit logs...`);
  for (const log of db.auditLogs || []) {
    await prisma.auditLog.create({
      data: {
        id: BigInt(log.id),
        action: log.action,
        entity: log.entity,
        entityId: log.entityId != null ? String(log.entityId) : null,
        details: log.details || null,
        createdAt: new Date(log.createdAt || Date.now())
      }
    });
  }

  console.log(`Importing ${(db.tasks || []).length} tasks...`);
  for (const task of db.tasks || []) {
    await prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description || null,
        assignedToId: task.assignedToId,
        assignedById: task.assignedById,
        status: task.status || "PENDING",
        rejectReason: task.rejectReason || null,
        dueDate: task.dueDate || null,
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
        createdAt: new Date(task.createdAt || Date.now()),
        updatedAt: new Date(task.updatedAt || task.createdAt || Date.now())
      }
    });
  }

  console.log(`Importing ${(db.notifications || []).length} notifications...`);
  for (const notif of db.notifications || []) {
    await prisma.notification.create({
      data: {
        id: notif.id,
        userId: notif.userId,
        title: notif.title,
        message: notif.message,
        type: notif.type || "task",
        isRead: !!notif.isRead,
        taskId: notif.taskId ?? null,
        createdAt: new Date(notif.createdAt || Date.now())
      }
    });
  }

  // Canonical department list (matches the hardcoded array in server.mjs / src/main.jsx,
  // with the "pull" -> "pool" id fix applied). Not read by the live server today —
  // populated for future relational use / admin tooling.
  const departments = [
    { name: "pool", label: "Pool xizmati", color: "#6366f1" },
    { name: "operator", label: "Operatorlar", color: "#22c55e" },
    { name: "dron", label: "Dron bo'limi", color: "#f59e0b" },
    { name: "tjk", label: "TJK guruhi", color: "#8b5cf6" }
  ];
  console.log(`Importing ${departments.length} departments...`);
  for (const dep of departments) {
    await prisma.department.create({ data: dep });
  }

  await prisma.appMeta.upsert({
    where: { id: 1 },
    update: { generation: Number(db.generation || 0) },
    create: { id: 1, generation: Number(db.generation || 0) }
  });

  console.log("Migration complete — mock-db.json was only read, never modified.");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
