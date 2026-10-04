const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "PetCare Management System";
pptx.subject = "Oracle, Express.js, and React pet adoption management system";
pptx.title = "PetCare Management System";
pptx.company = "PetCare";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineSlideMaster({
  title: "PETCARE",
  background: { color: "F7F3EA" },
  objects: [
    { line: { x: 0.55, y: 7.12, w: 12.22, h: 0, line: { color: "D8D2C5", width: 0.8 } } },
    { text: { text: "PETCARE  /  ORACLE + EXPRESS + REACT", options: { x: 0.58, y: 7.18, w: 4.8, h: 0.16, fontFace: "Aptos", fontSize: 6.5, color: "6B746E", charSpacing: 1.1, margin: 0, breakLine: false } } },
  ],
  slideNumber: { x: 12.28, y: 7.14, w: 0.42, h: 0.2, color: "6B746E", fontFace: "Aptos", fontSize: 7.5, align: "right", margin: 0 },
});

const C = {
  cream: "F7F3EA",
  paper: "FFFCF6",
  ink: "19352F",
  muted: "65736D",
  teal: "0F6B5D",
  mint: "A9D8C8",
  paleMint: "E4F1EB",
  coral: "E86F51",
  paleCoral: "F8DDD4",
  gold: "E8B44B",
  paleGold: "F7EAC7",
  line: "D8D2C5",
  white: "FFFFFF",
  dark: "0B2A25",
};

const S = pptx.ShapeType;

function addText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: opts.fontFace || "Aptos",
    fontSize: opts.fontSize || 15,
    color: opts.color || C.ink,
    bold: opts.bold || false,
    margin: opts.margin === undefined ? 0 : opts.margin,
    valign: opts.valign || "mid",
    align: opts.align || "left",
    breakLine: false,
    fit: "shrink",
    paraSpaceAfterPt: opts.paraSpaceAfterPt || 0,
    bullet: opts.bullet,
    isTextBox: true,
  });
}

function addTitle(slide, kicker, title, subtitle) {
  addText(slide, kicker.toUpperCase(), 0.62, 0.32, 3.5, 0.22, { fontSize: 8.5, bold: true, color: C.coral });
  addText(slide, title, 0.62, 0.62, 11.8, 0.55, { fontSize: 27, bold: true, color: C.ink });
  if (subtitle) addText(slide, subtitle, 0.64, 1.18, 11.1, 0.36, { fontSize: 11.5, color: C.muted });
}

function chip(slide, text, x, y, w, fill = C.paleMint, color = C.teal) {
  slide.addShape(S.roundRect, { x, y, w, h: 0.34, rectRadius: 0.06, fill: { color: fill }, line: { color: fill } });
  addText(slide, text, x + 0.08, y + 0.02, w - 0.16, 0.29, { fontSize: 8.3, bold: true, color, align: "center" });
}

function card(slide, x, y, w, h, title, body, opts = {}) {
  const fill = opts.fill || C.paper;
  slide.addShape(S.roundRect, { x, y, w, h, rectRadius: 0.05, fill: { color: fill }, line: { color: opts.line || C.line, width: 0.8 }, shadow: opts.shadow === false ? undefined : { type: "outer", color: "B7AEA0", opacity: 0.12, blur: 1, angle: 45, distance: 1 } });
  if (opts.num) {
    slide.addShape(S.ellipse, { x: x + 0.18, y: y + 0.18, w: 0.38, h: 0.38, fill: { color: opts.accent || C.coral }, line: { color: opts.accent || C.coral } });
    addText(slide, String(opts.num), x + 0.18, y + 0.19, 0.38, 0.34, { fontSize: 9, bold: true, color: C.white, align: "center" });
  }
  const tx = opts.num ? x + 0.7 : x + 0.24;
  addText(slide, title, tx, y + 0.18, w - (tx - x) - 0.2, 0.35, { fontSize: opts.titleSize || 13, bold: true, color: opts.titleColor || C.ink });
  addText(slide, body, x + 0.24, y + 0.68, w - 0.48, h - 0.86, { fontSize: opts.bodySize || 10.2, color: opts.bodyColor || C.muted, valign: "top" });
}

function bulletList(slide, items, x, y, w, h, opts = {}) {
  const runs = [];
  items.forEach((item, i) => {
    runs.push({ text: item, options: { bullet: { indent: 14 }, hanging: 3, breakLine: i < items.length - 1 } });
  });
  slide.addText(runs, { x, y, w, h, fontFace: "Aptos", fontSize: opts.fontSize || 13, color: opts.color || C.ink, margin: 0.05, breakLine: false, valign: "top", paraSpaceAfterPt: opts.space || 10, fit: "shrink" });
}

function codeRef(slide, text, y = 6.62) {
  slide.addShape(S.roundRect, { x: 0.62, y, w: 12.08, h: 0.34, rectRadius: 0.04, fill: { color: "EEE9DF" }, line: { color: "EEE9DF" } });
  addText(slide, text, 0.78, y + 0.01, 11.75, 0.3, { fontFace: "Consolas", fontSize: 7.6, color: "52615B" });
}

