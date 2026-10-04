const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { testConnection } = require("./config/database");

const petRoutes = require("./routes/petRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const personRoutes = require("./routes/personRoutes");
const staffRoutes = require("./routes/staffRoutes");
const adopterRoutes = require("./routes/adopterRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const emergencyContactRoutes = require("./routes/emergencyContactRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const supervisorManagementRoutes = require("./routes/supervisorManagementRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", petRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", personRoutes);
app.use("/api", staffRoutes);
app.use("/api", adopterRoutes);
app.use("/api", adoptionRoutes);
app.use("/api", ownerRoutes);
app.use("/api", emergencyContactRoutes);
app.use("/api", doctorRoutes);
app.use("/api", supervisorManagementRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pet Adoption and Management System API is running",
  });
});

app.get("/api/health", async (req, res) => {
  const databaseStatus = await testConnection();
  const statusCode = databaseStatus.success ? 200 : 500;

  res.status(statusCode).json({
    success: databaseStatus.success,
    server: "running",
    database: databaseStatus,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

