param(
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
Set-Location $Root

$path = "backend\routes\staffRoutes.js"
$c = Get-Content $path -Raw

$start = $c.IndexOf("await connection.execute(", $c.IndexOf("INSERT INTO PERSON"))
if ($start -lt 0) { throw "PERSON insert execute block not found." }

$insertPos = $c.IndexOf("INSERT INTO PERSON", $start)
$end = $c.IndexOf(");", $insertPos)
if ($end -lt 0) { throw "End of PERSON insert execute block not found." }
$end += 2

$newBlock = @'
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
      INSERT INTO PERSON_PHONE
      (
        PERSON_ID,
        PHONE_NO
      )
      VALUES
      (
        :personId,
        :phoneNo
      )
      `,
      {
        personId: personId.trim().toUpperCase(),
        phoneNo: phoneNo.trim(),
      }
    );
  }
'@

$c = $c.Substring(0, $start) + $newBlock + $c.Substring($end)

[System.IO.File]::WriteAllText(
  (Join-Path (Get-Location) $path),
  $c,
  [System.Text.UTF8Encoding]::new($false)
)

node --check $path
if ($LASTEXITCODE -ne 0) { throw "staffRoutes.js syntax check failed." }

Write-Host "staffRoutes.js PERSON insert fixed successfully."
Write-Host ""
Get-Content $path | Select-Object -Index (180..245)
