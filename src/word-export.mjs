import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, BorderStyle, ShadingType
} from "docx";

const MONTHS_UZ = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
];

function formatDateUz(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()} yil`;
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const solidBorder = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const allBorders = { top: solidBorder, bottom: solidBorder, left: solidBorder, right: solidBorder };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(children, opts = {}) {
  return new TableCell({
    borders: opts.borders || allBorders,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    columnSpan: opts.span,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    verticalAlign: "center",
    children
  });
}

function para(runs, align = AlignmentType.LEFT) {
  return new Paragraph({ alignment: align, children: Array.isArray(runs) ? runs : [runs] });
}

function run(text, opts = {}) {
  return new TextRun({
    text: String(text || ""),
    font: "Times New Roman",
    size: opts.size || 20,
    bold: opts.bold || false,
    color: opts.color
  });
}

function headerCell(text) {
  return cell(
    [para([run(text, { bold: true, size: 18 })], AlignmentType.CENTER)],
    { fill: "D9D9D9" }
  );
}

function dataCell(text, width) {
  return cell(
    [para([run(text)])],
    { width }
  );
}

function equipmentRow(equipment) {
  const text = equipment || "HD jamlanmasi, mikrofon, chiroq, avtotransport";
  return new TableRow({
    children: [
      cell(
        [para([run("Kerakli jihoz va texnika: ", { bold: true }), run(text)])],
        { fill: "BDD7EE", span: 5 }
      )
    ]
  });
}

export async function buildFilmingScheduleDocx({ date = new Date(), approvedBy = "M. Safarov", rows = [] }) {
  const dateStr = formatDateUz(date);

  // Two-column header table (no borders)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          cell(
            [
              para([run("Tasvirga olish jadvali", { size: 22 })]),
              para([run(dateStr, { size: 22 })])
            ],
            { borders: noBorders, width: 4500 }
          ),
          cell(
            [
              para([run('"TASDIQLAYMAN"', { bold: true, size: 22 })], AlignmentType.CENTER),
              para([run('"O\'zbekiston 24" ijodiy', { size: 22 })], AlignmentType.CENTER),
              para([run('birlashmasi" DM direktori', { size: 22 })], AlignmentType.CENTER),
              para([run(`__________${approvedBy}`, { size: 22 })], AlignmentType.CENTER)
            ],
            { borders: noBorders, width: 4500 }
          )
        ]
      })
    ]
  });

  // Red warning paragraph
  const warningPara = new Paragraph({
    spacing: { before: 160, after: 160 },
    children: [
      run(
        "Muhim eslatma! Tasvirga olish ishlari yakunlanishi bilan, material tayyorlashga kirishish shart.",
        { bold: true, color: "FF0000", size: 20 }
      )
    ]
  });

  // Main schedule table
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("Kamera\nraqami"),
        headerCell("Chiqish\nvaqti"),
        headerCell("Operator va\ntexnik xodim"),
        headerCell("Tadbir o'tkazilish joyi va tadbir mavzusi"),
        headerCell("Muxbirlar")
      ]
    })
  ];

  for (const row of rows) {
    tableRows.push(equipmentRow(row.equipment));
    tableRows.push(
      new TableRow({
        children: [
          dataCell(row.cameraNumber || "", 1300),
          dataCell(row.exitTime || "", 1100),
          dataCell(row.operatorsText || "", 2000),
          dataCell(row.topic || "", 3300),
          dataCell(row.reportersText || "", 1500)
        ]
      })
    );
  }

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 1080 } }
      },
      children: [
        headerTable,
        new Paragraph({ children: [] }),
        warningPara,
        mainTable
      ]
    }]
  });

  return Packer.toBuffer(doc);
}
