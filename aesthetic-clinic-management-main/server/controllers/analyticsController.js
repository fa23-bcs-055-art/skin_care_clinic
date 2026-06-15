const Appointment = require('../models/appointment/Appointment');
const Patient = require('../models/patient/Patient');
const Payment = require('../models/finance/Payment');
const Expense = require('../models/finance/Expense');
const Inventory = require('../models/inventory/Inventory');
const User = require('../models/user/User');

// ===== DASHBOARD ANALYTICS =====
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    const now = new Date();
    
    // Date ranges
    const startDate = getStartDate(now, timeframe);
    
    // Parallel queries for performance
    const [
      revenueData,
      appointmentData,
      patientData,
      topServices,
      departmentStats
    ] = await Promise.all([
      getRevenueAnalytics(startDate, now),
      getAppointmentAnalytics(startDate, now),
      getPatientAnalytics(startDate, now),
      getTopServices(startDate, now),
      getDepartmentStats()
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenueData,
        appointments: appointmentData,
        patients: patientData,
        topServices,
        departments: departmentStats,
        timeframe
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== REVENUE ANALYTICS =====
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const matchStage = {
      status: 'Success',
      createdAt: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    };

    const groupStage = getGroupStage(groupBy);

    const revenue = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupStage,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      {
        $group: {
          _id: groupStage,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Calculate profit margins
    const analytics = revenue.map((rev, index) => ({
      period: rev._id,
      revenue: rev.total,
      expenses: expenses[index]?.total || 0,
      profit: rev.total - (expenses[index]?.total || 0),
      margin: ((rev.total - (expenses[index]?.total || 0)) / rev.total * 100).toFixed(2),
      transactionCount: rev.count
    }));

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== PATIENT ANALYTICS =====
exports.getPatientAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [
      newPatients,
      returningPatients,
      demographics,
      retentionRate
    ] = await Promise.all([
      // New patients in period
      Patient.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }),

      // Returning patients (more than 1 visit)
      Appointment.aggregate([
        { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
        { $group: { _id: '$patientId', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: 'total' }
      ]),

      // Demographics
      Patient.aggregate([
        {
          $group: {
            _id: '$gender',
            count: { $sum: 1 },
            averageAge: { $avg: { $subtract: [new Date(), '$dateOfBirth'] } }
          }
        }
      ]),

      // Retention rate calculation
      calculateRetentionRate(startDate, endDate)
    ]);

    res.json({
      success: true,
      data: {
        newPatients,
        returningPatients: returningPatients[0]?.total || 0,
        demographics,
        retentionRate,
        totalPatients: await Patient.countDocuments()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== APPOINTMENT ANALYTICS =====
exports.getAppointmentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
            status: '$status'
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              duration: '$totalDuration'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Calculate conversion rates
    const total = analytics.reduce((sum, day) => sum + day.total, 0);
    const completed = analytics.reduce((sum, day) => {
      const completedDay = day.statuses.find(s => s.status === 'Completed');
      return sum + (completedDay?.count || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        daily: analytics,
        totals: {
          total,
          completed,
          pending: total - completed,
          completionRate: ((completed / total) * 100).toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== PERFORMANCE METRICS =====
exports.getPerformanceMetrics = async (req, res) => {
  try {
    const metrics = await Promise.all([
      getRevenueGrowth(),
      getPatientAcquisition(),
      getAppointmentEfficiency(),
      getInventoryTurnover()
    ]);

    res.json({
      success: true,
      data: {
        revenueGrowth: metrics[0],
        patientAcquisition: metrics[1],
        appointmentEfficiency: metrics[2],
        inventoryTurnover: metrics[3]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== HELPER FUNCTIONS =====
const getStartDate = (now, timeframe) => {
  const date = new Date(now);
  switch(timeframe) {
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setMonth(date.getMonth() - 1);
  }
  return date;
};

const getGroupStage = (groupBy) => {
  switch(groupBy) {
    case 'day':
      return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    case 'week':
      return { $week: '$createdAt' };
    case 'month':
      return { $month: '$createdAt' };
    case 'year':
      return { $year: '$createdAt' };
    default:
      return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }
};

const getRevenueAnalytics = async (startDate, endDate) => {
  return await Payment.aggregate([
    {
      $match: {
        status: 'Success',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        daily: { $sum: '$amount' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const getAppointmentAnalytics = async (startDate, endDate) => {
  return await Appointment.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const getPatientAnalytics = async (startDate, endDate) => {
  return await Patient.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        new: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const getTopServices = async (startDate, endDate) => {
  return await Appointment.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'treatments',
        localField: 'treatmentId',
        foreignField: '_id',
        as: 'treatment'
      }
    },
    { $unwind: '$treatment' },
    {
      $group: {
        _id: '$treatment.name',
        count: { $sum: 1 },
        revenue: { $sum: '$treatment.price' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
};

const getDepartmentStats = async () => {
  return await User.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } }
      }
    }
  ]);
};

const calculateRetentionRate = async (startDate, endDate) => {
  const totalPatients = await Patient.countDocuments({
    createdAt: { $lte: endDate }
  });

  const retainedPatients = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$patientId',
        lastVisit: { $max: '$appointmentDate' }
      }
    },
    {
      $match: {
        lastVisit: { $gte: new Date(startDate) }
      }
    },
    { $count: 'total' }
  ]);

  return totalPatients > 0 
    ? ((retainedPatients[0]?.total || 0) / totalPatients * 100).toFixed(2)
    : 0;
};

const getRevenueGrowth = async () => {
  const thisMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [current, previous] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: {
            $gte: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1),
            $lt: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: {
            $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
            $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const currentTotal = current[0]?.total || 0;
  const previousTotal = previous[0]?.total || 0;

  return {
    current: currentTotal,
    previous: previousTotal,
    growth: previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(2)
      : 100
  };
};

const getPatientAcquisition = async () => {
  const thisMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [current, previous] = await Promise.all([
    Patient.countDocuments({
      createdAt: {
        $gte: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1),
        $lt: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1)
      }
    }),
    Patient.countDocuments({
      createdAt: {
        $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1)
      }
    })
  ]);

  return {
    current,
    previous,
    growth: previous > 0 ? ((current - previous) / previous * 100).toFixed(2) : 100
  };
};

const getAppointmentEfficiency = async () => {
  const appointments = await Appointment.aggregate([
    {
      $match: {
        status: 'Completed',
        appointmentDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
      }
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$duration' },
        total: { $sum: 1 },
        onTime: {
          $sum: {
            $cond: [
              { $lte: ['$actualStartTime', '$appointmentDate'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return {
    averageDuration: appointments[0]?.avgDuration || 0,
    onTimeRate: appointments[0]?.total > 0 
      ? ((appointments[0]?.onTime / appointments[0]?.total) * 100).toFixed(2)
      : 100
  };
};

const getInventoryTurnover = async () => {
  const inventory = await Inventory.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        totalItems: { $sum: '$quantity' },
        lowStock: { $sum: { $cond: [{ $lt: ['$quantity', 10] }, 1, 0] } }
      }
    }
  ]);

  return {
    totalValue: inventory[0]?.totalValue || 0,
    totalItems: inventory[0]?.totalItems || 0,
    lowStockCount: inventory[0]?.lowStock || 0,
    healthScore: calculateHealthScore(inventory[0])
  };
};

const calculateHealthScore = (data) => {
  if (!data) return 0;
  const stockScore = (data.totalItems - data.lowStock) / data.totalItems * 100;
  const valueScore = Math.min(data.totalValue / 100000, 100);
  return Math.round((stockScore + valueScore) / 2);
};