param(
  [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)

$file = Join-Path $ProjectRoot "frontend\src\pages\supervisor\SupervisorOperationsPage.jsx"

if (-not (Test-Path $file)) {
  throw "File not found: $file"
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "$file.$stamp.safe-alias.bak"
Copy-Item $file $backup

$content = Get-Content $file -Raw

# Add safe explicit header mapper once
if ($content -notmatch 'const columnLabels\s*=') {
  $insertAfter = 'import api from "../../services/api";'
  $mapper = @'

const columnLabels = {
  PERSON_ID: "Person ID",
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  FULL_NAME: "Full Name",
  PHONE_NO: "Phone No",
  EMAIL: "Email",
  ADDRESS: "Address",
  DATE_OF_BIRTH: "Date of Birth",
  GENDER: "Gender",
  AGE: "Age",
  EMPLOYEE_ID: "Employee ID",
  SUPERVISOR_ID: "Supervisor ID",
  DOCTOR_ID: "Doctor ID",
  VOLUNTEER_ID: "Volunteer ID",
  JOB_TITLE: "Job Title",
  EMPLOYMENT_STATUS: "Employment Status",
  SPECIALIZATION: "Specialization",
  LICENSE_NO: "License No",
  SALARY_ID: "Salary ID",
  SALARY_DATE: "Salary Date",
  SALARY_AMOUNT: "Salary Amount",
  SALARY_STATUS: "Salary Status",
  RECEIVER_TYPE: "Receiver Type",
  RECEIVER_ID: "Receiver ID",
  EXPENSE_ID: "Expense ID",
};

function getColumnLabel(key) {
  return columnLabels[key] || key.replaceAll("_", " ");
}

function formatCellValue(key, value) {
  if (value == null) return "-";

  if (
    key.includes("DATE") ||
    key === "DATE_OF_BIRTH"
  ) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB");
    }
  }

  return String(value);
}
'@
  $content = $content.Replace(
    $insertAfter,
    $insertAfter + $mapper
  )
}

# Replace only the visible table header rendering.
$content = $content.Replace(
  '<th key={key}>{key}</th>',
  '<th key={key}>{getColumnLabel(key)}</th>'
)

# Replace only generic value rendering inside the SQL view table.
$content = $content.Replace(
  '{value == null ? "-" : String(value)}',
  '{formatCellValue(Object.keys(row)[columnIndex], value)}'
)

Set-Content -Path $file -Value $content -Encoding UTF8

Write-Host "Building frontend..." -ForegroundColor Cyan

Push-Location (Join-Path $ProjectRoot "frontend")
try {
  npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    Copy-Item $backup $file -Force
    throw "Build failed. Original file restored automatically."
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "SAFE VIEW DISPLAY FIX COMPLETE" -ForegroundColor Green
Write-Host "Examples:" -ForegroundColor Cyan
Write-Host "PERSON_ID      -> Person ID"
Write-Host "FIRST_NAME     -> First Name"
Write-Host "DATE_OF_BIRTH  -> Date of Birth"
Write-Host "SALARY_AMOUNT  -> Salary Amount"
Write-Host "Dates are also displayed as DD/MM/YYYY."
Write-Host "Database column names were NOT changed."
Write-Host "Backup: $backup" -ForegroundColor DarkGray
