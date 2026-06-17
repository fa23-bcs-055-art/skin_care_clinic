import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function ClinicSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [newHoliday, setNewHoliday] = useState({ date: "", reason: "" });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get("/admin/clinic-settings");
            setSettings(res.data);
        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updatedSettings) => {
        try {
            await api.put("/admin/clinic-settings", updatedSettings);
            toast.success("Settings updated successfully");
            fetchSettings();
            setEditing(false);
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    const addHoliday = async () => {
        if (!newHoliday.date || !newHoliday.reason) {
            return toast.error("Please enter date and reason");
        }

        try {
            await api.post("/admin/clinic-settings/holidays", newHoliday);
            toast.success("Holiday added");
            fetchSettings();
            setNewHoliday({ date: "", reason: "" });
        } catch (error) {
            toast.error("Failed to add holiday");
        }
    };

    const removeHoliday = async (holidayId) => {
        try {
            await api.delete(`/admin/clinic-settings/holidays/${holidayId}`);
            toast.success("Holiday removed");
            fetchSettings();
        } catch (error) {
            toast.error("Failed to remove holiday");
        }
    };

    const toggleDayStatus = (day, isOpen) => {
        const updated = { ...settings };
        updated.weeklyHours[day].isOpen = isOpen;
        updateSettings(updated);
    };

    const updateDayTimings = (day, field, value) => {
        const updated = { ...settings };
        updated.weeklyHours[day][field] = value;
        updateSettings(updated);
    };

    if (loading) {
        return <div style={styles.loading}>Loading settings...</div>;
    }

    if (!settings) {
        return <div style={styles.error}>Failed to load settings</div>;
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.container}
        >
            <h1 style={styles.title}>⚙️ Clinic Settings</h1>

            {/* Weekly Hours Section */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>📅 Weekly Operating Hours</h2>
                <p style={styles.defaultInfo}>Default: 3:00 PM - 7:00 PM | Saturday & Sunday Closed</p>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Status</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((day, idx) => (
                                <tr key={day}>
                                    <td style={styles.dayCell}>
                                        <strong>{dayNames[idx]}</strong>
                                    </td>
                                    <td>
                                        <label style={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={settings.weeklyHours[day].isOpen}
                                                onChange={(e) => toggleDayStatus(day, e.target.checked)}
                                            />
                                            <span style={styles.slider}></span>
                                        </label>
                                    </td>
                                    <td>
                                        <input
                                            type="time"
                                            value={settings.weeklyHours[day].start}
                                            onChange={(e) => updateDayTimings(day, 'start', e.target.value)}
                                            disabled={!settings.weeklyHours[day].isOpen}
                                            style={styles.timeInput}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="time"
                                            value={settings.weeklyHours[day].end}
                                            onChange={(e) => updateDayTimings(day, 'end', e.target.value)}
                                            disabled={!settings.weeklyHours[day].isOpen}
                                            style={styles.timeInput}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slot Configuration */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>⏰ Slot Configuration</h2>
                <div style={styles.configGrid}>
                    <div>
                        <label style={styles.label}>Slot Duration (minutes)</label>
                        <select
                            value={settings.slotDuration}
                            onChange={(e) => updateSettings({ ...settings, slotDuration: parseInt(e.target.value) })}
                            style={styles.select}
                        >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>Advance Booking (days)</label>
                        <input
                            type="number"
                            value={settings.advanceBookingDays}
                            onChange={(e) => updateSettings({ ...settings, advanceBookingDays: parseInt(e.target.value) })}
                            style={styles.input}
                            min="1"
                            max="90"
                        />
                    </div>
                </div>
            </div>

            {/* Holidays Section */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>🎉 Holidays & Closed Days</h2>

                <div style={styles.addHoliday}>
                    <input
                        type="date"
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Reason (e.g., Eid, Independence Day)"
                        value={newHoliday.reason}
                        onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                        style={{ ...styles.input, flex: 2 }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addHoliday}
                        style={styles.addButton}
                    >
                        + Add Holiday
                    </motion.button>
                </div>

                {settings.holidays.length > 0 && (
                    <div style={styles.holidayList}>
                        {settings.holidays.map(holiday => (
                            <motion.div
                                key={holiday._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={styles.holidayItem}
                            >
                                <span>
                                    📅 {new Date(holiday.date).toLocaleDateString()} - {holiday.reason}
                                </span>
                                <button
                                    onClick={() => removeHoliday(holiday._id)}
                                    style={styles.removeButton}
                                >
                                    ❌
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Note */}
            <div style={styles.infoNote}>
                💡 <strong>Note:</strong> Any changes to timings will immediately reflect in the booking system.
                Customers will only see slots within the defined working hours.
            </div>
        </motion.div>
    );
}

const styles = {
    container: {
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto"
    },
    title: {
        marginBottom: "30px",
        color: "#333"
    },
    card: {
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "25px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    },
    sectionTitle: {
        margin: "0 0 20px 0",
        color: "#555",
        fontSize: "18px"
    },
    defaultInfo: {
        fontSize: "13px",
        color: "#666",
        marginBottom: "15px",
        padding: "8px",
        background: "#f5f5f5",
        borderRadius: "6px"
    },
    tableContainer: {
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    dayCell: {
        padding: "12px 8px",
        borderBottom: "1px solid #eee"
    },
    switch: {
        position: "relative",
        display: "inline-block",
        width: "50px",
        height: "24px"
    },
    slider: {
        position: "absolute",
        cursor: "pointer",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ccc",
        transition: "0.4s",
        borderRadius: "24px"
    },
    timeInput: {
        padding: "6px 10px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        fontSize: "14px"
    },
    configGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px"
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#555"
    },
    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        boxSizing: "border-box"
    },
    select: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        background: "white"
    },
    addHoliday: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap"
    },
    addButton: {
        padding: "10px 20px",
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
    },
    holidayList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    holidayItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 15px",
        background: "#f9f9f9",
        borderRadius: "8px",
        borderLeft: "4px solid #f44336"
    },
    removeButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        padding: "5px"
    },
    infoNote: {
        padding: "15px",
        background: "#e3f2fd",
        borderRadius: "8px",
        color: "#1976d2",
        fontSize: "14px"
    },
    loading: {
        textAlign: "center",
        padding: "50px",
        color: "#666"
    },
    error: {
        textAlign: "center",
        padding: "50px",
        color: "#f44336"
    }
};

export default ClinicSettings;