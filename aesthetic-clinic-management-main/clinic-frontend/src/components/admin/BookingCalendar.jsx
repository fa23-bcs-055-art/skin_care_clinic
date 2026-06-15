import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

function BookingCalendar({ serviceId, onBookingSuccess }) {
    const [selectedDate, setSelectedDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        notes: ""
    });

    // Max date (30 days ahead)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    // Min date (today)
    const minDate = new Date().toISOString().split('T')[0];

    // Fetch available slots when date changes
    useEffect(() => {
        if (selectedDate && serviceId) {
            fetchAvailableSlots();
        }
    }, [selectedDate, serviceId]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/appointments/available-slots?date=${selectedDate}&serviceId=${serviceId}`);
            setAvailableSlots(res.data.availableSlots || []);
            if (res.data.message) {
                toast(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to load available slots");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSlot) {
            return toast.error("Please select a time slot");
        }

        if (!bookingData.customerName || !bookingData.customerPhone) {
            return toast.error("Please enter your name and phone number");
        }

        setLoading(true);

        try {
            const appointmentData = {
                customerName: bookingData.customerName,
                customerPhone: bookingData.customerPhone,
                customerEmail: bookingData.customerEmail,
                serviceId: serviceId,
                appointmentDate: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                notes: bookingData.notes
            };

            const res = await api.post("/appointments", appointmentData);
            toast.success("Appointment booked successfully!");

            if (onBookingSuccess) {
                onBookingSuccess(res.data);
            }

            // Reset form
            setSelectedSlot(null);
            setBookingData({
                customerName: "",
                customerPhone: "",
                customerEmail: "",
                notes: ""
            });

        } catch (error) {
            if (error.response?.status === 409) {
                toast.error("This slot is already booked! Please select another time.");
                fetchAvailableSlots(); // Refresh slots
            } else {
                toast.error(error.response?.data?.error || "Failed to book appointment");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📅 Book Your Appointment</h2>

            {/* Date Selection */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Select Date *</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDate}
                    max={maxDateStr}
                    style={styles.input}
                    required
                />
            </div>

            {/* Available Slots */}
            {selectedDate && (
                <div style={styles.formGroup}>
                    <label style={styles.label}>Available Time Slots *</label>
                    {loading ? (
                        <div style={styles.loading}>Loading available slots...</div>
                    ) : availableSlots.length > 0 ? (
                        <div style={styles.slotsGrid}>
                            {availableSlots.map((slot, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    style={{
                                        ...styles.slotButton,
                                        ...(selectedSlot?.startTime === slot.startTime ? styles.slotSelected : {})
                                    }}
                                >
                                    {slot.displayTime}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.noSlots}>No available slots for this date</div>
                    )}
                </div>
            )}

            {/* Customer Info */}
            {selectedSlot && (
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            value={bookingData.customerName}
                            onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Phone Number *</label>
                        <input
                            type="tel"
                            value={bookingData.customerPhone}
                            onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email (Optional)</label>
                        <input
                            type="email"
                            value={bookingData.customerEmail}
                            onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Notes (Optional)</label>
                        <textarea
                            value={bookingData.notes}
                            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                            style={styles.textarea}
                            placeholder="Any special requests?"
                        />
                    </div>

                    <button type="submit" style={styles.submitButton} disabled={loading}>
                        {loading ? "Booking..." : "Confirm Appointment"}
                    </button>
                </form>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px"
    },
    title: {
        textAlign: "center",
        marginBottom: "30px",
        color: "#333"
    },
    formGroup: {
        marginBottom: "20px"
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontWeight: "bold",
        color: "#555"
    },
    input: {
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "16px",
        boxSizing: "border-box"
    },
    textarea: {
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "16px",
        minHeight: "80px",
        boxSizing: "border-box"
    },
    slotsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "10px"
    },
    slotButton: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "white",
        cursor: "pointer",
        fontSize: "14px",
        transition: "all 0.2s"
    },
    slotSelected: {
        background: "#4CAF50",
        color: "white",
        borderColor: "#4CAF50"
    },
    noSlots: {
        padding: "20px",
        textAlign: "center",
        background: "#f5f5f5",
        borderRadius: "8px",
        color: "#666"
    },
    loading: {
        padding: "20px",
        textAlign: "center",
        color: "#666"
    },
    submitButton: {
        width: "100%",
        padding: "14px",
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background 0.2s"
    }
};

export default BookingCalendar;