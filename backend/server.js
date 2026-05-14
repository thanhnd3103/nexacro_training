const express = require("express");
const cors    = require("cors");

const app  = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ─── In-Memory Data ───────────────────────────────────────────────────────────

const users = [
  { UserId: "admin", Password: "admin", UserName: "Administrator", Role: "ADMIN" },
  { UserId: "user1", Password: "user1", UserName: "John Doe",      Role: "USER"  },
];

const departments = [
  { Code: "IT",  Name: "Information Technology" },
  { Code: "HR",  Name: "Human Resources"        },
  { Code: "FIN", Name: "Finance"                },
  { Code: "MKT", Name: "Marketing"              },
  { Code: "OPS", Name: "Operations"             },
];

const positions = [
  { Code: "DIR",  Name: "Director"   },
  { Code: "MGR",  Name: "Manager"    },
  { Code: "LEAD", Name: "Team Lead"  },
  { Code: "SR",   Name: "Senior"     },
  { Code: "JR",   Name: "Junior"     },
];

const statuses = [
  { Code: "ACTIVE",   Name: "Active"   },
  { Code: "INACTIVE", Name: "Inactive" },
  { Code: "ON_LEAVE", Name: "On Leave" },
];

let employees = [
  {
    EmpNo:  1, EmpName: "Alice Nguyen",   DepartmentCode: "IT",  Position: "MGR",
    Status: "ACTIVE",   Email: "alice@example.com",    Phone: "0901-111-001",
    HireDate: "2020-03-15T00:00:00", Salary: 25000000, Address: "Hanoi",    Note: "",
  },
  {
    EmpNo:  2, EmpName: "Bob Tran",       DepartmentCode: "HR",  Position: "SR",
    Status: "ACTIVE",   Email: "bob@example.com",      Phone: "0901-111-002",
    HireDate: "2019-07-01T00:00:00", Salary: 18000000, Address: "HCM City", Note: "",
  },
  {
    EmpNo:  3, EmpName: "Carol Le",       DepartmentCode: "FIN", Position: "LEAD",
    Status: "ON_LEAVE", Email: "carol@example.com",    Phone: "0901-111-003",
    HireDate: "2021-01-10T00:00:00", Salary: 20000000, Address: "Da Nang",  Note: "Maternity leave",
  },
  {
    EmpNo:  4, EmpName: "David Pham",     DepartmentCode: "MKT", Position: "JR",
    Status: "ACTIVE",   Email: "david@example.com",    Phone: "0901-111-004",
    HireDate: "2023-06-01T00:00:00", Salary: 12000000, Address: "Hue",      Note: "",
  },
  {
    EmpNo:  5, EmpName: "Eva Hoang",      DepartmentCode: "OPS", Position: "DIR",
    Status: "ACTIVE",   Email: "eva@example.com",      Phone: "0901-111-005",
    HireDate: "2017-09-20T00:00:00", Salary: 45000000, Address: "Hanoi",    Note: "",
  },
  {
    EmpNo:  6, EmpName: "Frank Vo",       DepartmentCode: "IT",  Position: "SR",
    Status: "ACTIVE",   Email: "frank@example.com",    Phone: "0902-222-006",
    HireDate: "2018-11-05T00:00:00", Salary: 22000000, Address: "Hanoi",    Note: "",
  },
  {
    EmpNo:  7, EmpName: "Grace Dinh",     DepartmentCode: "IT",  Position: "JR",
    Status: "ACTIVE",   Email: "grace@example.com",    Phone: "0902-222-007",
    HireDate: "2024-02-01T00:00:00", Salary: 11000000, Address: "HCM City", Note: "Probation period",
  },
  {
    EmpNo:  8, EmpName: "Henry Bui",      DepartmentCode: "FIN", Position: "MGR",
    Status: "ACTIVE",   Email: "henry@example.com",    Phone: "0902-222-008",
    HireDate: "2016-05-20T00:00:00", Salary: 30000000, Address: "Hanoi",    Note: "",
  },
  {
    EmpNo:  9, EmpName: "Iris Dang",      DepartmentCode: "HR",  Position: "LEAD",
    Status: "ACTIVE",   Email: "iris@example.com",     Phone: "0902-222-009",
    HireDate: "2020-08-12T00:00:00", Salary: 21000000, Address: "Can Tho",  Note: "",
  },
  {
    EmpNo: 10, EmpName: "Jack Ly",        DepartmentCode: "MKT", Position: "SR",
    Status: "INACTIVE", Email: "jack@example.com",     Phone: "0902-222-010",
    HireDate: "2018-03-01T00:00:00", Salary: 17000000, Address: "Da Nang",  Note: "Resigned",
  },
  {
    EmpNo: 11, EmpName: "Karen Ngo",      DepartmentCode: "OPS", Position: "SR",
    Status: "ACTIVE",   Email: "karen@example.com",    Phone: "0903-333-011",
    HireDate: "2019-12-10T00:00:00", Salary: 19000000, Address: "Hai Phong", Note: "",
  },
  {
    EmpNo: 12, EmpName: "Leo Truong",     DepartmentCode: "IT",  Position: "LEAD",
    Status: "ACTIVE",   Email: "leo@example.com",      Phone: "0903-333-012",
    HireDate: "2017-06-15T00:00:00", Salary: 27000000, Address: "Hanoi",    Note: "",
  },
  {
    EmpNo: 13, EmpName: "Mia Vuong",      DepartmentCode: "MKT", Position: "MGR",
    Status: "ACTIVE",   Email: "mia@example.com",      Phone: "0903-333-013",
    HireDate: "2015-09-01T00:00:00", Salary: 28000000, Address: "HCM City", Note: "",
  },
  {
    EmpNo: 14, EmpName: "Nathan Chu",     DepartmentCode: "FIN", Position: "SR",
    Status: "ON_LEAVE", Email: "nathan@example.com",   Phone: "0903-333-014",
    HireDate: "2020-04-20T00:00:00", Salary: 19500000, Address: "Hanoi",    Note: "Medical leave",
  },
  {
    EmpNo: 15, EmpName: "Olivia Ha",      DepartmentCode: "HR",  Position: "JR",
    Status: "ACTIVE",   Email: "olivia@example.com",   Phone: "0903-333-015",
    HireDate: "2023-09-01T00:00:00", Salary: 10500000, Address: "Hue",      Note: "",
  },
];