function flow(slide, labels, x, y, totalW, opts = {}) {
  const gap = opts.gap || 0.2;
  const boxW = (totalW - gap * (labels.length - 1)) / labels.length;
  labels.forEach((label, i) => {
    const bx = x + i * (boxW + gap);
    if (i > 0) {
      slide.addShape(S.chevron, { x: bx - gap + 0.03, y: y + 0.27, w: gap - 0.06, h: 0.28, fill: { color: opts.arrow || C.coral }, line: { color: opts.arrow || C.coral } });
    }
    slide.addShape(S.roundRect, { x: bx, y, w: boxW, h: opts.h || 0.82, rectRadius: 0.05, fill: { color: i === labels.length - 1 && opts.finish ? C.teal : (opts.fill || C.paper) }, line: { color: i === labels.length - 1 && opts.finish ? C.teal : C.line, width: 0.8 } });
    addText(slide, label, bx + 0.1, y + 0.08, boxW - 0.2, (opts.h || 0.82) - 0.16, { fontSize: opts.fontSize || 9.5, bold: true, color: i === labels.length - 1 && opts.finish ? C.white : C.ink, align: "center" });
  });
}

function sectionLabel(slide, text, x, y, color = C.teal) {
  slide.addShape(S.line, { x, y: y + 0.11, w: 0.28, h: 0, line: { color, width: 2.2 } });
  addText(slide, text.toUpperCase(), x + 0.38, y, 3.5, 0.22, { fontSize: 8, bold: true, color });
}

function lineBetween(slide, x1, y1, x2, y2, line = {}) {
  slide.addShape(S.line, {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
    flipH: x2 < x1,
    flipV: (x2 < x1) !== (y2 < y1),
    line,
  });
}

// 1. Title
{
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };
  slide.addShape(S.arc, { x: 7.7, y: -1.15, w: 6.8, h: 6.8, adjustPoint: 0.35, rotate: 20, fill: { color: C.teal, transparency: 15 }, line: { color: C.teal, transparency: 100 } });
  slide.addShape(S.ellipse, { x: 9.1, y: 1.0, w: 2.7, h: 2.7, fill: { color: C.coral }, line: { color: C.coral } });
  slide.addShape(S.ellipse, { x: 9.67, y: 1.54, w: 0.48, h: 0.48, fill: { color: C.cream }, line: { color: C.cream } });
  slide.addShape(S.ellipse, { x: 10.7, y: 1.54, w: 0.48, h: 0.48, fill: { color: C.cream }, line: { color: C.cream } });
  slide.addShape(S.ellipse, { x: 10.18, y: 2.02, w: 0.65, h: 0.58, fill: { color: C.cream }, line: { color: C.cream } });
  addText(slide, "PETCARE", 0.75, 0.65, 3.2, 0.3, { fontSize: 10, bold: true, color: C.mint });
  addText(slide, "Management\nSystem", 0.75, 1.35, 7.6, 2.0, { fontSize: 42, bold: true, color: C.white, valign: "top" });
  addText(slide, "A complete pet adoption workflow powered by Oracle, Express.js and React.", 0.8, 3.7, 6.8, 0.72, { fontSize: 17, color: "CDE6DD", valign: "top" });
  chip(slide, "ORACLE DATABASE", 0.8, 4.85, 1.75, C.paleGold, C.dark);
  chip(slide, "EXPRESS.JS", 2.72, 4.85, 1.45, C.paleMint, C.dark);
  chip(slide, "REACT + VITE", 4.34, 4.85, 1.55, C.paleCoral, C.dark);
  addText(slide, "Presented by: [Your Name]", 0.8, 6.45, 4.5, 0.3, { fontSize: 11, color: "A9C3BA" });
  addText(slide, "01 / 25", 11.55, 6.45, 0.9, 0.3, { fontSize: 9, color: "A9C3BA", align: "right" });
}

// 2. Overview
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "01 / Product", "From rescue report to forever home", "One connected system coordinates people, pets, care, finance and adoption.");
  flow(slide, ["RESCUE", "INTAKE", "CARE", "REVIEW", "ADOPTION"], 0.72, 1.85, 11.9, { h: 1.0, finish: true, fontSize: 11 });
  card(slide, 0.72, 3.25, 3.72, 2.45, "Operational workflow", "Tracks every handoff from volunteer rescue reporting through shelter intake, health care, review and final adoption.", { accent: C.coral });
  card(slide, 4.79, 3.25, 3.72, 2.45, "Controlled access", "Supports multiple approved roles per person while enforcing authorization at protected backend routes.", { accent: C.gold });
  card(slide, 8.86, 3.25, 3.72, 2.45, "Database in action", "Exposes Oracle joins, views, CTEs, subqueries and PL/SQL through practical frontend features.", { accent: C.teal });
}

