const express = require("express");
const cors    = require("cors");
const xml2js  = require("xml2js");

const app  = express();
const PORT = 5000;

app.use(cors());

// Raw body reader — must come before any route handler.
// Nexacro sends Content-Type: text/xml with an NDP XML envelope, so the standard
// express.urlencoded / express.json parsers never fire. We capture the raw body
// here and parse the NDP envelope ourselves.
app.use((req, res, next) => {
  const chunks = [];
  req.on("data", chunk => chunks.push(chunk));
  req.on("end", () => {
    req.rawBody = Buffer.concat(chunks).toString("utf8");
    req.body    = {};   // keep req.body defined so old code doesn't crash
    next();
  });
  req.on("error", next);
});

// ─── NDP (Nexacro Data Protocol) Helpers ─────────────────────────────────────

function escXml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDatasetXml(dsId, columns, rows) {
  let xml = `  <Dataset id="${dsId}">\n    <ColumnInfo>\n`;
  for (const col of columns) {
    xml += `      <Column id="${col.id}" type="${col.type}" size="${col.size}"/>\n`;
  }
  xml += "    </ColumnInfo>\n    <Rows>\n";
  for (const row of rows) {
    xml += "      <Row>\n";
    for (const col of columns) {
      const v = row[col.id] != null ? row[col.id] : "";
      xml += `        <Col id="${col.id}">${escXml(String(v))}</Col>\n`;
    }
    xml += "      </Row>\n";
  }
  xml += "    </Rows>\n  </Dataset>\n";
  return xml;
}

function ndpSend(res, errorCode, errorMsg, datasetXmls = []) {
  let xml  = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<Root xmlns="http://www.nexacro.com/platform/dataset">\n';
  xml += "  <Parameters>\n";
  xml += `    <Parameter id="ErrorCode">${errorCode}</Parameter>\n`;
  xml += `    <Parameter id="ErrorMsg">${escXml(String(errorMsg))}</Parameter>\n`;
  xml += "  </Parameters>\n";
  for (const dsXml of datasetXmls) xml += dsXml;
  xml += "</Root>";
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.send(xml);
}

function ndpOk(res, datasetXmls = []) { ndpSend(res, 0, "Success", datasetXmls); }
function ndpErr(res, msg, code = 1)   { ndpSend(res, code, msg); }

// Parse the full NDP XML envelope that Nexacro sends (Content-Type: text/xml).
//
// Returns { params, datasets } where:
//   params   — flat object of <Parameter> values, with embedded args unpacked
//              e.g. Nexacro packs "name=Alice&status=ACTIVE" into a single
//              <Parameter id="name">Alice&status=ACTIVE</Parameter>; we split
//              on "&" so params ends up as { name: "Alice", status: "ACTIVE" }.
//   datasets — object keyed by dataset id, value is an array of row objects
//              identical in shape to what parseDatasetXml used to return.
async function parseNdpEnvelope(rawXml) {
  if (!rawXml) return { params: {}, datasets: {} };
  try {
    const parsed = await xml2js.parseStringPromise(rawXml, {
      explicitArray:   true,
      explicitCharkey: true,
    });

    const root = parsed.Root;
    if (!root) return { params: {}, datasets: {} };

    // ── Parameters ──────────────────────────────────────────────────────────
    const params = {};
    for (const p of root.Parameters?.[0]?.Parameter || []) {
      const id  = p.$?.id;
      const val = p._ !== undefined ? String(p._) : "";
      if (!id) continue;

      // Nexacro puts the entire args string as one parameter:
      //   "UserId=admin&Password=admin" → <Parameter id="UserId">admin&Password=admin</Parameter>
      // The first segment before "&" is the real value for this key;
      // remaining segments are additional key=value pairs.
      if (val.includes("&")) {
        const ampIdx = val.indexOf("&");
        params[id] = val.substring(0, ampIdx);
        for (const part of val.substring(ampIdx + 1).split("&")) {
          const eqIdx = part.indexOf("=");
          if (eqIdx !== -1) params[part.substring(0, eqIdx)] = part.substring(eqIdx + 1);
        }
      } else {
        params[id] = val;
      }
    }

    // ── Datasets ─────────────────────────────────────────────────────────────
    function colVal(el) {
      if (!el) return "";
      if (typeof el === "string") return el;
      return el._ !== undefined ? String(el._) : "";
    }
    function parseRowEls(rowEls, defaultType) {
      return (rowEls || []).map(rowEl => {
        const data = { _type: rowEl.$?.type || defaultType };
        for (const colEl of rowEl.Col || []) {
          if (colEl?.$?.id) data[colEl.$.id] = colVal(colEl);
        }
        return data;
      });
    }

    const datasets = {};
    for (const ds of root.Dataset || []) {
      const id = ds.$?.id;
      if (!id) continue;
      datasets[id] = [
        ...parseRowEls(ds.Rows?.[0]?.Row,        "normal"),
        ...parseRowEls(ds.DeletedRows?.[0]?.Row,  "delete"),
      ];
    }

    return { params, datasets };
  } catch (e) {
    console.error("parseNdpEnvelope error:", e.message);
    return { params: {}, datasets: {} };
  }
}

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
  { Code: "DIR",  Name: "Director"  },
  { Code: "MGR",  Name: "Manager"   },
  { Code: "LEAD", Name: "Team Lead" },
  { Code: "SR",   Name: "Senior"    },
  { Code: "JR",   Name: "Junior"    },
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