let nextEmpNo = 16;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(res, data) {
  res.json({ ErrorCode: 0, ErrorMsg: "Success", Data: data });
}

function err(res, msg, code = 1) {
  res.json({ ErrorCode: code, ErrorMsg: msg });
}

function enrichEmployee(emp) {
  const dept = departments.find(d => d.Code === emp.DepartmentCode);
  const pos  = positions.find(p => p.Code === emp.Position);
  const stat = statuses.find(s => s.Code === emp.Status);
  return {
    ...emp,
    DepartmentName: dept ? dept.Name : "",
    PositionName:   pos  ? pos.Name  : "",
    StatusName:     stat ? stat.Name : "",
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/api/auth/login", (req, res) => {
  const { UserId, Password } = req.body || {};
  const user = users.find(u => u.UserId === UserId && u.Password === Password);
  if (!user) return err(res, "Invalid username or password.");
  ok(res, {
    UserId:   user.UserId,
    UserName: user.UserName,
    Role:     user.Role,
    Token:    "token-" + user.UserId + "-" + Date.now(),
  });
});

// ─── Common lookup endpoints ───────────────────────────────────────────────────

app.get("/api/common/departments", (_req, res) => ok(res, departments));
app.get("/api/common/positions",   (_req, res) => ok(res, positions));
app.get("/api/common/statuses",    (_req, res) => ok(res, statuses));

// ─── Employees ────────────────────────────────────────────────────────────────

app.get("/api/employees", (req, res) => {
  const { name, departmentCode, status } = req.query;
  let result = employees.slice();

  if (name)           result = result.filter(e => e.EmpName.toLowerCase().includes(name.toLowerCase()));
  if (departmentCode) result = result.filter(e => e.DepartmentCode === departmentCode);
  if (status)         result = result.filter(e => e.Status === status);

  ok(res, result.map(enrichEmployee));
});