// 3. Stack
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "02 / Architecture", "A three-tier application stack", "Every user action travels through a secured API into Oracle business logic.");
  card(slide, 0.72, 1.9, 3.2, 2.55, "React + Vite", "Responsive interface\nReusable components\nRole-specific modules", { fill: C.paleMint, titleSize: 17 });
  card(slide, 5.05, 1.9, 3.2, 2.55, "Express.js", "REST controllers\nJWT authorization\nTransaction handling", { fill: C.paleCoral, titleSize: 17 });
  card(slide, 9.38, 1.9, 3.2, 2.55, "Oracle", "Relational schema\nViews and PL/SQL\nTriggers and sequences", { fill: C.paleGold, titleSize: 17 });
  slide.addShape(S.chevron, { x: 4.18, y: 2.82, w: 0.58, h: 0.48, fill: { color: C.coral }, line: { color: C.coral } });
  slide.addShape(S.chevron, { x: 8.51, y: 2.82, w: 0.58, h: 0.48, fill: { color: C.coral }, line: { color: C.coral } });
  sectionLabel(slide, "Supporting services", 0.75, 5.12);
  chip(slide, "JWT", 0.78, 5.53, 1.1);
  chip(slide, "BCRYPT", 2.04, 5.53, 1.25, C.paleCoral, C.coral);
  chip(slide, "DOCKER COMPOSE", 3.45, 5.53, 1.9, C.paleGold, "8B6419");
  codeRef(slide, "frontend/src/App.jsx   |   backend/src/app.js   |   backend/src/db.js   |   database/01_schema.sql   |   docker-compose.yml");
}

// 4. Roles
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "03 / Access", "One person, multiple approved roles", "Authentication identifies the user; authorization controls each action.");
  slide.addShape(S.ellipse, { x: 5.35, y: 2.15, w: 2.55, h: 2.55, fill: { color: C.dark }, line: { color: C.dark } });
  addText(slide, "SYSTEM\nUSER", 5.72, 2.88, 1.8, 0.88, { fontSize: 19, bold: true, color: C.white, align: "center" });
  const roles = [
    ["ADMIN", 0.85, 1.95, C.paleCoral, C.coral], ["SUPERVISOR", 0.75, 3.15, C.paleGold, "8B6419"],
    ["EMPLOYEE", 1.35, 4.38, C.paleMint, C.teal], ["DOCTOR", 3.6, 5.25, C.paleMint, C.teal],
    ["VOLUNTEER", 8.45, 5.25, C.paleCoral, C.coral], ["ADOPTER", 10.4, 4.38, C.paleGold, "8B6419"],
    ["DONOR", 11.25, 3.15, C.paleMint, C.teal], ["OWNER", 10.85, 1.95, C.paleCoral, C.coral],
  ];
  roles.forEach(([name, x, y, fill, color]) => {
    const roleCenterX = x + (name.length > 8 ? 0.825 : 0.675);
    lineBetween(slide, roleCenterX, y + 0.17, x < 5 ? 5.55 : 7.7, 3.42, { color: C.line, width: 1 });
    chip(slide, name, x, y, name.length > 8 ? 1.65 : 1.35, fill, color);
  });
  codeRef(slide, "middleware/auth.js   |   authController.js   |   roleApplicationController.js");
}

// 5. Modules
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "04 / Scope", "Fifteen modules, one operational view", "The interface groups daily work into four clear domains.");
  const groups = [
    ["OPERATIONS", "Dashboard\nPeople Directory\nUser Accounts\nStaff Employment", C.paleMint],
    ["PET JOURNEY", "Shelter Management\nPet Directory\nRescue Reports\nRescue Intake", C.paleCoral],
    ["CARE + ADOPTION", "Applications and Review\nHealth Records\nMedicine + Vaccination", C.paleGold],
    ["CONTROL + INSIGHT", "Finance + Payroll\nSystem Activity\nPetCare Insights\nSmart PetCare Tools", "E8E8F3"],
  ];
  groups.forEach((g, i) => card(slide, 0.72 + i * 3.04, 1.82, 2.7, 4.55, g[0], g[1], { fill: g[2], titleSize: 12.5, bodySize: 11.5 }));
  codeRef(slide, "frontend/src/App.jsx", 6.63);
}

// 6. Tables
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "05 / Data Model", "Oracle schema: six business domains", "Core tables are organized around identity, pets, rescue, adoption, care and finance.");
  const cols = [
    ["IDENTITY", ["PERSON", "SYSTEM_USER", "SYSTEM_USER_ROLE", "ROLE_APPLICATION"]],
    ["PETS", ["PET", "LOCAL_PET", "GUEST_PET", "SHELTER"]],
    ["RESCUE", ["RESCUE", "RESCUE_PET", "PET_SHELTER"]],
    ["ADOPTION", ["ADOPTION_PROCESS", "ADOPTION_MANAGEMENT"]],
    ["HEALTH", ["MEDICAL_RECORD", "MEDICINE", "VACCINATION"]],
    ["CONTROL", ["FINANCE", "SALARY", "AUDIT_LOG"]],
  ];
  cols.forEach((col, i) => {
    const row = i < 3 ? 0 : 1;
    const cx = 0.72 + (i % 3) * 4.05;
    const cy = 1.78 + row * 2.35;
    card(slide, cx, cy, 3.7, 2.0, col[0], col[1].join("\n"), { fill: row ? C.paleGold : C.paper, titleSize: 12, bodySize: 9.7, shadow: false });
  });
  codeRef(slide, "database/01_schema.sql");
}

