import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
];

function inferDepartment(name, role, id) {
  const text = `${name} ${role}`.toLowerCase();
  if (text.includes("dron")) return "dron";
  if (text.includes("rej") || text.includes("tjk")) return "tjk";
  if (id <= 25) return "pull";
  return "operator";
}

async function main() {
  console.log("Seeding database...");

  const existingCount = await prisma.employee.count();
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} employees. Skipping employee seed.`);
  } else {
    for (let i = 0; i < initialEmployees.length; i++) {
      const [name, role] = initialEmployees[i];
      const id = i + 1;
      const department = inferDepartment(name, role, id);
      const avatar = `https://i.pravatar.cc/160?u=${encodeURIComponent(name)}`;

      await prisma.employee.create({
        data: {
          name,
          role,
          phone: "+998 90 000 00 00",
          telegram: "",
          department,
          avatar,
          address: "",
          portfolio: [],
          documents: {}
        }
      });
    }
    console.log(`✓ Seeded ${initialEmployees.length} employees`);
  }

  const existingContacts = await prisma.contact.count();
  if (existingContacts > 0) {
    console.log(`Database already has ${existingContacts} contacts. Skipping contact seed.`);
  } else {
    await prisma.contact.createMany({
      data: [
        { id: "contact-1", type: "Muxbir", name: "Sarvar Raximov", vehicle: "", phone: "+998 90 302 55 92" },
        { id: "contact-2", type: "Haydovchi", name: "142 Caddy", vehicle: "142 Caddy", phone: "+998 90 406 15 78" }
      ]
    });
    console.log("✓ Seeded 2 contacts");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
