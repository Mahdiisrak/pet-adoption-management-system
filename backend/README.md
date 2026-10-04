# Backend

The Express API runs on `http://localhost:5000` and connects to Oracle through `node-oracledb`.

```powershell
Copy-Item .env.example .env
notepad .env
npm.cmd install
npm.cmd run check
npm.cmd start
```

Use `http://localhost:5000/api/health` to check Express and `http://localhost:5000/api/health/database` to check Oracle separately.

The API uses bind variables, closes pooled connections, commits successful multi-table transactions and rolls back failed transactions. Password hashes are never returned. See `../docs/api.md` for the complete endpoint list.