// 7. Relationships
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "06 / Relationships", "The relational backbone", "Shared identifiers keep ownership, care and adoption history connected.");
  const nodes = [
    ["PERSON", 0.7, 2.5, C.paleMint], ["ROLE", 3.1, 1.72, C.paleGold], ["RESCUE", 3.1, 3.28, C.paleCoral],
    ["PET", 5.6, 2.5, C.dark], ["SHELTER", 8.1, 1.72, C.paleGold], ["MEDICAL", 8.1, 3.28, C.paleMint],
    ["ADOPTION", 10.55, 2.5, C.paleCoral],
  ];
  const links = [[0,1],[0,2],[2,3],[3,4],[3,5],[3,6],[0,6]];
  links.forEach(([a,b]) => {
    const na = nodes[a], nb = nodes[b];
    lineBetween(slide, na[1] + 0.9, na[2] + 0.42, nb[1] + 0.9, nb[2] + 0.42, { color: C.coral, width: 1.6, beginArrowType: "none", endArrowType: "triangle" });
  });
  nodes.forEach((n) => {
    slide.addShape(S.roundRect, { x: n[1], y: n[2], w: 1.8, h: 0.82, rectRadius: 0.04, fill: { color: n[3] }, line: { color: n[3] === C.dark ? C.dark : C.line } });
    addText(slide, n[0], n[1] + 0.08, n[2] + 0.1, 1.64, 0.6, { fontSize: 10, bold: true, align: "center", color: n[3] === C.dark ? C.white : C.ink });
  });
  bulletList(slide, ["Local pets can enter adoption; guest pets retain owner records.", "Supervisors review; active employees complete approved cases.", "Health, salary and finance data remain role-protected."], 1.1, 5.05, 11.2, 1.15, { fontSize: 11.2, space: 6 });
  codeRef(slide, "SYSTEM_USER_ROLE | LOCAL_PET | GUEST_PET | RESCUE_PET | PET_SHELTER | ADOPTION_PROCESS");
}

// 8. Search
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "07 / Search", "A frontend search backed by Oracle", "The same interaction pattern powers four operational directories.");
  slide.addShape(S.roundRect, { x: 0.78, y: 1.84, w: 5.0, h: 0.78, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.teal, width: 1.3 } });
  slide.addShape(S.ellipse, { x: 1.05, y: 2.03, w: 0.28, h: 0.28, fill: { color: C.cream, transparency: 100 }, line: { color: C.teal, width: 1.6 } });
  slide.addShape(S.line, { x: 1.27, y: 2.25, w: 0.16, h: 0.16, line: { color: C.teal, width: 1.6 } });
  addText(slide, "Search pets, people or activity...", 1.58, 1.98, 3.7, 0.34, { fontSize: 12, color: "87918C" });
  flow(slide, ["INPUT", "?search=...", "CONTROLLER", "BIND QUERY", "RESULTS"], 0.78, 3.05, 11.8, { h: 0.86, finish: true, fontSize: 8.8 });
  const labels = ["People Directory", "Pet Directory", "Pet Owners", "System Activity"];
  labels.forEach((l, i) => chip(slide, l, 0.82 + i * 2.95, 4.55, 2.55, i % 2 ? C.paleCoral : C.paleMint, i % 2 ? C.coral : C.teal));
  addText(slide, "Oracle bind variables keep search flexible and injection-resistant.", 0.82, 5.35, 11.5, 0.5, { fontSize: 15, bold: true, color: C.ink, align: "center" });
  codeRef(slide, "frontend/src/components.jsx | peopleController.js | petController.js | auditController.js");
}

// 9. Inserts
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "08 / Transactions", "Insert operations create real records", "Every form maps to a controlled backend transaction.");
  const items = ["Person + staff", "Supervisor account", "Local / guest pet", "Rescue report", "Shelter intake", "Adoption request", "Medical record", "Donation", "Salary record"];
  items.forEach((item, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    card(slide, 0.75 + col * 4.05, 1.72 + row * 1.42, 3.7, 1.13, item, "VALIDATE  >  INSERT  >  COMMIT", { num: i + 1, bodySize: 8.3, titleSize: 11.2, shadow: false, accent: row === 0 ? C.coral : row === 1 ? C.gold : C.teal });
  });
  codeRef(slide, "people | user | pet | rescue | adoption | medical | finance | salary controllers");
}

// 10. Joins
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "09 / Queries", "Joins turn normalized data into useful views", "Backend controllers and database views assemble the records each page needs.");
  const left = [["PERSON", "ROLE"], ["PET", "SHELTER"], ["ADOPTION", "EMPLOYEE"], ["MEDICAL", "PET"]];
  left.forEach((pair, i) => {
    const y = 1.82 + i * 1.08;
    chip(slide, pair[0], 0.82, y, 1.45, C.paleMint, C.teal);
    addText(slide, "+", 2.42, y, 0.35, 0.34, { fontSize: 18, bold: true, color: C.coral, align: "center" });
    chip(slide, pair[1], 2.92, y, 1.55, C.paleGold, "8B6419");
  });
  slide.addShape(S.chevron, { x: 4.82, y: 3.12, w: 0.72, h: 0.58, fill: { color: C.coral }, line: { color: C.coral } });
  card(slide, 5.9, 1.72, 6.55, 4.5, "Saved join views", "VW_PERSON_ROLES\nVW_PET_DETAILS\nVW_RESCUE_DETAILS\nVW_ADOPTION_APPLICATIONS\nVW_MEDICAL_DETAILS\nVW_SALARY_DETAILS\nVW_DASHBOARD_STATS", { fill: C.dark, titleColor: C.mint, bodyColor: C.white, titleSize: 16, bodySize: 13 });
  codeRef(slide, "database/03_views.sql");
}

