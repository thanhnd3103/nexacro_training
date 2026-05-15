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
