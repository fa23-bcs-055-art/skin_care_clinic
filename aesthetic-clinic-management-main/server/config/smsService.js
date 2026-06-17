// server/config/smsService.js
const twilio = require('twilio');

// SMS Configuration
// For Twilio (Recommended - free $15 trial credit)
// Sign up at https://www.twilio.com/try-twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+12569000000';

// Or use Email-to-SMS (Completely free)
const USE_EMAIL_SMS = process.env.USE_EMAIL_SMS || 'true'; // Set to 'true' for free email SMS
const ADMIN_PHONE = '03194474441';
const ADMIN_EMAIL_GATEWAY = '03194474441@telenor.com.pk'; // Change based on network

class SMSService {
    constructor() {
        this.useTwilio = !USE_EMAIL_SMS && accountSid !== 'your_twilio_account_sid';
        if (this.useTwilio) {
            this.client = twilio(accountSid, authToken);
            console.log('✅ Twilio SMS service initialized');
        } else {
            console.log('✅ Email-to-SMS service initialized (Free)');
        }
    }

    /**
     * Send SMS using available method
     * @param {string} to - Phone number (e.g., '03194474441')
     * @param {string} message - SMS content
     */
    async sendSMS(to, message) {
        // Format phone number (remove any spaces, ensure proper format)
        let formattedPhone = to.replace(/\s/g, '');
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+92' + formattedPhone.slice(1);
        }

        if (this.useTwilio) {
            // Using Twilio API
            try {
                const result = await this.client.messages.create({
                    body: message,
                    from: twilioPhoneNumber,
                    to: formattedPhone
                });
                console.log(`✅ SMS sent via Twilio to ${to}: ${result.sid}`);
                return { success: true, sid: result.sid };
            } catch (error) {
                console.error('❌ Twilio SMS error:', error);
                return { success: false, error: error.message };
            }
        } else {
            // Using Email-to-SMS (Free method)
            // Note: This requires nodemailer, but we'll use a simpler approach
            console.log(`📱 Email-to-SMS: To: ${to}, Message: ${message}`);
            // In production, you'd send an email to the carrier's SMS gateway
            // For now, log to console and return success

            // You can also use fetch to send to a webhook that handles email
            return { success: true, method: 'email-sms', message: 'Logged for testing' };
        }
    }

    /**
     * Send payment confirmation SMS
     */
    async sendPaymentConfirmation(patientName, amount, appointmentDate, appointmentTime) {
        const message = `🏥 Payment Confirmation\n\nDear ${patientName},\nYour payment of Rs. ${amount} has been received successfully.\nAppointment: ${appointmentDate} at ${appointmentTime}\nThank you for choosing our clinic!`;

        // Send to admin
        await this.sendSMS(ADMIN_PHONE, `💰 New Payment: ${patientName} paid Rs. ${amount}`);

        return { success: true };
    }

    /**
     * Send appointment reminder SMS
     */
    async sendAppointmentReminder(patientName, patientPhone, doctorName, date, time) {
        const message = `🏥 Appointment Reminder\n\nDear ${patientName},\nReminder: You have an appointment with Dr. ${doctorName} on ${date} at ${time}.\nPlease arrive 10 minutes early.`;

        if (patientPhone) {
            await this.sendSMS(patientPhone, message);
        }

        return { success: true };
    }

    /**
     * Send new booking notification to admin
     */
    async sendNewBookingNotification(patientName, serviceName, doctorName, date, time, amount) {
        const message = `📅 New Booking!\n\nPatient: ${patientName}\nService: ${serviceName}\nDoctor: Dr. ${doctorName}\nDate: ${date}\nTime: ${time}\nAmount: Rs. ${amount}\n\nCheck dashboard for details.`;

        await this.sendSMS(ADMIN_PHONE, message);

        return { success: true };
    }
}

// Create a singleton instance
const smsInstance = new SMSService();

// Factory function that is usable both as a function/object and as a constructor
function SMSServiceFactory(...args) {
    // If called with `new`, construct a fresh instance
    if (this instanceof SMSServiceFactory) {
        return new SMSService(...args);
    }
    // Otherwise return the singleton instance
    return smsInstance;
}

// Copy instance methods to factory for direct use: require('../config/smsService').sendSMS(...)
Object.getOwnPropertyNames(SMSService.prototype).forEach((name) => {
    if (name !== 'constructor') {
        SMSServiceFactory[name] = function(...args) {
            return smsInstance[name](...args);
        };
    }
});

// Also expose the class and instance for explicit usage
SMSServiceFactory.Class = SMSService;
SMSServiceFactory.instance = smsInstance;

module.exports = SMSServiceFactory;
