# MARKFED Telangana — Maize MSP Data Entry Portal
## 360° Technical Specification for Claude Code

**Project:** MARKFED Maize MSP 2400 — Vanakalam 2025-26 — Loans & Utilization Portal  
**G.O No.:** 558 Dated: 04.12.2025 | Total Sanctioned: ₹2421.78 Crores  
**Implementing Entity:** Alliant IT LLP  
**Stack:** NestJS · React · MySQL · Sequelize · JWT Auth  
**Purpose:** Replace the current Excel-based data collection with a multi-role web portal where each level of MARKFED hierarchy fills only their designated fields, auto-calculates derived values, and exports a consolidated Excel/PDF matching the original worksheet format.

---

## 1. PROJECT OVERVIEW

### 1.1 Background
MARKFED Telangana procures Maize at MSP (₹2400/Qtl) each Vanakalam season across multiple districts through PACS/DCMS/FPO networks. Currently, data is collected in two Excel worksheets:
- **Sheet 1 — MD Sheet:** Loan sanction, drawdown, and district-wise fund utilization (26 columns)
- **Sheet 2 — District Farmers Sheet:** Farmer procurement and payment tracking per PACS/district (12 columns)

Different hierarchy levels fill different columns. The portal replicates this model digitally with role-based access, validations, and auto-calculations.

### 1.2 Source Worksheets (verbatim column mapping)

#### Sheet 1: MD Sheet (26 data columns)

| Col | Label | Filled By | Type |
|-----|-------|-----------|------|
| 1 | TOTAL LOAN APPROVED AS PER GO NO | AO-I/CAO | Text |
| 2 | LOAN SANCTIONED BY — NAME OF THE BANK/OTHER SOURCES | AO-I/CAO | Text/Dropdown |
| 3 | ACCOUNT NO. OF THE BANK | AO-I/CAO | Text |
| 4 | DATE OF SANCTION OF LOAN | AO-I/CAO | Date |
| 5 | TOTAL AMOUNT SANCTIONED (IN CRS) | AO-I/CAO | Decimal |
| 6 | TOTAL LOAN AMOUNT DRAWN AS ON TODAY BY HOD (IN CRS) | AO-I/CAO | Decimal |
| 7 | AMOUNT TRANSFERRED TO NAME OF THE BANK | AO-I/CAO | Text |
| 8 | RECEIVED KOTAK BANK ACCOUNT NO. | AO-I/CAO | Text |
| 9 | AMOUNT WITHDRAWN (IN RS.) | AO-I/CAO (per DM row) | Decimal |
| 10 | WITHDRAWN DATE | AO-I/CAO (per DM row) | Date |
| 11 | TRANSFERRED TO DISTRICT MANAGERS ACCOUNT | AO-I/CAO → District dropdown | Dropdown |
| 12 | TRANSFERRED TO DISTRICT MANAGERS ACCOUNT DATE | AO-I/CAO | Date |
| 13 | UTR NO. | AO-I/CAO | Text |
| 14 | TRANSFERRED TOWARDS FARMERS PAYMENTS (IN RS.) | DM | Decimal |
| 15 | TRANSFERRED TOWARDS GUNNIES PAYMENT (IN RS.) | DM | Decimal |
| 16 | TRANSFERRED TOWARDS TRANSPORTATION PAYMENT (IN RS.) | DM | Decimal |
| 17 | TRANSFERRED TOWARDS UNLOADING PAYMENT (IN RS.) | DM | Decimal |
| 18 | PAYMENTS TOWARDS STORAGE CHARGES (SWC/CWC) | DM | Decimal |
| 19 | FERTILISER PAYMENTS TO COMPANIES IF ANY | DM | Decimal |
| 20 | FERTILISER PAYMENTS TO H&T IF ANY | DM | Decimal |
| 21 | OTHER LOAN INTEREST OTHER THAN MAIZE LOAN | DM | Decimal |
| 22 | LOAN MONTHLY INTEREST PAYMENT | DM | Decimal |
| 23 | OTHER LOAN REPAYMENTS | DM | Decimal |
| 24 | OTHERS | DM | Decimal |
| 25 | TOTAL AMOUNT | **AUTO** = SUM(col 14 to 24) | Calculated |
| 26 | REMARKS | DM | Text |

#### Sheet 2: District Farmers Sheet (12 columns, cols 27–37 globally)