// 11. Sequences
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "10 / Automation", "Sequences create clean, human-readable IDs", "Database-generated identifiers avoid collisions and keep records presentation-friendly.");
  const ids = [["P###", "PERSON"], ["U###", "USER"], ["LP###", "LOCAL PET"], ["GP###", "GUEST PET"], ["R###", "RESCUE"], ["AD###", "ADOPTION"], ["MR###", "MEDICAL"], ["AU###", "AUDIT"]];
  ids.forEach((d, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.77 + col * 3.03, y = 1.92 + row * 2.05;
    slide.addShape(S.roundRect, { x, y, w: 2.68, h: 1.6, rectRadius: 0.05, fill: { color: row ? C.paleGold : C.paleMint }, line: { color: C.line } });
    addText(slide, d[0], x + 0.18, y + 0.22, 2.3, 0.55, { fontFace: "Consolas", fontSize: 22, bold: true, color: row ? "8B6419" : C.teal, align: "center" });
    addText(slide, d[1], x + 0.18, y + 0.92, 2.3, 0.28, { fontSize: 8.5, bold: true, color: C.muted, align: "center" });
  });
  codeRef(slide, "database/01_schema.sql | 22_rescue_intake_workflow.sql | 24_identity_auto_id_triggers.sql | 25_pet_adoption_audit_id_cleanup.sql");
}

// 12. Triggers
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "11 / Automation", "Triggers enforce rules at the data boundary", "Automatic actions stay consistent regardless of which frontend path writes the row.");
  const triggerCards = [
    ["GENERATE", "Person, user, pet, medical, adoption and audit IDs", C.paleMint],
    ["LOG", "Capture adoption status changes in the audit trail", C.paleCoral],
    ["VALIDATE", "Confirm salary payee role before recording payroll", C.paleGold],
    ["BLOCK", "Reject invalid owner role applications", "E8E8F3"],
  ];
  triggerCards.forEach((t, i) => card(slide, 0.75 + (i % 2) * 6.05, 1.82 + Math.floor(i / 2) * 2.15, 5.7, 1.75, t[0], t[1], { fill: t[2], titleSize: 15, bodySize: 11.2 }));
  addText(slide, "INSERT / UPDATE", 4.65, 5.95, 1.5, 0.28, { fontSize: 8, bold: true, color: C.coral, align: "center" });
  slide.addShape(S.chevron, { x: 6.2, y: 5.94, w: 0.48, h: 0.3, fill: { color: C.coral }, line: { color: C.coral } });
  addText(slide, "TRIGGER", 6.75, 5.95, 1.0, 0.28, { fontSize: 8, bold: true, color: C.teal, align: "center" });
  slide.addShape(S.chevron, { x: 7.85, y: 5.94, w: 0.48, h: 0.3, fill: { color: C.coral }, line: { color: C.coral } });
  addText(slide, "SAFE ROW", 8.4, 5.95, 1.2, 0.28, { fontSize: 8, bold: true, color: C.ink, align: "center" });
  codeRef(slide, "database/01_schema.sql | 24_identity_auto_id_triggers.sql | 25_pet_adoption_audit_id_cleanup.sql");
}

// 13. Rescue workflow
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "12 / Workflow", "Rescue report becomes an adoptable pet", "A single intake process coordinates volunteer, shelter and database records.");
  flow(slide, ["1\nREPORT", "2\nSHELTER", "3\nPET", "4\nLOCAL_PET", "5\nPET_SHELTER", "6\nRESCUE_PET", "7\nLP###"], 0.68, 2.05, 12.0, { h: 1.18, finish: true, fontSize: 9 });
  card(slide, 0.78, 3.85, 3.65, 1.85, "Volunteer", "Submits location, date and rescue details.", { fill: C.paleCoral, titleSize: 14 });
  card(slide, 4.82, 3.85, 3.65, 1.85, "Shelter", "Receives the pet and establishes its local-pet status.", { fill: C.paleGold, titleSize: 14 });
  card(slide, 8.86, 3.85, 3.65, 1.85, "Oracle", "Creates linked rows and generates the final LP### identifier.", { fill: C.paleMint, titleSize: 14 });
  codeRef(slide, "backend/src/controllers/rescueController.js | database/22_rescue_intake_workflow.sql | database/25_pet_adoption_audit_id_cleanup.sql");
}

