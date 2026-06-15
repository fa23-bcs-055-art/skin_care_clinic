const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  customerName: { type: String, default: '' },
  customerEmail: { type: String, lowercase: true, trim: true },
  customerPhone: { type: String, default: '' },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  appointmentDate: { type: Date, required: true },
  startTime: { type: String, default: '15:00' },
  endTime: { type: String, default: '15:30' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Refunded'],
    default: 'Unpaid'
  },
  paymentId: { type: String },
  notes: { type: String, default: '' },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

AppointmentSchema.index({ appointmentDate: 1, startTime: 1 });
AppointmentSchema.index({ customerPhone: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

// ✅ Prevent model overwrite error
module.exports = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);