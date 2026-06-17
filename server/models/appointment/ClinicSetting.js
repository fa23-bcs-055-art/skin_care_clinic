const mongoose = require('mongoose');

const clinicSettingSchema = new mongoose.Schema({
    // Weekly clinic timings
    weeklyHours: {
        monday: {
            start: { type: String, default: "15:00" },
            end: { type: String, default: "19:00" },
            isOpen: { type: Boolean, default: true }
        },
        tuesday: {
            start: { type: String, default: "15:00" },
            end: { type: String, default: "19:00" },
            isOpen: { type: Boolean, default: true }
        },
        wednesday: {
            start: { type: String, default: "15:00" },
            end: { type: String, default: "19:00" },
            isOpen: { type: Boolean, default: true }
        },
        thursday: {
            start: { type: String, default: "15:00" },
            end: { type: String, default: "19:00" },
            isOpen: { type: Boolean, default: true }
        },
        friday: {
            start: { type: String, default: "15:00" },
            end: { type: String, default: "19:00" },
            isOpen: { type: Boolean, default: true }
        },
        saturday: {
            start: { type: String, default: "00:00" },
            end: { type: String, default: "00:00" },
            isOpen: { type: Boolean, default: false }
        },
        sunday: {
            start: { type: String, default: "00:00" },
            end: { type: String, default: "00:00" },
            isOpen: { type: Boolean, default: false }
        }
    },

    // Specific holidays (e.g., Eid, 14 Aug)
    holidays: [{
        date: { type: Date },
        reason: { type: String },
        isFullDay: { type: Boolean, default: true }
    }],

    // Special hours for specific dates (exceptions)
    specialHours: [{
        date: { type: Date },
        start: { type: String },
        end: { type: String },
        reason: { type: String }
    }],

    // Slot configuration
    slotDuration: { type: Number, default: 30 },
    maxBookingsPerSlot: { type: Number, default: 1 },
    bufferBetweenSlots: { type: Number, default: 0 },
    advanceBookingDays: { type: Number, default: 30 },
    minBookingNotice: { type: Number, default: 60 },

    // Last updated by
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ClinicSetting', clinicSettingSchema);