// 14. Adoption workflow
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "13 / Workflow", "Adopter request to employee handover", "Responsibility changes by role while status remains traceable.");
  const stages = [
    ["ADOPTER", "Submit application", "PENDING"], ["ORACLE", "Generate AD###", "CREATED"],
    ["SUPERVISOR", "Review + assign", "APPROVED"], ["EMPLOYEE", "Finalize handover", "COMPLETED"],
    ["AUDIT", "Record changes", "ADOPTED"],
  ];
  stages.forEach((s, i) => {
    const x = 0.72 + i * 2.48;
    if (i < stages.length - 1) slide.addShape(S.line, { x: x + 2.12, y: 3.1, w: 0.38, h: 0, line: { color: C.coral, width: 2, endArrowType: "triangle" } });
    slide.addShape(S.roundRect, { x, y: 1.95, w: 2.12, h: 2.55, rectRadius: 0.05, fill: { color: i === 4 ? C.dark : C.paper }, line: { color: i === 4 ? C.dark : C.line } });
    addText(slide, `0${i + 1}`, x + 0.18, 2.12, 0.55, 0.35, { fontSize: 10, bold: true, color: C.coral });
    addText(slide, s[0], x + 0.18, 2.62, 1.76, 0.38, { fontSize: 12, bold: true, color: i === 4 ? C.mint : C.ink });
    addText(slide, s[1], x + 0.18, 3.12, 1.76, 0.6, { fontSize: 10.2, color: i === 4 ? C.white : C.muted, valign: "top" });
    chip(slide, s[2], x + 0.18, 3.93, 1.76, i === 4 ? C.coral : C.paleMint, i === 4 ? C.white : C.teal);
  });
  addText(slide, "Stored procedures control each transition; the trigger preserves the timeline.", 0.8, 5.25, 11.8, 0.48, { fontSize: 15, bold: true, align: "center" });
  codeRef(slide, "PR_SUBMIT_ADOPTION | PR_REVIEW_ADOPTION | PR_MARK_ADOPTED | TRG_ADOPTION_STATUS_AUDIT");
}

// 15. CTE
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "14 / Advanced SQL", "CTEs make workload ranking readable", "The Employee Adoption Case Summary is built in two named stages.");
  card(slide, 0.82, 1.88, 4.75, 3.8, "01  EMPLOYEE_CASES", "Aggregate assigned adoption cases for each employee.\n\nOUTPUT\nEmployee identity\nAssigned case count\nCompleted case count", { fill: C.paleMint, titleSize: 16, bodySize: 11.5 });
  slide.addShape(S.chevron, { x: 5.85, y: 3.25, w: 0.75, h: 0.62, fill: { color: C.coral }, line: { color: C.coral } });
  card(slide, 6.88, 1.88, 4.75, 3.8, "02  RANKED_CASES", "Rank employees by assigned workload.\n\nOUTPUT\nWorkload position\nComparable case totals\nPresentation-ready report", { fill: C.paleGold, titleSize: 16, bodySize: 11.5 });
  chip(slide, "PETCARE INSIGHTS", 5.15, 5.95, 2.95, C.paleCoral, C.coral);
  codeRef(slide, "backend/src/queryCatalog.js");
}

// 16. Subqueries
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "15 / Advanced SQL", "Eight subquery patterns, visible in the UI", "PetCare Insights turns database concepts into functional reports.");
  const qs = [["=", "SINGLE ROW"], ["IN", "MULTIPLE ROW"], ["ANY", "ANY MATCH"], ["ALL", "EVERY MATCH"], ["EXISTS", "HAS RELATED"], ["NOT EXISTS", "MISSING RELATED"], ["CORRELATED", "ROW-AWARE"], ["HAVING", "GROUP FILTER"]];
  qs.forEach((q, i) => {
    const x = 0.75 + (i % 4) * 3.03, y = 1.82 + Math.floor(i / 4) * 2.05;
    slide.addShape(S.roundRect, { x, y, w: 2.68, h: 1.62, rectRadius: 0.05, fill: { color: i < 4 ? C.paper : C.dark }, line: { color: i < 4 ? C.line : C.dark } });
    addText(slide, q[0], x + 0.18, y + 0.18, 2.32, 0.62, { fontFace: "Consolas", fontSize: q[0].length > 7 ? 15 : 21, bold: true, color: i < 4 ? C.coral : C.mint, align: "center" });
    addText(slide, q[1], x + 0.18, y + 1.02, 2.32, 0.26, { fontSize: 8.2, bold: true, color: i < 4 ? C.muted : C.white, align: "center" });
  });
  codeRef(slide, "PetCare Insights  >  backend/src/queryCatalog.js");
}

// 17. Views
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "16 / Advanced SQL", "Views create a stable contract for the frontend", "Complex joins are saved once and reused across operational pages.");
  const views = ["VW_PERSON_ROLES", "VW_PET_DETAILS", "VW_RESCUE_DETAILS", "VW_ADOPTION_APPLICATIONS", "VW_MEDICAL_DETAILS", "VW_FINANCE_SUMMARY", "VW_SALARY_DETAILS", "VW_DASHBOARD_STATS"];
  views.forEach((v, i) => chip(slide, v, 0.78 + (i % 2) * 6.05, 1.78 + Math.floor(i / 2) * 0.76, 5.68, i % 2 ? C.paleGold : C.paleMint, i % 2 ? "8B6419" : C.teal));
  flow(slide, ["TABLES", "SAVED VIEW", "CONTROLLER", "FRONTEND PAGE"], 1.5, 5.15, 10.35, { h: 0.82, finish: true, fontSize: 9.3 });
  codeRef(slide, "database/03_views.sql");
}

