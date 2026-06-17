const SalaryConfig = require('../models/finance/SalaryConfig');
const SalarySlip = require('../models/finance/SalarySlip');
const User = require('../models/auth/User');
const Role = require('../models/auth/Role');

// 1. Get all employees for configuration
exports.getEmployeesForConfig = async (req, res) => {
  try {
    const users = await User.find({ status: 'active' }).populate('roleId');
    const configs = await SalaryConfig.find();
    
    const result = users.map(user => ({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.roleId?.roleName || 'Staff'
      },
      config: configs.find(c => c.userId.toString() === user._id.toString()) || null
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get single employee config
exports.getConfig = async (req, res) => {
  try {
    const config = await SalaryConfig.findOne({ userId: req.params.userId });
    res.json(config || { message: "No config found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Save or Update config
exports.saveConfig = async (req, res) => {
  try {
    const { basicSalary, allowances, deductions } = req.body;
    const config = await SalaryConfig.findOneAndUpdate(
      { userId: req.params.userId },
      { basicSalary, allowances, deductions },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Get defaults
exports.getDefaultSalaryByRole = async (req, res) => {
  res.json({
    SuperAdmin: 200000, Admin: 80000, Doctor: 150000, Staff: 40000
  });
};

// 5. Generate Batch
exports.generateBatch = async (req, res) => {
  try {
    const { month, year } = req.body;
    const users = await User.find({ status: 'active' });
    const configs = await SalaryConfig.find();
    let generatedCount = 0;

    for (let user of users) {
      const exists = await SalarySlip.findOne({ userId: user._id, month, year });
      if (exists) continue;

      const config = configs.find(c => c.userId.toString() === user._id.toString());
      if (!config) continue;

      const totalAllow = config.allowances.reduce((s, a) => s + (a.amount || 0), 0);
      const totalDed = config.deductions.reduce((s, d) => s + (d.amount || 0), 0);

      await SalarySlip.create({
        userId: user._id, month, year,
        basicSalary: config.basicSalary,
        totalAllowances: totalAllow,
        totalDeductions: totalDed,
        netSalary: config.basicSalary + totalAllow - totalDed,
        status: 'Draft'
      });
      generatedCount++;
    }
    res.json({ message: `Successfully generated ${generatedCount} slips.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Get Batch
exports.getBatch = async (req, res) => {
  try {
    const { month, year } = req.query;
    const slips = await SalarySlip.find({ month: parseInt(month), year: parseInt(year) }).populate('userId', 'name');
    res.json({
      slips,
      summary: { totalPayroll: slips.reduce((s, sl) => s + (sl.netSalary || 0), 0), count: slips.length }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Update Status
exports.updateStatus = async (req, res) => {
  try {
    const slip = await SalarySlip.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(slip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Export Bank File
exports.exportBankFile = async (req, res) => {
  res.send("Bank export data logic...");
};

// 9. Summary
exports.getPayrollSummary = async (req, res) => {
  try {
    const slips = await SalarySlip.find();
    res.json({
      totalPayroll: slips.reduce((s, sl) => s + (sl.netSalary || 0), 0),
      totalTransactions: slips.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 10. Get Slip by ID
exports.getSalarySlip = async (req, res) => {
  try {
    const slip = await SalarySlip.findById(req.params.id).populate('userId');
    res.json(slip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};