// Batch save: RowType 2=INSERT, 4=UPDATE, 8=DELETE
app.post("/api/employees/batch", (req, res) => {
  const { Dataset } = req.body || {};
  if (!Array.isArray(Dataset) || Dataset.length === 0) {
    return err(res, "No data provided.");
  }

  try {
    for (const item of Dataset) {
      const { RowType, Data } = item;

      if (RowType === 8) {
        // DELETE
        const idx = employees.findIndex(e => e.EmpNo === Data.EmpNo);
        if (idx !== -1) employees.splice(idx, 1);

      } else if (RowType === 2) {
        // INSERT
        const newEmp = {
          EmpNo:          nextEmpNo++,
          EmpName:        Data.EmpName        || "",
          DepartmentCode: Data.DepartmentCode || "",
          Position:       Data.Position       || "",
          Status:         Data.Status         || "ACTIVE",
          Email:          Data.Email          || "",
          Phone:          Data.Phone          || "",
          HireDate:       Data.HireDate       || "",
          Salary:         Data.Salary         || 0,
          Address:        Data.Address        || "",
          Note:           Data.Note           || "",
        };
        employees.push(newEmp);

      } else if (RowType === 4) {
        // UPDATE
        const idx = employees.findIndex(e => e.EmpNo === Data.EmpNo);
        if (idx === -1) return err(res, "Employee not found: EmpNo=" + Data.EmpNo);
        employees[idx] = {
          ...employees[idx],
          EmpName:        Data.EmpName        ?? employees[idx].EmpName,
          DepartmentCode: Data.DepartmentCode ?? employees[idx].DepartmentCode,
          Position:       Data.Position       ?? employees[idx].Position,
          Status:         Data.Status         ?? employees[idx].Status,
          Email:          Data.Email          ?? employees[idx].Email,
          Phone:          Data.Phone          ?? employees[idx].Phone,
          HireDate:       Data.HireDate       ?? employees[idx].HireDate,
          Salary:         Data.Salary         ?? employees[idx].Salary,
          Address:        Data.Address        ?? employees[idx].Address,
          Note:           Data.Note           ?? employees[idx].Note,
        };
      }
    }
    res.json({ ErrorCode: 0, ErrorMsg: "Saved successfully." });
  } catch (e) {
    err(res, "Server error: " + e.message);
  }
});

// ─── Nexacro Transaction Protocol ────────────────────────────────────────────

function escXml(s) {
  return String(s === null || s === undefined ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildDataset(id, columns, rows) {
  let xml = `<Dataset id="${id}">\n<ColumnInfo>\n`;
  for (const c of columns)
    xml += `<Column id="${c.id}" type="${c.type}" size="${c.size}"/>\n`;
  xml += `</ColumnInfo>\n<Rows>\n`;
  for (const row of rows) {
    xml += `<Row>\n`;
    for (const c of columns)
      xml += `<Col id="${c.id}">${escXml(row[c.id])}</Col>\n`;
    xml += `</Row>\n`;
  }
  return xml + `</Rows>\n</Dataset>\n`;
}

function sendNexacro(res, datasets, errorCode, errorMsg) {
  let xml = `<?xml version="1.0" encoding="utf-8"?>\n<NexacroPlatform version="2.0">\n`;
  for (const ds of datasets) xml += buildDataset(ds.id, ds.columns, ds.rows);
  xml += `<Variable id="ErrorCode" type="INT">${errorCode}</Variable>\n`;
  xml += `<Variable id="ErrorMsg" type="STRING">${escXml(errorMsg)}</Variable>\n`;
  xml += `</NexacroPlatform>`;
  res.set("Content-Type", "text/xml; charset=utf-8");
  res.send(xml);
}

function parseNexacroBody(body) {
  const datasets = {};
  if (!body || typeof body !== "string") return datasets;
  const dsRe  = /<Dataset[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/Dataset>/g;
  const rowRe = /<Row([^>]*)>([\s\S]*?)<\/Row>/g;
  const colRe = /<Col[^>]*\bid="([^"]+)"[^>]*(?:\/>|>([\s\S]*?)<\/Col>)/g;
  let dm;
  while ((dm = dsRe.exec(body)) !== null) {
    const rows = [];
    let rm; rowRe.lastIndex = 0;
    while ((rm = rowRe.exec(dm[2])) !== null) {
      const row = {};
      const tm = /\btype="([^"]+)"/.exec(rm[1]);
      if (tm) row._rowType = tm[1];
      let cm; colRe.lastIndex = 0;
      while ((cm = colRe.exec(rm[2])) !== null) {
        row[cm[1]] = (cm[2] || "")
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      }
      rows.push(row);
    }
    datasets[dm[1]] = rows;
  }
  return datasets;
}

const COLS_CODE_NAME = [
  { id: "Code", type: "STRING", size: "10"  },
  { id: "Name", type: "STRING", size: "100" },
];

const COLS_EMPLOYEE = [
  { id: "EmpNo",          type: "INT",        size: "10"  },
  { id: "EmpName",        type: "STRING",     size: "100" },
  { id: "DepartmentCode", type: "STRING",     size: "10"  },
  { id: "DepartmentName", type: "STRING",     size: "100" },
  { id: "Position",       type: "STRING",     size: "10"  },
  { id: "PositionName",   type: "STRING",     size: "100" },
  { id: "Status",         type: "STRING",     size: "10"  },
  { id: "StatusName",     type: "STRING",     size: "100" },
  { id: "Email",          type: "STRING",     size: "100" },
  { id: "Phone",          type: "STRING",     size: "20"  },
  { id: "HireDate",       type: "STRING",     size: "30"  },
  { id: "Salary",         type: "BIGDECIMAL", size: "15"  },
  { id: "Address",        type: "STRING",     size: "200" },
  { id: "Note",           type: "STRING",     size: "500" },
];

