param(
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
Set-Location $Root

$path = "backend\routes\staffRoutes.js"
$c = Get-Content $path -Raw

$marker = "const passwordHash = await bcrypt.hash(password, 10);"
$markerPos = $c.IndexOf($marker)

if ($markerPos -lt 0) {
    throw "Could not find passwordHash marker in staffRoutes.js"
}

$start = $c.IndexOf("await connection.execute(", $markerPos)
if ($start -lt 0) {
    throw "Could not find PERSON insert execute block."
}

$next = $c.IndexOf("await connection.execute(", $start + 1)
if ($next -lt 0) {
    throw "Could not find EMPLOYEE insert block after PERSON insert."
}

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

$c = $c.Substring(0, $start) + $newBlock + $c.Substring($next)

[System.IO.File]::WriteAllText(
    (Join-Path (Get-Location) $path),
    $c,
    [System.Text.UTF8Encoding]::new($false)
)

node --check $path
if ($LASTEXITCODE -ne 0) {
    throw "staffRoutes.js syntax check failed after patch."
}

Write-Host ""
Write-Host "staffRoutes.js PERSON insert fixed successfully."
Write-Host ""
Get-Content $path | Select-Object -Index (180..250)
