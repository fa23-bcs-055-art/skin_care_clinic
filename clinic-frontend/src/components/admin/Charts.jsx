import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";

function Charts({ data }) {
  const [chartData, setChartData] = useState({
    monthlyRevenue: [],
    paymentMethods: {},
    topServices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      // Fetch monthly revenue data
      const currentYear = new Date().getFullYear();
      const monthlyPromises = [];
      
      for (let month = 0; month < 12; month++) {
        monthlyPromises.push(
          api.get(`/reports/financial-summary?period=monthly&year=${currentYear}&month=${month + 1}`)
            .catch(() => ({ data: { revenue: 0, expenses: 0 } }))
        );
      }
      
      const monthlyResults = await Promise.all(monthlyPromises);
      const monthlyRevenue = monthlyResults.map(res => res.data.revenue || 0);
      const monthlyExpenses = monthlyResults.map(res => res.data.expenses || 0);
      
      // Fetch payment methods
      const paymentsRes = await api.get("/payments/stats").catch(() => ({ data: { methodBreakdown: {} } }));
      
      setChartData({
        monthlyRevenue: monthlyRevenue,
        monthlyExpenses: monthlyExpenses,
        paymentMethods: paymentsRes.data.methodBreakdown || {},
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      });
      
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPKR = (value) => {
    if (value === undefined || value === null) return "₨0";
    return `₨${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="loader"></div>
        <p>Loading charts...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: "30px" }}
    >
      {/* Monthly Revenue Chart */}
      <div style={{
        background: "white",
        borderRadius: "15px",
        padding: "25px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#333" }}>📊 Monthly Revenue & Expenses</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Month</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Revenue (₨)</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Expenses (₨)</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Profit (₨)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.months?.map((month, i) => {
                const revenue = chartData.monthlyRevenue?.[i] || 0;
                const expense = chartData.monthlyExpenses?.[i] || 0;
                const profit = revenue - expense;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>{month}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: "#4CAF50" }}>{formatPKR(revenue)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: "#f44336" }}>{formatPKR(expense)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: profit >= 0 ? "#4CAF50" : "#f44336", fontWeight: "bold" }}>
                      {formatPKR(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f5f5f5", borderTop: "2px solid #ddd", fontWeight: "bold" }}>
                <td style={{ padding: "12px" }}>Total</td>
                <td style={{ padding: "12px", textAlign: "right", color: "#4CAF50" }}>
                  {formatPKR(chartData.monthlyRevenue?.reduce((a, b) => a + b, 0) || 0)}
                </td>
                <td style={{ padding: "12px", textAlign: "right", color: "#f44336" }}>
                  {formatPKR(chartData.monthlyExpenses?.reduce((a, b) => a + b, 0) || 0)}
                </td>
                <td style={{ padding: "12px", textAlign: "right", color: "#2196F3" }}>
                  {formatPKR((chartData.monthlyRevenue?.reduce((a, b) => a + b, 0) || 0) - (chartData.monthlyExpenses?.reduce((a, b) => a + b, 0) || 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment Methods Pie Chart */}
      {Object.keys(chartData.paymentMethods).length > 0 && (
        <div style={{
          background: "white",
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>💳 Payment Methods Breakdown</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "15px" 
          }}>
            {Object.entries(chartData.paymentMethods).map(([method, amount]) => (
              <div
                key={method}
                style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
                  borderRadius: "12px",
                  textAlign: "center",
                  transition: "transform 0.3s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                  {method === "Cash" ? "💵" : 
                   method === "Card" ? "💳" : 
                   method === "Easypaisa" ? "📱" : 
                   method === "JazzCash" ? "📱" : 
                   method === "Bank Transfer" ? "🏦" : "💰"}
                </div>
                <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}>{method}</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50" }}>{formatPKR(amount)}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                  {((amount / Object.values(chartData.paymentMethods).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Charts;