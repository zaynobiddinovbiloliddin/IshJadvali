import { spawn } from "node:child_process";

const processes = [
  {
    name: "backend",
    command: process.execPath,
    args: ["server.mjs"],
    env: { PORT: process.env.PORT || "3001", HOST: process.env.HOST || "0.0.0.0" }
  },
  {
    name: "frontend",
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "frontend", "--", "--port", process.env.VITE_PORT || "5173"],
    env: {}
  }
];

const children = processes.map(({ name, command, args, env }) => {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: "inherit"
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${name} stopped${signal ? ` by ${signal}` : ` with code ${code}`}`);
    stopAll();
    process.exit(code ?? 0);
  });

  return child;
});

let shuttingDown = false;

function stopAll() {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
}

process.on("SIGINT", () => {
  shuttingDown = true;
  stopAll();
});

process.on("SIGTERM", () => {
  shuttingDown = true;
  stopAll();
});