// 18. Functions
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "17 / PL/SQL", "Stored functions answer focused questions", "Smart PetCare Tools calls Oracle logic and returns simple values.");
  card(slide, 0.85, 1.9, 5.55, 3.75, "FN_PERSON_AGE", "INPUT\nPerson identifier\n\nCALCULATION\nDate of birth to current age\n\nFRONTEND\nAge Calculator", { fill: C.paleMint, titleSize: 19, bodySize: 11.5 });
  card(slide, 6.92, 1.9, 5.55, 3.75, "FN_AVAILABLE_PET_COUNT", "INPUT\nAdoption availability state\n\nCALCULATION\nCount eligible local pets\n\nFRONTEND\nPet availability", { fill: C.paleCoral, titleSize: 19, bodySize: 11.5 });
  codeRef(slide, "database/06_plsql.sql  >  backend/src/controllers/plsqlController.js  >  Smart PetCare Tools");
}

// 19. Procedures
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "18 / PL/SQL", "Procedures keep business transitions atomic", "Oracle owns multi-step operations that must either fully succeed or roll back.");
  const ps = [
    ["PR_SUBMIT_ADOPTION", "Create application"], ["PR_REVIEW_ADOPTION", "Review + assign"],
    ["PR_MARK_ADOPTED", "Complete handover"], ["PR_CURSOR_PET_SUMMARY", "Summarize pets"],
    ["PR_FIND_PERSON", "Handled lookup"],
  ];
  ps.forEach((p, i) => card(slide, i < 3 ? 0.75 + i * 4.05 : 2.78 + (i - 3) * 4.05, i < 3 ? 1.82 : 4.12, 3.7, 1.72, p[0], p[1], { fill: i % 2 ? C.paleGold : C.paleMint, titleSize: 12.3, bodySize: 10.3, shadow: false }));
  codeRef(slide, "database/06_plsql.sql | database/25_pet_adoption_audit_id_cleanup.sql | database/26_employee_assignment_role_check_fix.sql");
}

// 20. Cursor
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "19 / PL/SQL", "An explicit cursor processes pets row by row", "PR_CURSOR_PET_SUMMARY demonstrates controlled fetch logic.");
  flow(slide, ["OPEN", "FETCH", "EVALUATE", "COUNT", "CLOSE"], 0.92, 2.05, 11.45, { h: 1.0, finish: true, fontSize: 11 });
  slide.addShape(S.roundRect, { x: 2.0, y: 3.62, w: 4.2, h: 1.75, rectRadius: 0.05, fill: { color: C.paleMint }, line: { color: C.paleMint } });
  addText(slide, "TOTAL PETS", 2.3, 3.92, 3.6, 0.28, { fontSize: 9, bold: true, color: C.teal, align: "center" });
  addText(slide, "ALL ROWS", 2.3, 4.4, 3.6, 0.48, { fontSize: 21, bold: true, color: C.ink, align: "center" });
  slide.addShape(S.roundRect, { x: 7.12, y: 3.62, w: 4.2, h: 1.75, rectRadius: 0.05, fill: { color: C.paleCoral }, line: { color: C.paleCoral } });
  addText(slide, "AVAILABLE LOCAL PETS", 7.42, 3.92, 3.6, 0.28, { fontSize: 9, bold: true, color: C.coral, align: "center" });
  addText(slide, "ELIGIBLE ROWS", 7.42, 4.4, 3.6, 0.48, { fontSize: 21, bold: true, color: C.ink, align: "center" });
  codeRef(slide, "database/06_plsql.sql | backend/src/controllers/plsqlController.js | Smart PetCare Tools");
}

// 21. Exceptions
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "20 / Reliability", "Exceptions are handled at every boundary", "Failures are translated into safe rollbacks and clear API responses.");
  const lanes = [
    ["ORACLE", "NO_DATA_FOUND\nTOO_MANY_ROWS\nDUP_VAL_ON_INDEX\nOTHERS", C.paleGold],
    ["TRANSACTION", "Run operation\nCommit success\nRollback failure", C.paleMint],
    ["EXPRESS", "Async wrapper\nCentral error handler\nClean API message", C.paleCoral],
  ];
  lanes.forEach((l, i) => card(slide, 0.78 + i * 4.12, 1.88, 3.72, 3.95, l[0], l[1], { fill: l[2], titleSize: 17, bodySize: 12 }));
  flow(slide, ["ERROR", "ROLLBACK", "NORMALIZE", "RESPOND"], 2.05, 5.98, 9.25, { h: 0.46, fontSize: 7.8, finish: true });
  codeRef(slide, "database/06_plsql.sql | backend/src/utils.js | backend/src/db.js | backend/src/app.js");
}

// 22. ADT
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "21 / Oracle Objects", "ADDRESS_TYPE packages a structured value", "The object type keeps address fields together while a view exposes them to PetCare Insights.");
  slide.addShape(S.roundRect, { x: 0.95, y: 1.85, w: 4.4, h: 4.2, rectRadius: 0.06, fill: { color: C.dark }, line: { color: C.dark } });
  addText(slide, "ADDRESS_TYPE", 1.3, 2.2, 3.7, 0.5, { fontFace: "Consolas", fontSize: 20, bold: true, color: C.mint, align: "center" });
  ["HOUSE_NO", "STREET", "CITY"].forEach((v, i) => chip(slide, v, 1.55, 3.1 + i * 0.72, 3.2, i === 1 ? C.paleCoral : C.paleMint, i === 1 ? C.coral : C.teal));
  slide.addShape(S.chevron, { x: 5.82, y: 3.55, w: 0.88, h: 0.68, fill: { color: C.coral }, line: { color: C.coral } });
  card(slide, 7.12, 1.85, 5.2, 1.7, "VW_PERSON_ADDRESS_OBJECT", "A reusable view returns person data with its structured address.", { fill: C.paleGold, titleSize: 15 });
  card(slide, 7.12, 4.02, 5.2, 2.03, "Structured Address Directory", "PetCare Insights renders the object fields as an application report.", { fill: C.paleMint, titleSize: 15 });
  codeRef(slide, "database/07_abstract_datatype.sql | backend/src/queryCatalog.js");
}

