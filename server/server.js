process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

const path = require('path');
const fs = require('fs');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("ssl-root-cas").inject();
require("dotenv").config({ path: path.join(__dirname, '../.env') });

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

// ===== MIDDLEWARE SETUP =====
app.use(cookieParser());

// CORS with credentials
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Ensure Access-Control-Allow-Origin is always set
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}); // ✅ CLOSED PROPERLY

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ===== Serverless Database Middleware =====
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && !global.__dbReady) {
    try {
      await connectToDatabase();
      global.__dbReady = true;
    } catch (err) {
      console.error("⚠️ DB connection error:", err);
    }
  }
  next();
});

// ===== Serve static files =====
const uploadsPath = path.join(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadsPath));

// ===== MongoDB Connection =====
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://LaibaSagheer:Laiba%40185@cluster0.negjn77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.set('bufferCommands', false);

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise();
  }
  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }
  console.log("=> Connecting to database...");
  const db = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10
  });
  console.log("✅ MongoDB Connected!");
  return db;
}

connectToDatabase().catch(err => console.log("❌ MongoDB Connection Error:", err));

// ===== Default Route =====
app.get("/", (req, res) => {
  res.send("Clinic Management System Backend Running");
});

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/roles", verifyToken, superAdminOnly, roleRoutes);
app.use("/api/users", verifyToken, userRoutes);
app.use("/api/patients", verifyToken, patientRoutes);
app.use("/api/treatments", verifyToken, treatmentRoutes);
app.use("/api/appointments", verifyToken, appointmentRoutes);
app.use("/api/payments", verifyToken, paymentRoutes);
app.use("/api/expenses", verifyToken, expenseRoutes);
app.use("/api/easypaisa", require("./routes/easypaisaRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/inventory", verifyToken, inventoryRoutes);
app.use("/api/suppliers", verifyToken, supplierRoutes);
app.use("/api/invoices", verifyToken, invoiceRoutes);
app.use("/api/reports", verifyToken, adminAndAbove, reportRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/notifications", verifyToken, notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

const activityLogRoutes = require("./routes/activityLogRoutes");
app.use("/api/activity-logs", verifyToken, authorizeRoles('SuperAdmin', 'Admin'), activityLogRoutes);

app.use("/api/test-insert", testInsertRoutes);

const doctorRoutes = require("./routes/doctorRoutes");
app.use("/api/doctor", doctorRoutes);

const diagnosisRoutes = require("./routes/diagnosisRoutes");
app.use("/api/diagnosis", diagnosisRoutes);

// ===== Error Handler =====
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ===== Start Server =====
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

module.exports = app;