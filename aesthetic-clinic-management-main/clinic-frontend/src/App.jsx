import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import DebugInfo from "./components/public/DebugInfo"; // ✅ Add this import

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Doctors from "./pages/public/Doctors";
import Contact from "./pages/public/Contact";
import PublicGallery from "./pages/public/Gallery";
import Blogs from "./pages/public/Blogs";
import BlogDetail from "./pages/public/BlogDetail";
import BeforeAfter from "./pages/public/BeforeAfter";
import ImageDebug from "./pages/debug/ImageDebug"; // ✅ Import debug page

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyPhone from "./pages/auth/VerifyPhone";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Patients from "./pages/admin/Patients";
import Appointments from "./pages/admin/Appointments";
import Finance from "./pages/admin/Finance";
import Inventory from "./pages/admin/Inventory";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import ServicesManager from "./pages/admin/ServicesManager";
import GalleryManager from "./pages/admin/GalleryManager";
import BlogManager from "./pages/admin/BlogManager";
import TestimonialManager from "./pages/admin/TestimonialManager";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import BookAppointment from "./pages/user/BookAppointment";
import MyAppointments from "./pages/user/MyAppointments";
import Payments from "./pages/user/Payments";
import Profile from "./pages/user/Profile";

// Route Guards
import ProtectedRoute from "./routes/protectedRoutes";
import RoleRoute from "./routes/RoleRoute";

function App() {
  console.log("📱 App component rendering");
  console.log("Current URL:", window.location.href);
  console.log("LocalStorage token:", localStorage.getItem("token") || sessionStorage.getItem("token"));
  console.log("LocalStorage user:", localStorage.getItem("user") || sessionStorage.getItem("user"));
  
  return (
    <>
      <DebugInfo /> {/* ✅ Temporary debug component */}
      
      <Routes>
        {/* 🌍 PUBLIC ROUTES - NO AUTHENTICATION NEEDED */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="contact" element={<Contact />} />
          <Route path="gallery" element={<PublicGallery />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blog/:id" element={<BlogDetail />} />
          <Route path="before-after" element={<BeforeAfter />} />
        </Route>

        {/* 🧪 DEBUG ROUTE */}
        <Route path="/debug/images" element={<ImageDebug />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-phone/:token" element={<VerifyPhone />} />

        {/* 👤 USER ROUTES (Protected) */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <UserLayout />
              </motion.div>
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 👑 ADMIN ROUTES (Protected + Role Check) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['Admin', 'SuperAdmin']}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AdminLayout />
                </motion.div>
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="finance" element={<Finance />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="blogs" element={<BlogManager />} />
          <Route path="testimonials" element={<TestimonialManager />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            icon: '✅',
            style: {
              background: '#4CAF50',
            },
          },
          error: {
            duration: 4000,
            icon: '❌',
            style: {
              background: '#f44336',
            },
          },
        }}
      />
    </>
  );
}

export default App;
