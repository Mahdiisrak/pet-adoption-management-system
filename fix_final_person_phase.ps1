param(
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
Set-Location $Root

function Save-NoBom([string]$Path, [string]$Content) {
    $full = Join-Path (Get-Location) $Path
    [System.IO.File]::WriteAllText($full,$Content,[System.Text.UTF8Encoding]::new($false))
}

Write-Host "Applying final Person compatibility fixes..."

$path = "backend\routes\personRoutes.js"
$c = Get-Content $path -Raw
$pattern = '(?s)SELECT\s+.*?\s+FROM\s+PERSON(?:\s+\w+)?\s+ORDER\s+BY\s+(?:\w+\.)?PERSON_ID'
$replacement = @'
SELECT
        p.PERSON_ID,
        p.FIRST_NAME,
        p.LAST_NAME,
        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS NAME,
        (
          SELECT LISTAGG(pp.PHONE_NO, ', ')
          WITHIN GROUP (ORDER BY pp.PHONE_NO)
          FROM PERSON_PHONE pp
          WHERE pp.PERSON_ID = p.PERSON_ID
        ) AS PHONE_NO,
        p.EMAIL,
        p.ADDRESS,
        p.DATE_OF_BIRTH,
        p.GENDER
      FROM PERSON p
      ORDER BY p.PERSON_ID
'@
$new = [regex]::Replace($c,$pattern,$replacement,1)
if ($new -eq $c) { Write-Host "personRoutes.js already updated - skipping." }
Save-NoBom $path $new

$path = "backend\routes\staffRoutes.js"
$c = Get-Content $path -Raw

# normalize request destructuring
$c = $c -replace '(?s)const\s*\{(.*?)\}\s*=\s*req\.body;', {
    param($m)
    $body = $m.Groups[1].Value
    $body = $body -replace '\bname\b','firstName'
    $body = $body -replace '\bcontactNo\b','gender'
    if ($body -notmatch '\blastName\b') {
        $body = $body -replace '\bfirstName\s*,','firstName,`r`n      lastName,'
    }
    "const {" + $body + "} = req.body;"
}

$start = $c.IndexOf("INSERT INTO PERSON")
if ($start -lt 0) { throw "INSERT INTO PERSON not found in staffRoutes.js" }
$execStart = $c.LastIndexOf("await connection.execute(", $start)
if ($execStart -lt 0) { throw "Could not locate PERSON insert execute block." }
$after = $c.IndexOf(");", $start)
if ($after -lt 0) { throw "Could not locate end of PERSON insert block." }
$after += 2

$staffBlock = @'
await connection.execute(
        `
        INSERT INTO PERSON
        (
          PERSON_ID,
          FIRST_NAME,
          LAST_NAME,
          EMAIL,
          ADDRESS,
          DATE_OF_BIRTH,
          GENDER
        )
        VALUES
        (
          :personId,
          :firstName,
          :lastName,
          :email,
          :address,
          TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
          :gender
        )
        `,
        {
          personId: personId.trim().toUpperCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email || null,
          address: address || null,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
        }
      );

      if (phoneNo && phoneNo.trim()) {
        await connection.execute(
          `
          INSERT INTO PERSON_PHONE (PERSON_ID, PHONE_NO)
          VALUES (:personId, :phoneNo)
          `,
          {
            personId: personId.trim().toUpperCase(),
            phoneNo: phoneNo.trim(),
          }
        );
      }
'@
$c = $c.Substring(0,$execStart) + $staffBlock + $c.Substring($after)
$c = $c -replace '!name\b','!firstName || !lastName'
$c = $c -replace '\bname\.trim\(\)','firstName.trim()'
Save-NoBom $path $c

$path = "frontend\src\pages\supervisor\AddEmployeePage.jsx"
$c = Get-Content $path -Raw
$c = $c.Replace('name: "",',"firstName: `"`",`r`n  lastName: `"`",")
$c = $c.Replace('contactNo: "",','gender: "",')

$fullNamePattern = '(?s)<div className="col-md-4">\s*<label className="form-label">Full Name \*</label>.*?</div>'
$fullNameReplacement = @'
<div className="col-md-4">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
'@
$c = [regex]::Replace($c,$fullNamePattern,$fullNameReplacement,1)

$contactPattern = '(?s)<div className="col-md-4">\s*<label className="form-label">Emergency Contact</label>.*?</div>'
$genderReplacement = @'
<div className="col-md-4">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
'@
$c = [regex]::Replace($c,$contactPattern,$genderReplacement,1)
Save-NoBom $path $c

$path = "frontend\src\pages\admin\PersonsPage.jsx"
$c = Get-Content $path -Raw
$c = $c.Replace("<th>Name</th>","<th>First Name</th>`r`n                <th>Last Name</th>")
$c = $c.Replace("<th>Contact No</th>","<th>Gender</th>")
$c = $c.Replace("<td>{person.NAME}</td>","<td>{person.FIRST_NAME || `"-`"}</td>`r`n                  <td>{person.LAST_NAME || `"-`"}</td>")
$c = $c.Replace("<td>{person.CONTACT_NO || `"-`"}</td>","<td>{person.GENDER || `"-`"}</td>")
Save-NoBom $path $c

$sql = @'
-- Run ONLY after runtime testing succeeds.
ALTER TABLE PERSON DROP COLUMN NAME;
ALTER TABLE PERSON DROP COLUMN PHONE_NO;
ALTER TABLE PERSON DROP COLUMN CONTACT_NO;
COMMIT;

DESC PERSON;
DESC PERSON_PHONE;

SELECT
    p.PERSON_ID,
    p.FIRST_NAME,
    p.LAST_NAME,
    p.GENDER,
    p.DATE_OF_BIRTH,
    pp.PHONE_NO
FROM PERSON p
LEFT JOIN PERSON_PHONE pp
    ON pp.PERSON_ID = p.PERSON_ID
ORDER BY p.PERSON_ID, pp.PHONE_NO;
'@
Save-NoBom "database\03b_person_final_cleanup.sql" $sql

Write-Host ""
Write-Host "Running syntax/build checks..."
$checks = @(
  "backend\routes\personRoutes.js",
  "backend\routes\staffRoutes.js",
  "backend\routes\authRoutes.js",
  "backend\routes\adopterRoutes.js",
  "backend\routes\adoptionRoutes.js",
  "backend\routes\ownerRoutes.js",
  "backend\routes\emergencyContactRoutes.js",
  "backend\routes\supervisorManagementRoutes.js"
)
foreach ($f in $checks) {
    node --check $f
    if ($LASTEXITCODE -ne 0) { throw "Syntax check failed: $f" }
}
Push-Location frontend
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
Pop-Location

Write-Host ""
Write-Host "=== Remaining old Person references ==="
Get-ChildItem backend,frontend -Recurse -File |
Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\dist\\'
} |
Select-String -Pattern '\bp\.NAME\b|\bp\.PHONE_NO\b|\bPERSON\.NAME\b|\bPERSON\.PHONE_NO\b|\bCONTACT_NO\b' |
Select-Object Path,LineNumber,Line

Write-Host ""
Write-Host "Patch completed. DO NOT run 03b_person_final_cleanup.sql until runtime testing passes."

