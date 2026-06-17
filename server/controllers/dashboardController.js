const Appointment = require('../models/appointment/Appointment');
const Patient = require('../models/patient/Patient');
const Payment = require('../models/finance/Payment');
const SalarySlip = require('../models/finance/SalarySlip');
const Expense = require('../models/finance/Expense');
const InventoryLog = require('../models/inventory/InventoryLog');
const User = require('../models/auth/User');

// Helper function to get doctor name
async function getDoctorName(doctorId) {
  if (!doctorId) return 'General';
  try {
    const doctor = await User.findById(doctorId);
    return doctor?.name || 'General';
  } catch (error) {
    return 'General';
  }
}

// ========== FULL ADMIN DASHBOARD ==========
exports.getFullDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    // Basic Stats
    const totalPatients = await Patient.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });
    const recentPatients = await Patient.find().sort({ createdAt: -1 }).limit(5);
    const recentAppointments = await Appointment.find().sort({ appointmentDate: -1 }).limit(5);

    // Revenue
    const monthRevenuePayments = await Payment.find({
      status: { $in: ['Approved', 'Success'] },
      paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalMonthRevenue = monthRevenuePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const todayRevenuePayments = await Payment.find({
      status: { $in: ['Approved', 'Success'] },
      paymentDate: { $gte: today, $lt: tomorrow }
    });
    const todayRevenue = todayRevenuePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const yearRevenuePayments = await Payment.find({
      status: { $in: ['Approved', 'Success'] },
      paymentDate: { $gte: startOfYear, $lte: endOfYear }
    });
    const totalYearRevenue = yearRevenuePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Payroll Expense
    const payrollSlips = await SalarySlip.find({
      status: { $in: ['Approved', 'Paid'] },
      year: today.getFullYear(),
      month: today.getMonth() + 1
    });
    const totalMonthPayroll = payrollSlips.reduce((sum, s) => sum + (s.netSalary || 0), 0);

    // Inventory Purchase Expense
    let totalMonthInventory = 0;
    const invLogs = await InventoryLog.find({
      type: 'Purchased',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    totalMonthInventory = invLogs.reduce((sum, log) => 
      sum + ((log.quantityChanged || 0) * (log.purchasePrice || 0)), 0);

    // Other Expenses
    let totalMonthOther = 0;
    const otherExp = await Expense.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    totalMonthOther = otherExp.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalMonthExpenses = totalMonthPayroll + totalMonthInventory + totalMonthOther;

    res.json({
      stats: {
        totalPatients,
        todayAppointments,
        totalRevenue: totalMonthRevenue,
        totalExpenses: totalMonthExpenses,
        todayRevenue,
        yearRevenue: totalYearRevenue
      },
      appointments: recentAppointments,
      patients: recentPatients,
      alerts: [],
      charts: {
        monthlyRevenue: [],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== SIMPLE ADMIN DASHBOARD ==========
exports.getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const totalPatients = await Patient.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Revenue
    const monthPayments = await Payment.find({
      status: { $in: ['Approved', 'Success'] },
      paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Payroll
    const payrollSlips = await SalarySlip.find({
      status: { $in: ['Approved', 'Paid'] },
      year: today.getFullYear(),
      month: today.getMonth() + 1
    });
    const monthPayroll = payrollSlips.reduce((sum, s) => sum + (s.netSalary || 0), 0);

    // Inventory
    let monthInventory = 0;
    const invLogs = await InventoryLog.find({
      type: 'Purchased',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    monthInventory = invLogs.reduce((sum, log) => 
      sum + ((log.quantityChanged || 0) * (log.purchasePrice || 0)), 0);

    // Other Expenses
    let monthOther = 0;
    const expenses = await Expense.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    monthOther = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalExpenses = monthPayroll + monthInventory + monthOther;

    res.json({
      totalPatients,
      todayAppointments,
      totalRevenue: monthRevenue,
      totalExpenses,
      pendingApprovals: await Appointment.countDocuments({ status: 'Pending' })
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== USER DASHBOARD (FOR PATIENTS) ==========
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    console.log('📊 Fetching user dashboard for:', userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get upcoming appointments (today or future)
    const upcomingAppointments = await Appointment.find({
      patientId: userId,
      appointmentDate: { $gte: today },
      status: { $in: ['Confirmed', 'Pending', 'Approved'] }
    }).sort({ appointmentDate: 1 }).limit(1);
    
    // Get total visits (completed appointments)
    const totalVisits = await Appointment.countDocuments({
      patientId: userId,
      status: 'Completed'
    });
    
    // Get pending payments
    const pendingPayments = await Payment.countDocuments({
      patientId: userId,
      status: { $in: ['Pending', 'Draft'] }
    });
    
    // Get next appointment details
    let nextAppointment = null;
    if (upcomingAppointments.length > 0) {
      const app = upcomingAppointments[0];
      nextAppointment = {
        _id: app._id,
        appointmentDate: app.appointmentDate,
        startTime: app.startTime || app.time || "3:00 PM",
        doctorName: app.doctorName || await getDoctorName(app.doctorId),
        status: app.status
      };
    }
    
    // Get recent activity (last 5 appointments and payments)
    const recentAppointments = await Appointment.find({
      patientId: userId
    }).sort({ createdAt: -1 }).limit(3);
    
    const recentPayments = await Payment.find({
      patientId: userId
    }).sort({ createdAt: -1 }).limit(2);
    
    const recentActivity = [
      ...recentAppointments.map(app => ({
        type: 'appointment',
        id: app._id,
        title: `Appointment with Dr. ${app.doctorName || 'General'}`,
        date: app.appointmentDate || app.createdAt,
        status: app.status
      })),
      ...recentPayments.map(payment => ({
        type: 'payment',
        id: payment._id,
        title: `Payment of ₨${payment.amount?.toLocaleString() || 0}`,
        date: payment.createdAt,
        status: payment.status
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    res.json({
      stats: {
        upcomingAppointments: upcomingAppointments.length,
        totalVisits: totalVisits || 0,
        pendingPayments: pendingPayments || 0
      },
      nextAppointment: nextAppointment,
      recentActivity: recentActivity
    });
    
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};