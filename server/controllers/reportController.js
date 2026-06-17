const Payment = require('../models/finance/Payment');
const SalarySlip = require('../models/finance/SalarySlip');
const InventoryLog = require('../models/inventory/InventoryLog');
const Expense = require('../models/finance/Expense');

exports.getFinancialSummary = async (req, res) => {
  try {
    const { period, year, month } = req.query;
    const curYear = parseInt(year);
    const curMonth = parseInt(month);

    let start = new Date(curYear, curMonth - 1, 1);
    let end = new Date(curYear, curMonth, 0, 23, 59, 59);

    if (period === 'yearly') {
      start = new Date(curYear, 0, 1);
      end = new Date(curYear, 11, 31, 23, 59, 59);
    }

    // 1. REVENUE (Approved Payments)
    const payments = await Payment.find({
      status: { $in: ['Success', 'Approved'] },
      paymentDate: { $gte: start, $lte: end }
    });
    const revenue = payments.reduce((s, p) => s + (p.amount || 0), 0);

    // 2. PAYROLL EXPENSES
    const slips = await SalarySlip.find({
      status: { $in: ['Paid', 'Approved'] },
      year: curYear,
      month: (period === 'monthly') ? curMonth : { $exists: true }
    });
    const payroll = slips.reduce((s, sl) => s + (sl.netSalary || 0), 0);

    // 3. INVENTORY EXPENSES
    const logs = await InventoryLog.find({
      type: 'Purchased',
      date: { $gte: start, $lte: end }
    });
    const inventory = logs.reduce((s, l) => s + ((l.quantityChanged || 0) * (l.purchasePrice || 0)), 0);

    // 4. OTHER EXPENSES
    const others = await Expense.find({ date: { $gte: start, $lte: end } });
    const otherExp = others.reduce((s, e) => s + (e.amount || 0), 0);

    const totalExp = payroll + inventory + otherExp;
    const profit = revenue - totalExp;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

    res.json({
      revenue,
      expenses: totalExp,
      profit,
      profitMargin,
      revenueCount: payments.length,
      expenseBreakdown: { payroll, inventory, other: otherExp }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};