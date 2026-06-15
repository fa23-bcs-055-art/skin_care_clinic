// server.js (Professional Updated Version)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

const path = require('path');
const fs = require('fs');

console.log("Current working directory:", __dirname);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser'); // ADD THIS
require("ssl-root-cas").inject();
require("dotenv").config({ path: "../.env" });

// ===== Ensure uploads directory exists =====
const uploadsDir = path.join(__dirname, 'public/uploads');
const uploadSubdirs = ['services', 'gallery', 'blogs', 'profiles', 'before-after'];
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
uploadSubdirs.forEach(subdir => {
  const subdirPath = path.join(uploadsDir, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
  }
});
console.log("✅ Upload directories ready at:", uploadsDir);

// ===== Controllers =====
const authController = require("./controllers/authController");
const roleController = require("./controllers/roleController");
const userController = require("./controllers/userController");
const notificationController = require("./controllers/notificationController");
const patientController = require("./controllers/patientController");
const treatmentController = require("./controllers/treatmentController");
const appointmentController = require("./controllers/appointmentController");
const paymentController = require("./controllers/paymentController");
const expenseController = require("./controllers/expenseController");
const inventoryController = require("./controllers/inventoryController");
const supplierController = require("./controllers/supplierController");
const reportController = require("./controllers/reportController");
const forgotPasswordController = require("./controllers/forgotPasswordController");
const uploadRoutes = require("./routes/uploadRoutes");
const invoiceController = require("./controllers/invoiceController");

// ===== Routes =====
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const treatmentRoutes = require("./routes/treatmentRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const testInsertRoutes = require("./routes/test-insert");
const invoiceRoutes = require("./routes/invoiceRoutes");

// ===== Middleware =====
const { verifyToken } = require("./middleware/authMiddleware");
const { authorizeRoles, adminAndAbove, superAdminOnly } = require("./middleware/roleMiddleware");

// ===== Express App =====
const app = express();

// ===== MIDDLEWARE SETUP - ORDER MATTERS =====
app.use(cookieParser()); // ADD THIS - Must be before routes

// CORS with credentials
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// ===== Serve static files =====
const uploadsPath = path.join(__dirname, 'public/uploads');
console.log("📁 Uploading from:", uploadsPath);
console.log("📁 Path exists:", fs.existsSync(uploadsPath));

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cache-Control', 'public, max-age=3600');
  
  const fullPath = path.join(uploadsPath, req.path);
  const fileExists = fs.existsSync(fullPath);
  console.log(`📂 [${req.method}] /uploads${req.path}`, {
    fullDiskPath: fullPath,
    exists: fileExists,
    isFile: fileExists && fs.statSync(fullPath).isFile(),
    isDirectory: fileExists && fs.statSync(fullPath).isDirectory()
  });
  
  next();
});

app.use('/uploads', express.static(uploadsPath, {
  etag: false,
  setHeaders: (res, filePath) => {
    console.log(`✅ Serving file: ${filePath}`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

app.use('/uploads', (req, res) => {
  const fullPath = path.join(uploadsPath, req.path);
  const dirContents = fs.readdirSync(uploadsPath, { recursive: true }).slice(0, 20);
  console.error(`❌ 404 NOT FOUND: /uploads${req.path}`, {
    requestedPath: fullPath,
    requestExists: fs.existsSync(fullPath),
    uploadsDirExists: fs.existsSync(uploadsPath),
    uploadsDirContents: dirContents
  });
  res.status(404).json({
    error: 'File not found',
    requestedPath: `/uploads${req.path}`,
    availableDirectory: uploadsPath
  });
});

console.log("✅ Static file serving configured at /uploads");

// ===== MongoDB Connection =====
const MONGO_URI = process.env.MONGO_URI || "mongodb://LaibaSagheer:Laiba%40185@ac-qrjw8wb-shard-00-00.negjn77.mongodb.net:27017,ac-qrjw8wb-shard-00-01.negjn77.mongodb.net:27017,ac-qrjw8wb-shard-00-02.negjn77.mongodb.net:27017/?ssl=true&replicaSet=atlas-n80a76-shard-0&authSource=admin&appName=Cluster0";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// ===== Default Route =====
app.get("/", (req, res) => {
    res.send("Clinic Management System Backend Running");
});

// ===== API Routes =====

// Public routes
app.use("/api/auth", authRoutes);

// 🔥 SUPER ADMIN ONLY ROUTES
app.use("/api/admin", adminRoutes);

// Role management (SuperAdmin only)
app.use("/api/roles", verifyToken, superAdminOnly, roleRoutes);

// User management (Admin+)
app.use("/api/users", verifyToken, userRoutes);

// Patient management (All authenticated users)
app.use("/api/patients", verifyToken, patientRoutes);

// Treatment management
app.use("/api/treatments", verifyToken, treatmentRoutes);

// Appointment management
app.use("/api/appointments", verifyToken, appointmentRoutes);

// Payment & Finance
app.use("/api/payments", verifyToken, paymentRoutes);
app.use("/api/expenses", verifyToken, expenseRoutes);
app.use("/api/easypaisa", require("./routes/easypaisaRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));

// Inventory & Supplier
app.use("/api/inventory", verifyToken, inventoryRoutes);
app.use("/api/suppliers", verifyToken, supplierRoutes);
app.use("/api/invoices", verifyToken, invoiceRoutes);

// Reports / Dashboard
app.use("/api/reports", verifyToken, adminAndAbove, reportRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);


// Make sure this line exists (it should already be there)
app.use("/api/invoices", verifyToken, invoiceRoutes);

// Notifications
app.use("/api/notifications", verifyToken, notificationRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));

// ===== Doctor & Settings =====
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

const activityLogRoutes = require("./routes/activityLogRoutes");
app.use("/api/activity-logs", verifyToken, authorizeRoles('SuperAdmin', 'Admin'), activityLogRoutes);

// Test route
app.use("/api/test-insert", testInsertRoutes);

// 🔍 Diagnostic routes
const diagnosisRoutes = require("./routes/diagnosisRoutes");
app.use("/api/diagnosis", diagnosisRoutes);

// Error Handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));