// server/controllers/easypaisaController.js
const crypto = require('crypto');
const Payment = require('../models/finance/Payment');
const Appointment = require('../models/appointment/Appointment');
const Patient = require('../models/patient/Patient');
const User = require('../models/auth/User');
const smsService = require('../config/smsService');

// Real-looking Easypaisa controller structure
// In production, STORE_ID and HASH_KEY should be in .env
const STORE_ID = process.env.EASYPAISA_STORE_ID || 'dummy_store_id';
const HASH_KEY = process.env.EASYPAISA_HASH_KEY || 'dummy_hash_key';
const POST_BACK_URL = process.env.EASYPAISA_POST_BACK_URL || 'http://localhost:5000/api/easypaisa/callback';

/**
 * Generate Hash for Easypaisa Request
 */
const generateHash = (dataArray) => {
  const sortedKeys = Object.keys(dataArray).sort();
  let hashString = '';
  sortedKeys.forEach(key => {
    if (dataArray[key] !== '' && dataArray[key] !== null) {
      hashString += `${key}=${dataArray[key]}&`;
    }
  });
  hashString = hashString.slice(0, -1); // Remove trailing &

  const cipher = crypto.createCipheriv('aes-128-ecb', HASH_KEY, null);
  let encrypted = cipher.update(hashString, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

/**
 * Initialize Payment
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, orderId, email, phone } = req.body;

    if (!amount || !orderId || !phone) {
      return res.status(400).json({ error: 'Missing required fields for Easypaisa payment' });
    }

    // Create a pending payment record
    const payment = await Payment.create({
      patientId: req.user ? req.user.id : null,
      appointmentId: orderId,
      amount: amount,
      paymentMethod: 'Easypaisa',
      paymentDate: new Date(),
      status: 'Pending',
      transactionId: `EP-${Date.now()}`
    });

    // In a real integration, we'd send a request to Easypaisa API
    // For demo, we return a mock checkout URL
    const paymentData = {
      amount: parseFloat(amount).toFixed(1),
      storeId: STORE_ID,
      postBackURL: POST_BACK_URL,
      orderRefNum: orderId,
      autoRedirect: '1',
      paymentMethod: 'InitialRequest',
      emailAddress: email || '',
      mobileNum: phone
    };

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      paymentData: paymentData,
      mockCheckoutUrl: `/api/easypaisa/simulate-success?orderId=${orderId}&paymentId=${payment._id}&phone=${phone}&amount=${amount}`
    });

  } catch (error) {
    console.error('Easypaisa init error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Simulate Payment Success (For testing)
 * In production, this would be replaced by actual Easypaisa gateway
 */
exports.simulateSuccess = async (req, res) => {
  try {
    const { orderId, paymentId, phone, amount } = req.query;

    // Update payment status
    const payment = await Payment.findByIdAndUpdate(paymentId,
      { status: 'Success' },
      { new: true }
    );

    // Update appointment payment status
    const appointment = await Appointment.findByIdAndUpdate(orderId,
      { paymentStatus: 'Paid' },
      { new: true }
    ).populate('patientId');

    // Get patient details for SMS
    let patientName = 'Patient';
    let patientPhone = phone;

    if (appointment && appointment.patientId) {
      patientName = appointment.patientId.name || 'Patient';
      patientPhone = appointment.patientId.phone || phone;

      // Get doctor name if available
      let doctorName = 'Doctor';
      if (appointment.doctorId) {
        const doctor = await User.findById(appointment.doctorId);
        if (doctor) doctorName = doctor.name;
      }

      // Get service name
      let serviceName = 'Consultation';

      // Format date for SMS
      const appointmentDate = appointment.appointmentDate ?
        new Date(appointment.appointmentDate).toLocaleDateString() : 'today';

      // Send SMS notifications
      try {
        // 1. Send confirmation to patient
        const patientMessage = `🏥 Clinic Appointment Confirmation\n\nDear ${patientName},\nYour appointment has been confirmed for ${appointmentDate} at ${appointment.appointmentTime || 'scheduled time'}.\nAmount Paid: Rs. ${amount || payment.amount}\n\nThank you for choosing us!`;

        if (patientPhone) {
          await smsService.sendSMS(patientPhone, patientMessage);
        }

        // 2. Send notification to admin (0319 4474441)
        const adminMessage = `💰 New Payment Received!\n\nPatient: ${patientName}\nPhone: ${patientPhone || 'N/A'}\nAmount: Rs. ${amount || payment.amount}\nAppointment ID: ${orderId}\nService: ${serviceName}\n\nCheck dashboard for details.`;

        await smsService.sendSMS('03194474441', adminMessage);

        console.log('✅ SMS notifications sent successfully');

      } catch (smsError) {
        console.error('❌ SMS sending error:', smsError);
        // Don't fail the payment if SMS fails
      }
    }

    res.json({
      success: true,
      message: 'Payment completed successfully',
      appointment: appointment
    });

  } catch (error) {
    console.error('Simulate success error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Easypaisa IPN / Callback Handler
 * This endpoint is called by Easypaisa servers when a transaction completes
 */
exports.callback = async (req, res) => {
  try {
    console.log('Easypaisa IPN Received:', req.body);
    const { orderRefNumber, transactionId, status, responseCode, mobileNumber } = req.body;

    if (status === '0000') { // Assuming 0000 is success code
      const appointment = await Appointment.findByIdAndUpdate(orderRefNumber,
        { paymentStatus: 'Paid' },
        { new: true }
      ).populate('patientId');

      const payment = await Payment.findOneAndUpdate(
        { appointmentId: orderRefNumber },
        {
          status: 'Success',
          transactionId: transactionId
        },
        { new: true }
      );

      // Send SMS notification on successful callback
      if (appointment && appointment.patientId) {
        await smsService.sendPaymentConfirmation(
          appointment.patientId.name,
          payment?.amount || '0',
          appointment.appointmentDate?.toLocaleDateString(),
          appointment.appointmentTime
        );

        await smsService.sendSMS('03194474441',
          `✅ Payment Success!\nPatient: ${appointment.patientId.name}\nAmount: Rs. ${payment?.amount}\nTime: ${new Date().toLocaleString()}`
        );
      }
    } else {
      await Payment.findOneAndUpdate(
        { appointmentId: orderRefNumber },
        { status: 'Failed' }
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Easypaisa callback error:', error);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * Check payment status
 */
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ appointmentId: orderId });
    const appointment = await Appointment.findById(orderId);

    res.json({
      paymentStatus: payment?.status || 'Not Found',
      appointmentStatus: appointment?.status,
      payment: payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};