| Col | Global# | Label | Filled By | Type |
|-----|---------|-------|-----------|------|
| A | 27 | NAME OF MAIZE PROCUREMENT DISTRICT | DM | Text/Dropdown |
| B | 28 | NO. OF PACS/DCMS/FPO | DM | Integer |
| C | 29 | NAME OF PACS/DCMS/FPO | DM | Dropdown |
| D | 30 | TOTAL NO OF FARMERS BENEFITED DISTRICT WISE | DM | Integer |
| E | 31 | TOTAL QUANTITY PROCURED (IN QTL'S) | DM | Decimal |
| F | 32 | COST OF PROCURED QTY (MSP RATE @ 2400) AS ON DATE | DM | Decimal |
| G | — | (merged/blank) | — | — |
| H | 33 | AMOUNT RECEIVED TOWARDS FARMERS PAYMENTS FROM HO | **AUTO** from MD col 11 (district-wise) | Calculated |
| I | 34 | PAYMENT RELEASED TO THE FARMERS BY DISTRICT MANAGER | DM | Decimal |
| J | 35 | BALANCE AMOUNT TO BE RELEASED TO FARMERS BY DM | **AUTO** = H - I | Calculated |
| K | 36 | BALANCE AMOUNT TO BE RELEASED TO DM FROM HOD | **AUTO** = F - H | Calculated |
| L | 37 | REMARKS | DM | Text |

---

## 2. TECH STACK

| Layer | Technology |
|-------|------------|
| Backend API | NestJS (TypeScript) |
| ORM | Sequelize with TypeScript decorators |
| Database | MySQL 8.x |
| Frontend | React 18 + TypeScript + Vite |
| UI Library | Ant Design 5.x |
| Auth | JWT (access + refresh tokens) |
| File Export | exceljs (xlsx), pdfmake or puppeteer (pdf) |
| State | React Context + useReducer (no Redux needed) |
| Hosting | Node.js server + Nginx reverse proxy |

---

## 3. USER ROLES & PERMISSIONS

### 3.1 Role Definitions

```typescript
enum UserRole {
  SUPER_ADMIN  = 'super_admin',   // Full access, user management
  MD           = 'md',            // Read-only dashboard, export
  AO_CAO       = 'ao_cao',        // Fills MD sheet cols 1–13
  DISTRICT_MANAGER = 'dm',        // Fills MD sheet cols 14–26 + District Farmers sheet
}
```

### 3.2 Field-Level Permissions Matrix

| Field Group | SUPER_ADMIN | MD | AO_CAO | DM |
|-------------|-------------|-----|--------|-----|
| MD cols 1–8 (GO/Loan/Bank) | R/W | R | R/W | R |
| MD cols 9–13 (Drawdown/Transfer per DM) | R/W | R | R/W | R |
| MD cols 14–24 (Utilization) | R/W | R | R | R/W (own district) |
| MD col 25 (Total, auto) | R | R | R | R |
| MD col 26 (Remarks) | R/W | R | R | R/W (own district) |
| Farmers sheet cols 27–32, 34 | R/W | R | R | R/W (own district) |
| Farmers sheet cols 33, 35, 36 (auto) | R | R | R | R |
| User Management | R/W | — | — | — |
| Export all data | R/W | R/W | R/W | R/W (own district) |

### 3.3 DM District Binding
- Each DM user is assigned exactly one district at account creation.
- A DM can only view and edit rows where `district_id = their assigned district`.
- DM cannot see other districts' financial data.

---

## 4. DATABASE SCHEMA

### 4.1 Tables

```sql
-- Users
CREATE TABLE users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('super_admin','md','ao_cao','dm') NOT NULL,
  district_id   INT NULL,               -- only for role=dm
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Districts master
CREATE TABLE districts (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,
  code        VARCHAR(20) NOT NULL UNIQUE,
  is_active   BOOLEAN DEFAULT TRUE
);

-- PACS/DCMS/FPO master
CREATE TABLE pacs_entities (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  name        VARCHAR(200) NOT NULL,
  type        ENUM('PACS','DCMS','FPO') NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Season/GO master
CREATE TABLE seasons (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  season_name         VARCHAR(100) NOT NULL,   -- e.g. "Vanakalam 2025-26"
  crop                VARCHAR(50) NOT NULL,    -- e.g. "Maize"
  msp_rate            DECIMAL(10,2) NOT NULL,  -- 2400.00
  go_number           VARCHAR(50) NOT NULL,    -- "558"
  go_date             DATE NOT NULL,           -- 2025-12-04
  total_sanctioned_cr DECIMAL(12,2) NOT NULL,  -- 2421.78
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          DATETIME DEFAULT NOW()
);

-- MD Sheet: Loan/Drawdown header (one per season, AO-CAO fills)
CREATE TABLE loan_sanction (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  season_id             INT NOT NULL,
  go_reference          VARCHAR(100),          -- col 1
  bank_name             VARCHAR(100),          -- col 2
  bank_account_no       VARCHAR(50),           -- col 3
  sanction_date         DATE,                  -- col 4
  total_sanctioned_cr   DECIMAL(12,2),         -- col 5
  total_drawn_cr        DECIMAL(12,2),         -- col 6
  transfer_bank_name    VARCHAR(100),          -- col 7
  kotak_account_no      VARCHAR(50),           -- col 8
  updated_by            INT,
  updated_at            DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (season_id) REFERENCES seasons(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- MD Sheet: Per-district drawdown rows (AO-CAO fills cols 9–13)
CREATE TABLE district_drawdowns (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  season_id             INT NOT NULL,
  district_id           INT NOT NULL,
  amount_withdrawn_rs   DECIMAL(14,2),         -- col 9
  withdrawn_date        DATE,                  -- col 10
  -- col 11 = district name (derived from district_id)
  transfer_date         DATE,                  -- col 12
  utr_no                VARCHAR(50),           -- col 13
  created_by            INT,
  updated_by            INT,
  created_at            DATETIME DEFAULT NOW(),
  updated_at            DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (season_id) REFERENCES seasons(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- MD Sheet: Per-district utilization (DM fills cols 14–26)
CREATE TABLE district_utilization (
  id                          INT PRIMARY KEY AUTO_INCREMENT,
  season_id                   INT NOT NULL,
  district_id                 INT NOT NULL,
  drawdown_id                 INT,             -- links to district_drawdowns row
  farmers_payment_rs          DECIMAL(14,2) DEFAULT 0,   -- col 14
  gunnies_payment_rs          DECIMAL(14,2) DEFAULT 0,   -- col 15
  transportation_payment_rs   DECIMAL(14,2) DEFAULT 0,   -- col 16
  unloading_payment_rs        DECIMAL(14,2) DEFAULT 0,   -- col 17
  storage_charges_rs          DECIMAL(14,2) DEFAULT 0,   -- col 18
  fertiliser_companies_rs     DECIMAL(14,2) DEFAULT 0,   -- col 19
  fertiliser_ht_rs            DECIMAL(14,2) DEFAULT 0,   -- col 20
  other_loan_interest_rs      DECIMAL(14,2) DEFAULT 0,   -- col 21
  monthly_interest_rs         DECIMAL(14,2) DEFAULT 0,   -- col 22
  other_loan_repayments_rs    DECIMAL(14,2) DEFAULT 0,   -- col 23
  others_rs                   DECIMAL(14,2) DEFAULT 0,   -- col 24
  -- col 25 total is computed, not stored
  remarks                     TEXT,                      -- col 26
  submitted_at                DATETIME,
  last_saved_at               DATETIME DEFAULT NOW() ON UPDATE NOW(),
  updated_by                  INT,
  FOREIGN KEY (season_id) REFERENCES seasons(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (drawdown_id) REFERENCES district_drawdowns(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- District Farmers Sheet (DM fills)
CREATE TABLE district_farmers (
  id                              INT PRIMARY KEY AUTO_INCREMENT,
  season_id                       INT NOT NULL,
  district_id                     INT NOT NULL,             -- col 27
  pacs_count                      INT DEFAULT 0,            -- col 28
  pacs_entity_id                  INT,                      -- col 29 (dropdown)
  farmers_count                   INT DEFAULT 0,            -- col 30
  quantity_procured_qtl           DECIMAL(14,3) DEFAULT 0,  -- col 31
  cost_of_procured_qty_rs         DECIMAL(16,2) DEFAULT 0,  -- col 32 (auto = qty × 2400)
  -- col 33 = amount_received_from_ho (derived from district_drawdowns.farmers_payment_rs)
  payment_released_to_farmers_rs  DECIMAL(14,2) DEFAULT 0,  -- col 34
  -- col 35 = balance_to_release_to_farmers (auto = col33 - col34)
  -- col 36 = balance_due_from_hod (auto = col32 - col33)
  remarks                         TEXT,                     -- col 37
  last_saved_at                   DATETIME DEFAULT NOW() ON UPDATE NOW(),
  updated_by                      INT,
  FOREIGN KEY (season_id) REFERENCES seasons(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (pacs_entity_id) REFERENCES pacs_entities(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Audit log
CREATE TABLE audit_log (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT,
  action      VARCHAR(50),   -- 'CREATE', 'UPDATE', 'EXPORT', 'LOGIN'
  table_name  VARCHAR(50),
  record_id   INT,
  old_values  JSON,
  new_values  JSON,
  ip_address  VARCHAR(45),
  created_at  DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.2 Computed Fields (never stored, always derived)

| Field | Formula |
|-------|---------|
| MD col 25 — Total Amount | `SUM(col14 + col15 + col16 + col17 + col18 + col19 + col20 + col21 + col22 + col23 + col24)` |
| Farmers col 32 — Cost of Procured Qty | `quantity_procured_qtl × msp_rate (2400)` |
| Farmers col 33 — Amount Received from HO | `district_drawdowns.amount_withdrawn_rs WHERE district = this district AND season = this season` (sum of all drawdown rows for that district) |
| Farmers col 35 — Balance to Release to Farmers | `col33 - col34` |
| Farmers col 36 — Balance Due from HOD | `col32 - col33` |

---

## 5. BACKEND (NestJS) — MODULES & ENDPOINTS

### 5.1 Module Structure

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── districts/
│   ├── districts.module.ts
│   ├── districts.controller.ts
│   └── districts.service.ts
├── pacs/
│   ├── pacs.module.ts
│   ├── pacs.controller.ts
│   └── pacs.service.ts
├── seasons/
│   ├── seasons.module.ts
│   ├── seasons.controller.ts
│   └── seasons.service.ts
├── loan-sanction/
│   ├── loan-sanction.module.ts
│   ├── loan-sanction.controller.ts
│   └── loan-sanction.service.ts
├── district-drawdowns/
│   ├── district-drawdowns.module.ts
│   ├── district-drawdowns.controller.ts
│   └── district-drawdowns.service.ts
├── district-utilization/
│   ├── district-utilization.module.ts
│   ├── district-utilization.controller.ts
│   └── district-utilization.service.ts
├── district-farmers/
│   ├── district-farmers.module.ts
│   ├── district-farmers.controller.ts
│   └── district-farmers.service.ts
├── export/
│   ├── export.module.ts
│   ├── export.controller.ts
│   └── export.service.ts
├── audit/
│   ├── audit.module.ts
│   └── audit.service.ts
└── dashboard/
    ├── dashboard.module.ts
    └── dashboard.controller.ts
```

### 5.2 All API Endpoints

#### Auth
```
POST   /auth/login               → { email, password } → { access_token, refresh_token, user }
POST   /auth/refresh             → { refresh_token } → { access_token }
POST   /auth/logout              → invalidate token
GET    /auth/me                  → current user profile
```

#### Users (SUPER_ADMIN only)
```
GET    /users                    → list all users
POST   /users                    → create user { name, email, password, role, district_id? }
GET    /users/:id                → user detail
PATCH  /users/:id                → update user
DELETE /users/:id                → deactivate user (soft delete)
POST   /users/:id/reset-password → send reset link
```

#### Districts (all roles read, SUPER_ADMIN write)
```
GET    /districts                → list all districts
POST   /districts                → create district { name, code }
PATCH  /districts/:id            → update district
```

#### PACS Entities (all roles read, SUPER_ADMIN write)
```
GET    /pacs?district_id=        → list PACS for a district
POST   /pacs                     → create pacs_entity
PATCH  /pacs/:id                 → update
```

#### Seasons
```
GET    /seasons                  → list all seasons
POST   /seasons                  → create season (SUPER_ADMIN)
GET    /seasons/active           → current active season
PATCH  /seasons/:id              → update season
```

#### Loan Sanction (AO_CAO fills, all roles read)
```
GET    /loan-sanction/:season_id         → get current loan sanction record
PUT    /loan-sanction/:season_id         → upsert (create or update) loan sanction
                                           Body: { go_reference, bank_name, bank_account_no,
                                                   sanction_date, total_sanctioned_cr,
                                                   total_drawn_cr, transfer_bank_name,
                                                   kotak_account_no }
```

#### District Drawdowns (AO_CAO fills)
```
GET    /drawdowns/:season_id                     → list all drawdown rows
GET    /drawdowns/:season_id/:district_id        → rows for one district
POST   /drawdowns/:season_id                     → add drawdown row
                                                   Body: { district_id, amount_withdrawn_rs,
                                                           withdrawn_date, transfer_date, utr_no }
PATCH  /drawdowns/:season_id/:drawdown_id        → update a drawdown row
DELETE /drawdowns/:season_id/:drawdown_id        → delete a drawdown row
```

#### District Utilization (DM fills cols 14–26)
```
GET    /utilization/:season_id                   → all districts (SUPER_ADMIN/AO_CAO/MD)
GET    /utilization/:season_id/:district_id      → own district (DM sees only own)
PUT    /utilization/:season_id/:district_id      → upsert utilization
                                                   Body: { farmers_payment_rs,
                                                           gunnies_payment_rs,
                                                           transportation_payment_rs,
                                                           unloading_payment_rs,
                                                           storage_charges_rs,
                                                           fertiliser_companies_rs,
                                                           fertiliser_ht_rs,
                                                           other_loan_interest_rs,
                                                           monthly_interest_rs,
                                                           other_loan_repayments_rs,
                                                           others_rs, remarks }
```

#### District Farmers (DM fills)
```
GET    /farmers/:season_id                       → all districts summary
GET    /farmers/:season_id/:district_id          → own district (DM sees only own)
PUT    /farmers/:season_id/:district_id          → upsert farmers data
                                                   Body: { pacs_count, pacs_entity_id,
                                                           farmers_count,
                                                           quantity_procured_qtl,
                                                           payment_released_to_farmers_rs,
                                                           remarks }
```

#### Dashboard
```
GET    /dashboard/summary/:season_id             → aggregate totals for MD view
                                                   Returns: { total_sanctioned, total_drawn,
                                                              total_utilised, district_wise_summary[] }
GET    /dashboard/district/:season_id/:district_id → district-specific summary
```

#### Export
```
GET    /export/excel/:season_id                  → download .xlsx matching original format
GET    /export/excel/:season_id/:district_id     → single-district xlsx
GET    /export/pdf/:season_id                    → PDF summary report
POST   /export/email/:season_id                  → email report to configured recipients
```

### 5.3 Guards & Interceptors

```typescript
// Role guard usage
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AO_CAO, UserRole.SUPER_ADMIN)
@Put('loan-sanction/:season_id')
async upsertLoanSanction(...) {}

// District ownership check middleware (DM can only access own district)
// In utilization/farmers services:
if (currentUser.role === UserRole.DM &&
    currentUser.district_id !== requestedDistrictId) {
  throw new ForbiddenException('Access denied to this district');
}

// Audit interceptor — logs all mutating requests automatically
@Injectable()
export class AuditInterceptor implements NestInterceptor { ... }
```

---

## 6. FRONTEND (React) — SCREENS & COMPONENTS

### 6.1 Route Structure

```
/login                          → LoginPage (all roles)
/dashboard                      → DashboardPage (role-based view)
/data-entry/loan                → LoanSanctionForm (AO_CAO, SUPER_ADMIN)
/data-entry/drawdowns           → DrawdownsForm (AO_CAO, SUPER_ADMIN)
/data-entry/utilization         → UtilizationForm (DM, SUPER_ADMIN)
/data-entry/farmers             → FarmersForm (DM, SUPER_ADMIN)
/reports/md-sheet               → MDSheetView (all roles — read-only consolidated)
/reports/farmers-sheet          → FarmersSheetView (all roles — read-only consolidated)
/admin/users                    → UserManagement (SUPER_ADMIN only)
/admin/districts                → DistrictManagement (SUPER_ADMIN only)
/admin/pacs                     → PACSManagement (SUPER_ADMIN only)
/admin/seasons                  → SeasonManagement (SUPER_ADMIN only)
```

### 6.2 Screen-by-Screen Specification

---

#### Screen: Login Page
**Route:** `/login`  
**Roles:** All (unauthenticated)

**Fields:**
- Email input (required, email format)
- Password input (required, min 8 chars)
- Submit button — "Login"

**Events:**
- `onSubmit` → POST /auth/login → store JWT in httpOnly cookie or localStorage
- On success → redirect to `/dashboard`
- On fail → show error message inline

**Post-login redirect logic:**
```
role === 'md'       → /dashboard (read-only view)
role === 'ao_cao'   → /data-entry/loan
role === 'dm'       → /data-entry/utilization
role === 'super_admin' → /dashboard
```

---

#### Screen: Dashboard
**Route:** `/dashboard`  
**Roles:** All

**Components:**
- Season selector dropdown (GET /seasons/active, falls back to list)
- Summary cards row:
  - Total Sanctioned (₹ Crores)
  - Total Drawn by HOD (₹ Crores)
  - Total Utilised (₹ Crores)
  - Balance (= Drawn − Utilised, auto)
- District-wise utilization table:
  - Columns: District | Amount Received | Farmers Paid | Gunnies | Transport | Unloading | Storage | Total | Balance
  - DM: shows only their district row
  - AO_CAO/MD/SUPER_ADMIN: all districts
- Quick action buttons:
  - "Fill Loan Data" (AO_CAO/SUPER_ADMIN) → /data-entry/loan
  - "Fill My Utilization" (DM/SUPER_ADMIN) → /data-entry/utilization
  - "Export Excel" (all) → GET /export/excel/:season_id

**Events:**
- `onSeasonChange(seasonId)` → re-fetch all dashboard data
- `onExport()` → trigger file download

---

#### Screen: Loan Sanction Form
**Route:** `/data-entry/loan`  
**Roles:** AO_CAO, SUPER_ADMIN

**This is a SINGLE-ROW form (one record per season). Corresponds to MD Sheet cols 1–8.**

**Form Fields:**

| Field | Type | Validation | Maps To |
|-------|------|-----------|---------|
| GO Reference | Text | Required | col 1 |
| Bank Name | Text + Dropdown | Required (Bank of India, etc.) | col 2 |
| Bank Account No. | Text | Required, max 30 chars | col 3 |
| Sanction Date | Date picker | Required, not future | col 4 |
| Total Amount Sanctioned (Cr) | Number | Required, > 0, 2 decimal | col 5 |
| Total Amount Drawn by HOD (Cr) | Number | Required, ≤ Sanctioned | col 6 |
| Transfer Bank Name | Text | Optional | col 7 |
| Kotak Account No. | Text | Optional | col 8 |

**Buttons:**
- "Save Draft" → PUT /loan-sanction/:season_id (no validation except required)
- "Submit" → validate all + PUT /loan-sanction/:season_id with `status: 'submitted'`

**Events:**
- `onChange(field, value)` → update form state
- `onSaveDraft()` → API call, show success toast
- `onSubmit()` → validate, confirm dialog, API call

---

#### Screen: Drawdowns Form (AO_CAO fills per-district transfer rows)
**Route:** `/data-entry/drawdowns`  
**Roles:** AO_CAO, SUPER_ADMIN

**This is a MULTI-ROW table. Each row = one district receiving funds. Corresponds to MD cols 9–13.**

**Table columns:**

| Column | Type | Validation |
|--------|------|-----------|
| District (col 11) | Dropdown (districts list) | Required, unique per season |
| Amount Withdrawn (col 9) | Number | Required, > 0 |
| Withdrawn Date (col 10) | Date | Required |
| Transfer Date (col 12) | Date | Required, ≥ Withdrawn Date |
| UTR No. (col 13) | Text | Required |
| Actions | Edit / Delete icons | — |

**Above table:** Show running total of amounts withdrawn vs loan sanctioned.

**Buttons:**
- "+ Add District Transfer" → open inline row or modal
- "Save All" → PATCH each modified row

**Events:**
- `onAddRow()` → append empty row in edit mode
- `onEditRow(id)` → toggle row to editable inputs
- `onSaveRow(id, data)` → PATCH /drawdowns/:season_id/:id
- `onDeleteRow(id)` → confirm dialog → DELETE /drawdowns/:season_id/:id
- `onDistrictChange(districtId)` → check: district not already added this season

---

#### Screen: Utilization Form (DM fills cols 14–26)
**Route:** `/data-entry/utilization`  
**Roles:** DM, SUPER_ADMIN

**For DM:** Pre-filtered to their district. Show district name as heading.  
**For SUPER_ADMIN:** District selector dropdown to pick which district to fill.

**Displayed above form (read-only, from drawdowns):**
- District name
- Amount received from HOD (sum of drawdown rows for this district)
- Drawdown date(s) and UTR no(s)

**Form Fields (one set per district):**

| Field | Type | Validation | Maps To |
|-------|------|-----------|---------|
| Farmers Payment | Number | ≥ 0 | col 14 |
| Gunnies Payment | Number | ≥ 0 | col 15 |
| Transportation Payment | Number | ≥ 0 | col 16 |
| Unloading Payment | Number | ≥ 0 | col 17 |
| Storage Charges (SWC/CWC) | Number | ≥ 0 | col 18 |
| Fertiliser — Companies | Number | ≥ 0 | col 19 |
| Fertiliser — H&T | Number | ≥ 0 | col 20 |
| Other Loan Interest | Number | ≥ 0 | col 21 |
| Monthly Interest Payment | Number | ≥ 0 | col 22 |
| Other Loan Repayments | Number | ≥ 0 | col 23 |
| Others | Number | ≥ 0 | col 24 |
| Remarks | Textarea | Optional, max 500 | col 26 |

**Auto-calculated display (below form, non-editable):**
- **Total Utilised** = sum of cols 14–24 (updates live as fields change)
- **Balance with DM** = Amount Received from HOD − Total Utilised

**Warning:** If Total Utilised > Amount Received from HOD → show red warning banner.

**Buttons:**
- "Save Draft" → PUT /utilization/:season_id/:district_id
- "Submit for Review" → same API, `status: 'submitted'`

**Events:**
- `onChange(field, value)` → update state, recalculate total live
- `onSave()` → API call + toast
- `onSubmit()` → validation + confirm dialog + API

---

#### Screen: Farmers Form (DM fills District Farmers sheet)
**Route:** `/data-entry/farmers`  
**Roles:** DM, SUPER_ADMIN

**For DM:** Pre-filtered to their district.  
**For SUPER_ADMIN:** District selector.

**Form Fields:**

| Field | Type | Validation | Maps To |
|-------|------|-----------|---------|
| District | Display only (DM) / Dropdown (SA) | — | col 27 |
| No. of PACS/DCMS/FPO | Integer | ≥ 1 | col 28 |
| Name of PACS/DCMS/FPO | Dropdown (from pacs_entities) | Required | col 29 |
| Total Farmers Benefited | Integer | ≥ 1 | col 30 |
| Total Qty Procured (Qtls) | Decimal (3 places) | ≥ 0 | col 31 |
| Payment Released to Farmers | Decimal | ≥ 0 | col 34 |
| Remarks | Textarea | Optional | col 37 |

**Auto-calculated display (non-editable):**
- **Cost of Procured Qty** = Qty × ₹2400 (updates live) → col 32
- **Amount Received from HO** = pulled from district_drawdowns.farmers_payment → col 33
- **Balance to Release to Farmers** = col33 − col34 → col 35
- **Balance Due from HOD** = col32 − col33 → col 36

**Warning:** If Payment Released > Amount Received from HO → show warning.

**Events:**
- `onQtyChange(value)` → recalculate cost live (× 2400)
- `onPaymentChange(value)` → recalculate balances live
- `onPACSChange(id)` → update pacs_entity_id
- `onSave()` → PUT /farmers/:season_id/:district_id
- `onSubmit()` → validate + confirm + PUT

---

#### Screen: MD Sheet Report (consolidated read-only view)
**Route:** `/reports/md-sheet`  
**Roles:** All (DM sees only own row highlighted)

**Renders the combined MD Sheet in a wide horizontal scrollable table matching original worksheet layout.**

Columns grouped visually:
1. **Loan Section** (cols 1–8) — one header row
2. **Drawdown/Transfer Section** (cols 9–13) — per-district rows
3. **Utilization Section** (cols 14–25) — DM-filled data
4. **Total + Remarks** (cols 25–26)

Rows: one per district drawdown entry.  
Last row: **TOTALS** (sum of all numeric columns).

**Features:**
- Season selector
- "Export Excel" button → GET /export/excel/:season_id
- "Export PDF" button → GET /export/pdf/:season_id
- Column highlighting by role: AO fields in blue tint, DM fields in green tint, auto fields in gray tint
- DM's own district row highlighted in yellow

---

#### Screen: District Farmers Sheet Report
**Route:** `/reports/farmers-sheet`  
**Roles:** All (DM sees own row highlighted)

**Renders District Farmers sheet in table.**

Columns: col 27–37.  
Auto-calculated columns (33, 35, 36) highlighted distinctly.  
Last row: TOTALS.  
Export buttons same as MD sheet.

---

#### Screen: User Management
**Route:** `/admin/users`  
**Roles:** SUPER_ADMIN only

**Table:** Name | Email | Role | District (for DM) | Status | Actions

**Add User Modal Fields:**
- Name (required)
- Email (required, unique)
- Password (required, min 8 chars)
- Role dropdown (super_admin / md / ao_cao / dm)
- District dropdown (shown only if role = dm, required then)
- Active toggle

**Events:**
- `onAdd()` → POST /users
- `onEdit(id)` → PATCH /users/:id
- `onDeactivate(id)` → PATCH /users/:id { is_active: false }
- `onResetPassword(id)` → POST /users/:id/reset-password

---

### 6.3 Shared Components

```
components/
├── AppLayout.tsx          - Sidebar nav + top bar, role-adaptive menu items
├── ProtectedRoute.tsx     - Redirects to /login if no valid token
├── RoleGuard.tsx          - Shows/hides children based on role
├── SeasonSelector.tsx     - Dropdown for season, stored in context
├── CurrencyInput.tsx      - Number input formatting to Indian Rupees
├── AutoCalcField.tsx      - Read-only field showing computed value with formula tooltip
├── SaveDraftButton.tsx    - Shows "Saved X mins ago" status
├── ExportButton.tsx       - Triggers file download with loading state
├── DataTable.tsx          - Scrollable table with sticky header + footer totals row
└── AuditBadge.tsx         - Shows "Last updated by [name] on [date]"
```

---

## 7. BUSINESS LOGIC / CALCULATION RULES

### 7.1 MD Sheet — Total Utilization (col 25)

```typescript
function calcTotalUtilization(u: DistrictUtilization): number {
  return (
    (u.farmers_payment_rs || 0) +
    (u.gunnies_payment_rs || 0) +
    (u.transportation_payment_rs || 0) +
    (u.unloading_payment_rs || 0) +
    (u.storage_charges_rs || 0) +
    (u.fertiliser_companies_rs || 0) +
    (u.fertiliser_ht_rs || 0) +
    (u.other_loan_interest_rs || 0) +
    (u.monthly_interest_rs || 0) +
    (u.other_loan_repayments_rs || 0) +
    (u.others_rs || 0)
  );
}
```

### 7.2 District Farmers — Auto Calculations

```typescript
// col 32: Cost of procured qty
const costRs = quantityProcuredQtl * MSP_RATE; // MSP_RATE = 2400

// col 33: Amount received from HO
// Sum of all district_drawdowns.amount_withdrawn_rs for this district + season
const amountReceivedFromHO = await drawdownsService.sumByDistrict(seasonId, districtId);

// col 35: Balance to release to farmers
const balanceToFarmers = amountReceivedFromHO - paymentReleasedToFarmers;

// col 36: Balance due from HOD
const balanceDueFromHOD = costRs - amountReceivedFromHO;
```

### 7.3 Validation Rules

```
Loan Sanction:
- total_drawn_cr MUST BE ≤ total_sanctioned_cr
- sanction_date MUST NOT BE in the future

District Drawdowns:
- Each district can have MULTIPLE drawdown rows per season (multiple transfers allowed)
- transfer_date MUST BE ≥ withdrawn_date
- amount_withdrawn_rs MUST BE > 0
- Sum of all drawdown amounts MUST NOT EXCEED total_drawn_cr from loan_sanction

District Utilization:
- All numeric fields MUST BE ≥ 0
- Total utilization SHOULD NOT EXCEED sum of district drawdowns (warning, not hard block)
- farmers_payment in utilization SHOULD MATCH payment context in Farmers sheet (advisory only)

District Farmers:
- quantity_procured_qtl MUST BE > 0
- payment_released_to_farmers_rs MUST BE ≤ amount_received_from_ho (soft warning)
- pacs_count MUST BE ≥ 1
```

---

## 8. EXPORT — EXCEL FORMAT SPEC

The exported Excel file must **exactly match** the original worksheet format.

### 8.1 Sheet 1 (MD Sheet) Structure

```
Row 1: Title merged across all columns
Row 2: Section headers (Loan, Utilization groups)
Row 3: Sub-headers (per-column labels)
Row 4: "AO-I/CAO" designation row
Row 5: Column numbers (1-26)
Row 6+: Data rows (one per district drawdown)
Last Row: TOTALS row with SUM formulas
```

**Styling:**
- Title row: bold, font size 12, green fill (#276644), white text
- Header rows: bold, light green fill (#dff2e8)
- AO-CAO columns (1–13): light blue tint (#dbeafe)
- DM columns (14–24): light green tint (#dff2e8)
- Auto columns (25): light gray (#f3f4f6)
- Number columns: right-aligned, Indian number format (using exceljs numFmt)
- Borders: thin all cells

### 8.2 Sheet 2 (District Farmers) Structure

```
Row 1: Sheet title (merged)
Row 2: Column headers
Row 3: "DM" / "Auto" designation row
Row 4: Column numbers (27–37)
Row 5+: Data rows (one per district)
Last Row: TOTALS
```

### 8.3 Export Service Key Functions

```typescript
// export.service.ts
async generateExcel(seasonId: number, districtId?: number): Promise<Buffer>
async generatePdf(seasonId: number): Promise<Buffer>

// Inside generateExcel:
// 1. Fetch loan_sanction record
// 2. Fetch all district_drawdowns (or filtered by districtId)
// 3. Fetch all district_utilization
// 4. Compute col 25 for each row
// 5. Fetch all district_farmers
// 6. Compute cols 33, 35, 36
// 7. Build workbook with exceljs
// 8. Add Sheet 1 with exact format
// 9. Add Sheet 2 with exact format
// 10. Return buffer for download
```

---

## 9. AUTHENTICATION & SECURITY

### 9.1 JWT Strategy

```typescript
// Access token: 8 hours expiry
// Refresh token: 7 days expiry
// Store: access token in memory (React state), refresh token in httpOnly cookie

// Payload:
{
  sub: userId,
  email: user.email,
  role: user.role,
  district_id: user.district_id   // null for non-DM roles
}
```

### 9.2 Password Policy
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- bcrypt hash with salt rounds = 12
- Force password change on first login

### 9.3 API Security
- All endpoints except `/auth/login` require valid JWT
- Role checks via `@Roles()` decorator + RolesGuard
- District ownership checks in service layer
- Rate limiting: 100 requests/minute per IP (throttler)
- CORS: whitelist only frontend origin

---

## 10. NOTIFICATIONS & STATUS

### 10.1 Toast Notifications (Frontend)
- Save Draft success: "Draft saved" (green, 2s)
- Submit success: "Data submitted successfully" (green, 3s)
- Validation error: "Please fill all required fields" (red, 5s)
- Network error: "Connection error. Please retry." (red, 5s)
- Over-utilization warning: "Total utilization exceeds received amount" (amber, persistent)

### 10.2 Submission Status Tracking (per district per season)
- `not_started` → DM has not opened form yet
- `draft` → DM has saved but not submitted
- `submitted` → DM submitted; shown in dashboard
- `acknowledged` → AO_CAO or SUPER_ADMIN has viewed

Status badges shown in dashboard and admin views.

---

## 11. SIDEBAR NAVIGATION (role-adaptive)

```
All roles:
  - Dashboard

AO_CAO:
  - Data Entry
    - Loan Sanction (cols 1-8)
    - District Transfers (cols 9-13)
  - Reports
    - MD Sheet View
    - Farmers Sheet View
  - Export

DM:
  - Data Entry
    - Utilization (cols 14-26)
    - Farmers Data (sheet 2)
  - Reports
    - My District Report
  - Export

MD:
  - Dashboard
  - Reports (read-only)
    - MD Sheet
    - Farmers Sheet
  - Export

SUPER_ADMIN:
  - All of above +
  - Admin
    - Users
    - Districts
    - PACS/Entities
    - Seasons
```

---

## 12. SEED DATA

```sql
-- Seed: Active season
INSERT INTO seasons VALUES (1, 'Vanakalam 2025-26', 'Maize', 2400.00,
  '558', '2025-12-04', 2421.78, TRUE, NOW());

-- Seed: Telangana Maize Procurement Districts
INSERT INTO districts (name, code) VALUES
  ('Nalgonda', 'NLG'),
  ('Suryapet', 'SRY'),
  ('Khammam', 'KHM'),
  ('Bhadradri Kothagudem', 'BDK'),
  ('Mahabubabad', 'MBD'),
  ('Warangal', 'WGL'),
  ('Karimnagar', 'KRM'),
  ('Nizamabad', 'NZB');

-- Seed: Default SUPER_ADMIN user
INSERT INTO users (name, email, password_hash, role) VALUES
  ('System Admin', 'admin@markfed.telangana.gov.in',
   '$2b$12$...', 'super_admin');
```

---

## 13. FOLDER STRUCTURE (monorepo)

```
markfed-maize-portal/
├── backend/                      NestJS API
│   ├── src/
│   ├── test/
│   ├── .env.example
│   └── package.json
├── frontend/                     React + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── api/                  Axios instance + per-module hooks
│   │   ├── utils/
│   │   └── types/
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 14. ENVIRONMENT VARIABLES

```env
# Backend .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=markfed_maize
DB_USER=markfed_user
DB_PASS=secure_password
JWT_SECRET=long_random_secret_here
JWT_REFRESH_SECRET=another_long_secret
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
PORT=4000

# Frontend .env
VITE_API_URL=http://localhost:4000
```

---

## 15. BUILD & RUN

```bash
# Backend
cd backend && npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run start:dev

# Frontend
cd frontend && npm install
npm run dev

# Production
npm run build  # both
# Serve frontend via Nginx, backend via PM2
```

---

## 16. SUMMARY CHECKLIST FOR CLAUDE CODE

When picking this up, implement in this order:

1. **Database** — Create MySQL schema from Section 4
2. **NestJS Auth module** — JWT login, guards, roles decorator
3. **NestJS CRUD modules** — in order: seasons → districts → pacs → users → loan-sanction → drawdowns → utilization → farmers → dashboard → export
4. **Frontend scaffolding** — Vite + React + AntD + routing + auth context
5. **Login page** + JWT storage + protected routes
6. **Dashboard** page
7. **Loan Sanction form** (AO_CAO)
8. **Drawdowns form** (AO_CAO)
9. **Utilization form** (DM)
10. **Farmers form** (DM)
11. **MD Sheet report view** (read-only table)
12. **Farmers Sheet report view** (read-only table)
13. **Excel export** (exceljs, exact format)
14. **Admin pages** (User/District/PACS management)
15. **Seed data** for districts + default admin
16. **Audit logging** interceptor

**Do NOT deviate from the column mapping in Section 2 — the exported Excel must match the original worksheet exactly.**