// 23. Security
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "22 / Security", "Defense in depth from login to query", "Identity, permissions, inputs and sensitive output are protected independently.");
  const layers = [
    ["01", "PASSWORD", "bcrypt hashing"], ["02", "SESSION", "JWT authentication"],
    ["03", "ROUTE", "Role authorization"], ["04", "QUERY", "Oracle bind variables"],
    ["05", "DATA", "Finance role checks"], ["06", "OUTPUT", "No password hashes"],
  ];
  layers.forEach((l, i) => {
    const x = 0.8 + (i % 3) * 4.08, y = 1.78 + Math.floor(i / 3) * 2.18;
    slide.addShape(S.roundRect, { x, y, w: 3.68, h: 1.76, rectRadius: 0.05, fill: { color: i < 3 ? C.dark : C.paper }, line: { color: i < 3 ? C.dark : C.line } });
    addText(slide, l[0], x + 0.22, y + 0.18, 0.55, 0.35, { fontSize: 10, bold: true, color: C.coral });
    addText(slide, l[1], x + 0.22, y + 0.68, 3.24, 0.3, { fontSize: 13, bold: true, color: i < 3 ? C.mint : C.ink });
    addText(slide, l[2], x + 0.22, y + 1.15, 3.24, 0.3, { fontSize: 10.3, color: i < 3 ? C.white : C.muted });
  });
  codeRef(slide, "middleware/auth.js | authController.js | financeController.js | backend/src/db.js");
}

// 24. Demo
{
  const slide = pptx.addSlide("PETCARE");
  addTitle(slide, "23 / Live Demo", "A twelve-step proof of the complete workflow", "Start broad, show database concepts, then complete rescue and adoption actions.");
  const phases = [
    ["ADMIN", "1  Login\n2  Dashboard\n3  People search\n4  Pet search", C.paleMint],
    ["INSIGHTS", "5  Join / subquery / CTE\n6  Function / cursor / exceptions", C.paleGold],
    ["RESCUE", "7  Volunteer report\n8  Confirm LP###", C.paleCoral],
    ["ADOPTION", "9  Adopter application\n10 Confirm AD###\n11 Supervisor approval\n12 Confirm AU###", "E8E8F3"],
  ];
  phases.forEach((p, i) => card(slide, 0.72 + i * 3.04, 1.8, 2.7, 4.72, p[0], p[1], { fill: p[2], titleSize: 14.5, bodySize: 11.3 }));
  codeRef(slide, "TIP: keep test credentials ready and reset demo data before presenting", 6.65);
}

// 25. Conclusion
{
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };
  addText(slide, "PETCARE", 0.78, 0.62, 2.2, 0.3, { fontSize: 10, bold: true, color: C.mint });
  addText(slide, "One system.\nOne pet journey.", 0.78, 1.3, 7.2, 1.55, { fontSize: 36, bold: true, color: C.white, valign: "top" });
  addText(slide, "React experiences, Express services and Oracle business logic work together from rescue through adoption.", 0.82, 3.12, 6.55, 0.95, { fontSize: 17, color: "CDE6DD", valign: "top" });
  const endItems = ["ROLE-BASED", "SEARCHABLE", "AUDITABLE", "TRANSACTIONAL", "SECURE", "DATABASE-DRIVEN"];
  endItems.forEach((t, i) => chip(slide, t, 0.82 + (i % 3) * 2.08, 4.55 + Math.floor(i / 3) * 0.58, 1.78, i % 3 === 0 ? C.paleCoral : i % 3 === 1 ? C.paleGold : C.paleMint, C.dark));
  slide.addShape(S.roundRect, { x: 8.45, y: 1.02, w: 3.82, h: 5.25, rectRadius: 0.08, fill: { color: C.teal }, line: { color: C.teal } });
  addText(slide, "QUESTIONS?", 8.88, 1.55, 2.96, 0.48, { fontSize: 20, bold: true, color: C.white, align: "center" });
  addText(slide, "Oracle\n+\nExpress.js\n+\nReact", 9.15, 2.35, 2.4, 2.65, { fontSize: 22, bold: true, color: C.mint, align: "center" });
  addText(slide, "Thank you", 8.88, 5.48, 2.96, 0.38, { fontSize: 12, color: C.white, align: "center" });
  addText(slide, "25 / 25", 11.55, 6.78, 0.9, 0.3, { fontSize: 9, color: "A9C3BA", align: "right" });
}

const outputFile = process.env.OUTPUT_FILE || "E:/pet-adoption-system/docs/PetCare_Management_System_Presentation.pptx";
pptx.writeFile({ fileName: outputFile }).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