const nx = express.Router();
nx.use(express.text({ type: "*/*", limit: "10mb" }));

nx.post("/auth/login", (req, res) => {
  const row  = (parseNexacroBody(req.body).dsLogin || [])[0] || {};
  const user = users.find(u => u.UserId === row.UserId && u.Password === row.Password);
  if (!user) return sendNexacro(res, [], -1, "Invalid username or password.");
  sendNexacro(res, [{
    id: "dsLoginResult",
    columns: [
      { id: "UserId",   type: "STRING", size: "20"  },
      { id: "UserName", type: "STRING", size: "100" },
      { id: "Role",     type: "STRING", size: "20"  },
      { id: "Token",    type: "STRING", size: "200" },
    ],
    rows: [{ UserId: user.UserId, UserName: user.UserName, Role: user.Role,
             Token: "token-" + user.UserId + "-" + Date.now() }],
  }], 0, "Success");
});

nx.post("/common/departments", (_req, res) =>
  sendNexacro(res, [{ id: "dsDepartment", columns: COLS_CODE_NAME, rows: departments }], 0, "Success"));

nx.post("/common/positions", (_req, res) =>
  sendNexacro(res, [{ id: "dsPosition", columns: COLS_CODE_NAME, rows: positions }], 0, "Success"));

nx.post("/common/statuses", (_req, res) =>
  sendNexacro(res, [{ id: "dsStatus", columns: COLS_CODE_NAME, rows: statuses }], 0, "Success"));

nx.post("/employees/list", (req, res) => {
  const search  = (parseNexacroBody(req.body).dsSearch || [])[0] || {};
  const sName   = (search.Name           || "").toLowerCase();
  const sDept   =  search.DepartmentCode || "";
  const sStatus =  search.Status         || "";
  let result = employees.slice();
  if (sName)   result = result.filter(e => e.EmpName.toLowerCase().includes(sName));
  if (sDept)   result = result.filter(e => e.DepartmentCode === sDept);
  if (sStatus) result = result.filter(e => e.Status === sStatus);
  sendNexacro(res, [{ id: "dsEmployee", columns: COLS_EMPLOYEE, rows: result.map(enrichEmployee) }], 0, "Success");
});

nx.post("/employees/save", (req, res) => {
  const rows = parseNexacroBody(req.body).dsEmployee || [];
  for (const row of rows) {
    const t = row._rowType;
    if (t === "delete" || t === "8") {
      const idx = employees.findIndex(e => e.EmpNo === parseInt(row.EmpNo));
      if (idx !== -1) employees.splice(idx, 1);
    } else if (t === "insert" || t === "2") {
      employees.push({
        EmpNo: nextEmpNo++, EmpName: row.EmpName || "", DepartmentCode: row.DepartmentCode || "",
        Position: row.Position || "", Status: row.Status || "ACTIVE", Email: row.Email || "",
        Phone: row.Phone || "", HireDate: row.HireDate || "",
        Salary: parseFloat(row.Salary) || 0, Address: row.Address || "", Note: row.Note || "",
      });
    } else if (t === "update" || t === "4") {
      const idx = employees.findIndex(e => e.EmpNo === parseInt(row.EmpNo));
      if (idx !== -1) employees[idx] = {
        ...employees[idx],
        EmpName: row.EmpName || employees[idx].EmpName,
        DepartmentCode: row.DepartmentCode || employees[idx].DepartmentCode,
        Position: row.Position || employees[idx].Position,
        Status:   row.Status   || employees[idx].Status,
        Email:    row.Email    !== undefined ? row.Email    : employees[idx].Email,
        Phone:    row.Phone    !== undefined ? row.Phone    : employees[idx].Phone,
        HireDate: row.HireDate !== undefined ? row.HireDate : employees[idx].HireDate,
        Salary:   row.Salary   !== undefined ? (parseFloat(row.Salary) || 0) : employees[idx].Salary,
        Address:  row.Address  !== undefined ? row.Address  : employees[idx].Address,
        Note:     row.Note     !== undefined ? row.Note     : employees[idx].Note,
      };
    }
  }
  sendNexacro(res, [], 0, "Saved successfully.");
});

app.use("/nexacro", nx);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
  console.log("Endpoints:");
  console.log("  POST /api/auth/login");
  console.log("  GET  /api/common/departments");
  console.log("  GET  /api/common/positions");
  console.log("  GET  /api/common/statuses");
  console.log("  GET  /api/employees?name=&departmentCode=&status=");
  console.log("  POST /api/employees/batch");
});
