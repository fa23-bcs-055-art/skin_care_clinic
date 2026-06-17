const Appointment = require('../models/appointment/Appointment');
const Service = require('../models/Service');
const User = require('../models/auth/User');
const Payment = require('../models/finance/Payment');

// ========== HELPERS ==========
const formatTime12Hour = (time24) => {
  if (!time24) return '03:00 PM';
  const [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

const add30Min = (time24) => {
  const [hour, minute] = time24.split(':').map(Number);
  let newHour = hour;
  let newMinute = minute + 30;
  if (newMinute >= 60) {
    newHour++;
    newMinute = newMinute - 60;
  }
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 15; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      let endHour = hour;
      let endMinute = minute + 30;
      if (endMinute >= 60) {
        endHour++;
        endMinute = endMinute - 60;
      }
      if (endHour > 19 || (endHour === 19 && endMinute > 0)) break;

      const startTime24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endTime24 = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      slots.push({
        startTime: startTime24,
        endTime: endTime24,
        displayTime: `${formatTime12Hour(startTime24)} - ${formatTime12Hour(endTime24)}`
      });
    }
  }
  return slots;
};

// Helper to create notification
const createNotification = async (userId, title, message, type, data = {}) => {
  try {
    const Notification = require('../models/notification/Notification');
    await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      isRead: false
    });
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

const notifyAdmins = async (title, message, type, data = {}) => {
  try {
    const admins = await User.find({ role: { $in: ['Admin', 'SuperAdmin'] } });
    for (const admin of admins) {
      await createNotification(admin._id, title, message, type, data);
    }
  } catch (error) {
    console.error('Admin notification error:', error);
  }
};

const notifyPatient = async (patientId, title, message, type, data = {}) => {
  try {
    if (patientId) {
      await createNotification(patientId, title, message, type, data);
    }
  } catch (error) {
    console.error('Patient notification error:', error);
  }
};

// ========== GET AVAILABLE SLOTS ==========
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const allSlots = generateTimeSlots();
    const displaySlots = allSlots.map(slot => slot.displayTime);

    if (!doctorId || !date) {
      return res.json({ availableSlots: displaySlots });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Pending', 'Confirmed'] }
    });

    const bookedTimes = new Set();
    bookedAppointments.forEach(app => {
      if (app.startTime) {
        const formatted = `${formatTime12Hour(app.startTime)} - ${formatTime12Hour(app.endTime || add30Min(app.startTime))}`;
        bookedTimes.add(formatted);
      }
    });

    const availableSlots = displaySlots.filter(slot => !bookedTimes.has(slot));
    res.json({ availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    const allSlots = generateTimeSlots();
    res.json({ availableSlots: allSlots.map(slot => slot.displayTime) });
  }
};

// ========== CREATE APPOINTMENT ==========
exports.createAppointment = async (req, res) => {
  try {
    const {
      customerName, customerPhone, customerEmail,
      patientId, doctorId, serviceId,
      appointmentDate, appointmentTime, notes
    } = req.body;

    let startTime24 = "15:00";
    if (appointmentTime) {
      const match = appointmentTime.match(/(\d+):(\d+)\s*(AM|PM)/);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2];
        const period = match[3];
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        startTime24 = `${hour.toString().padStart(2, '0')}:${minute}`;
      }
    }

    const endTime24 = add30Min(startTime24);

    if (!appointmentDate) {
      return res.status(400).json({ error: "Date is required" });
    }

    if (doctorId) {
      const startOfDay = new Date(appointmentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existing = await Appointment.findOne({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        startTime: startTime24,
        status: { $in: ['Pending', 'Confirmed'] }
      });

      if (existing) {
        return res.status(409).json({ error: "This time slot is already booked" });
      }
    }

    const appointment = new Appointment({
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      patientId: patientId || null,
      doctorId: doctorId || null,
      serviceId: serviceId || null,
      appointmentDate: new Date(appointmentDate),
      startTime: startTime24,
      endTime: endTime24,
      notes: notes || '',
      status: 'Pending',
      paymentStatus: 'Unpaid'
    });

    await appointment.save();

    await notifyAdmins(
      'New Appointment Request',
      `${customerName || 'A patient'} has requested an appointment on ${new Date(appointmentDate).toLocaleDateString()}`,
      'Appointment',
      { appointmentId: appointment._id }
    );

    const populated = await Appointment.findById(appointment._id)
      .populate('serviceId')
      .populate('doctorId', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== GET ALL APPOINTMENTS ==========
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('serviceId')
      .populate('doctorId', 'name')
      .populate('patientId', 'name phone')
      .sort({ appointmentDate: -1, startTime: 1 });

    const formatted = appointments.map(app => ({
      _id: app._id,
      customerName: app.customerName,
      customerPhone: app.customerPhone,
      customerEmail: app.customerEmail,
      patientId: app.patientId,
      patientName: app.patientId?.name || app.customerName,
      patientPhone: app.patientId?.phone || app.customerPhone,
      serviceId: app.serviceId?._id,
      serviceName: app.serviceId?.name,
      doctorId: app.doctorId,
      doctorName: app.doctorId?.name,
      appointmentDate: app.appointmentDate,
      startTime: app.startTime,
      endTime: app.endTime,
      status: app.status,
      paymentStatus: app.paymentStatus,
      notes: app.notes,
      createdAt: app.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== GET APPOINTMENT BY ID ==========
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('serviceId')
      .populate('doctorId', 'name')
      .populate('patientId', 'name phone');
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== UPDATE APPOINTMENT ==========
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== DELETE APPOINTMENT ==========
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== UPDATE STATUS ==========
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patientId', 'name');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.patientId) {
      let title = '', message = '';
      switch (status) {
        case 'Confirmed':
          title = 'Appointment Confirmed';
          message = `Your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} has been confirmed.`;
          break;
        case 'Completed':
          title = 'Appointment Completed';
          message = `Your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} has been completed.`;
          break;
        case 'Cancelled':
          title = 'Appointment Cancelled';
          message = `Your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled.`;
          break;
        default:
          title = 'Appointment Updated';
          message = `Your appointment status has been updated to ${status}.`;
      }
      
      await notifyPatient(appointment.patientId._id, title, message, 'Appointment', { appointmentId: appointment._id });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== UPDATE PAYMENT STATUS ==========
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentId },
      { new: true }
    );
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== GET MY APPOINTMENTS (FIXED - ALL APPOINTMENTS) ==========
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // ✅ Get ALL appointments for this user (not filtered by status)
    const appointments = await Appointment.find({ patientId: userId })
      .populate('serviceId')
      .populate('doctorId', 'name email')
      .sort({ appointmentDate: -1, startTime: 1 });

    const formatted = appointments.map(app => ({
      _id: app._id,
      customerName: app.customerName,
      customerPhone: app.customerPhone,
      customerEmail: app.customerEmail,
      patientId: app.patientId,
      serviceId: app.serviceId?._id,
      serviceName: app.serviceId?.name,
      doctorId: app.doctorId,
      doctorName: app.doctorId?.name,
      appointmentDate: app.appointmentDate,
      startTime: app.startTime,
      endTime: app.endTime,
      status: app.status,
      paymentStatus: app.paymentStatus,
      notes: app.notes,
      invoiceId: app.invoiceId
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error in getMyAppointments:", error);
    res.status(500).json({ error: error.message });
  }
};