// ─── Column definitions (reused across endpoints) ─────────────────────────────

const EMP_COLUMNS = [
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

const CODE_NAME_COLS = [
  { id: "Code", type: "STRING", size: "10"  },
  { id: "Name", type: "STRING", size: "100" },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/api/auth/login", async (req, res) => {
  const { params, datasets } = await parseNdpEnvelope(req.rawBody);

  let UserId = "", Password = "";

  // Prefer dataset approach (form sends dsLogin as inDataset — credentials stay in POST body)
  const loginRows = datasets.dsLogin || [];
  if (loginRows.length > 0) {
    UserId   = loginRows[0].UserId   || "";
    Password = loginRows[0].Password || "";
  } else {
    // Fallback: credentials arrived as NDP Parameters via the args string
    UserId   = params.UserId   || "";
    Password = params.Password || "";
  }

  const user = users.find(u => u.UserId === UserId && u.Password === Password);
  if (!user) return ndpErr(res, "Invalid username or password.");

  const loginColumns = [
    { id: "UserId",   type: "STRING", size: "20"  },
    { id: "UserName", type: "STRING", size: "100" },
    { id: "Role",     type: "STRING", size: "20"  },
    { id: "Token",    type: "STRING", size: "200" },
  ];
  const tokenRows = [{
    UserId:   user.UserId,
    UserName: user.UserName,
    Role:     user.Role,
    Token:    "token-" + user.UserId + "-" + Date.now(),
  }];

  ndpOk(res, [buildDatasetXml("dsLoginResult", loginColumns, tokenRows)]);
});

// ─── Common lookup endpoints ───────────────────────────────────────────────────

app.all("/api/common/departments", (_req, res) => {
  ndpOk(res, [buildDatasetXml("dsDepartment", CODE_NAME_COLS, departments)]);
});

app.all("/api/common/positions", (_req, res) => {
  ndpOk(res, [buildDatasetXml("dsPosition", CODE_NAME_COLS, positions)]);
});

app.all("/api/common/statuses", (_req, res) => {
  ndpOk(res, [buildDatasetXml("dsStatus", CODE_NAME_COLS, statuses)]);
});

// ─── Employees ────────────────────────────────────────────────────────────────

// Filter params arrive as NDP Parameters (Nexacro packs args into the XML envelope)
app.all("/api/employees", async (req, res) => {
  const { params } = await parseNdpEnvelope(req.rawBody);
  const name           = params.name           || "";
  const departmentCode = params.departmentCode || "";
  const status         = params.status         || "";

  let result = employees.slice();
  if (name)           result = result.filter(e => e.EmpName.toLowerCase().includes(name.toLowerCase()));
  if (departmentCode) result = result.filter(e => e.DepartmentCode === departmentCode);
  if (status)         result = result.filter(e => e.Status === status);

  const rows = result.map(e => ({
    ...enrichEmployee(e),
    HireDate: e.HireDate ? e.HireDate.substring(0, 10) : "",
  }));

  ndpOk(res, [buildDatasetXml("dsEmployee", EMP_COLUMNS, rows)]);
});

// Batch save: receives the full dsEmployee dataset in the NDP XML body.
// Nexacro does NOT tag row types with a "type" attribute in the <Rows> section.
// Instead: deleted rows are in <DeletedRows> (_type="delete"), new rows have no
// EmpNo, and existing rows (both unchanged and modified) carry their EmpNo.
app.post("/api/employees/batch", async (req, res) => {
  const { datasets } = await parseNdpEnvelope(req.rawBody);
  const rows = datasets.dsEmployee;
  if (!rows) return ndpErr(res, "No dataset provided.");

  try {
    for (const row of rows) {
      const nEmpNo  = parseInt(row.EmpNo);
      const hasEmpNo = !isNaN(nEmpNo) && nEmpNo > 0;

      const empData = {
        EmpName:        row.EmpName        || "",
        DepartmentCode: row.DepartmentCode || "",
        Position:       row.Position       || "",
        Status:         row.Status         || "ACTIVE",
        Email:          row.Email          || "",
        Phone:          row.Phone          || "",
        HireDate:       row.HireDate ? row.HireDate + "T00:00:00" : "",
        Salary:         parseFloat(row.Salary) || 0,
        Address:        row.Address        || "",
        Note:           row.Note           || "",
      };

      if (row._type === "delete") {
        if (hasEmpNo) {
          const idx = employees.findIndex(e => e.EmpNo === nEmpNo);
          if (idx !== -1) employees.splice(idx, 1);
        }
      } else if (!hasEmpNo) {
        // No EmpNo → INSERT
        employees.push({ EmpNo: nextEmpNo++, ...empData });
      } else {
        // Has EmpNo → upsert (covers both unmodified and modified rows,
        // since Nexacro sends them identically with no type attribute)
        const idx = employees.findIndex(e => e.EmpNo === nEmpNo);
        if (idx !== -1) employees[idx] = { EmpNo: nEmpNo, ...empData };
      }
    }

    ndpSend(res, 0, "Saved successfully.");
  } catch (e) {
    ndpErr(res, "Server error: " + e.message);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
