const Inventory = require('../models/inventory/Inventory');
const InventoryLog = require('../models/inventory/InventoryLog');
const Expense = require('../models/finance/Expense');
const { notifyAdmins } = require('./notificationController');

// Create inventory item - with expense tracking
exports.createItem = async (req, res) => {
  try {
    console.log('📦 Creating inventory item:', req.body);
    
    if (!req.body.productName) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const stockQty = parseInt(req.body.stockQuantity) || parseInt(req.body.quantity) || 0;
    const purchasePrice = parseFloat(req.body.purchasePrice) || 0;

    const itemData = {
      productName: req.body.productName,
      category: req.body.category || 'General',
      supplierId: req.body.supplierId || null,
      stockQuantity: stockQty,
      purchasePrice: purchasePrice,
      sellingPrice: parseFloat(req.body.sellingPrice) || 0,
      lowStockAlert: parseInt(req.body.lowStockAlert) || 10,
      expiryDate: req.body.expiryDate || null
    };

    const item = await Inventory.create(itemData);
    
    // ✅ Record inventory purchase as EXPENSE (using your Expense schema)
    if (stockQty > 0 && purchasePrice > 0) {
      const totalCost = stockQty * purchasePrice;
      
      // Create expense record with expenseType 'Equipment'
      await Expense.create({
        expenseType: 'Equipment',
        amount: totalCost,
        description: `Purchased ${stockQty} x ${item.productName} @ ₨${purchasePrice} each`,
        date: new Date(),
        recordedBy: req.user?._id
      });
      
      // Create inventory log
      await InventoryLog.create({
        productId: item._id,
        productName: item.productName,
        quantityChanged: stockQty,
        previousQuantity: 0,
        newQuantity: stockQty,
        type: 'Purchased',
        purchasePrice: purchasePrice,
        totalCost: totalCost,
        supplierId: item.supplierId,
        updatedBy: req.user?._id,
        notes: 'Initial stock purchase'
      });
    }

    if (item.supplierId) {
      await item.populate('supplierId');
    }
    
    // Low stock alert
    if (item.stockQuantity < item.lowStockAlert) {
      await notifyAdmins(
        'Low Stock Alert ⚠️',
        'LowStock',
        `${item.productName} has low stock. Current quantity: ${item.stockQuantity}`,
        { itemId: item._id }
      );
    }
    
    console.log('✅ Item created successfully with expense tracking');
    res.status(201).json(item);

  } catch (error) {
    console.error('❌ Error creating inventory item:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ FIXED: Add stock to inventory (with expense tracking)
exports.addStock = async (req, res) => {
  try {
    const { quantity, purchasePrice, notes } = req.body;
    const itemId = req.params.id;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Valid quantity is required" });
    }
    
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const previousQty = item.stockQuantity;
    const newQty = previousQty + parseInt(quantity);
    const pricePerUnit = purchasePrice || item.purchasePrice || 0;
    const totalCost = parseInt(quantity) * pricePerUnit;
    
    // Update inventory stock
    item.stockQuantity = newQty;
    if (purchasePrice && purchasePrice > 0) {
      // Update average purchase price
      const totalValue = (item.stockQuantity * item.purchasePrice) + totalCost;
      item.purchasePrice = totalValue / newQty;
    }
    await item.save();
    
    // ✅ Record as EXPENSE when adding stock (using your Expense schema)
    if (totalCost > 0) {
      await Expense.create({
        expenseType: 'Equipment',
        amount: totalCost,
        description: `Added ${quantity} x ${item.productName} @ ₨${pricePerUnit} each`,
        date: new Date(),
        recordedBy: req.user?._id
      });
    }
    
    // Create inventory log
    await InventoryLog.create({
      productId: item._id,
      productName: item.productName,
      quantityChanged: parseInt(quantity),
      previousQuantity: previousQty,
      newQuantity: newQty,
      type: 'Purchased',
      purchasePrice: pricePerUnit,
      totalCost: totalCost,
      supplierId: item.supplierId,
      updatedBy: req.user?._id,
      notes: notes || 'Stock added'
    });
    
    // Check low stock after addition
    if (item.stockQuantity < item.lowStockAlert) {
      await notifyAdmins(
        'Low Stock Alert ⚠️',
        'LowStock',
        `${item.productName} is still low. Current stock: ${item.stockQuantity}`,
        { itemId: item._id }
      );
    }
    
    res.json({ 
      success: true, 
      message: `Added ${quantity} units to ${item.productName}`,
      item 
    });
    
  } catch (error) {
    console.error('❌ Error adding stock:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Remove stock (for usage/wastage - NO expense record)
exports.removeStock = async (req, res) => {
  try {
    const { quantity, reason, notes } = req.body;
    const itemId = req.params.id;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Valid quantity is required" });
    }
    
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    if (item.stockQuantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }
    
    const previousQty = item.stockQuantity;
    const newQty = previousQty - parseInt(quantity);
    
    item.stockQuantity = newQty;
    await item.save();
    
    // Create inventory log (NO expense for removal - this is usage, not purchase)
    await InventoryLog.create({
      productId: item._id,
      productName: item.productName,
      quantityChanged: -parseInt(quantity),
      previousQuantity: previousQty,
      newQuantity: newQty,
      type: reason === 'Expired' ? 'Expired' : 'Used',
      updatedBy: req.user?._id,
      notes: notes || `Stock removed: ${reason || 'Usage'}`
    });
    
    // Check low stock alert
    if (item.stockQuantity < item.lowStockAlert) {
      await notifyAdmins(
        'Low Stock Alert ⚠️',
        'LowStock',
        `${item.productName} is running low! Current stock: ${item.stockQuantity}`,
        { itemId: item._id }
      );
    }
    
    res.json({ 
      success: true, 
      message: `Removed ${quantity} units from ${item.productName}`,
      item 
    });
    
  } catch (error) {
    console.error('❌ Error removing stock:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find()
      .populate('supplierId')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('❌ Error fetching items:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update inventory item
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('supplierId');
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Low stock check
    if (item.stockQuantity < item.lowStockAlert) {
      await notifyAdmins(
        'Low Stock Alert ⚠️',
        'LowStock',
        `${item.productName} is running low! Current stock: ${item.stockQuantity}`,
        { itemId: item._id }
      );
    }
    
    res.json(item);
  } catch (error) {
    console.error('❌ Error updating item:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete inventory item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Log deletion
    await InventoryLog.create({
      productId: item._id,
      productName: item.productName,
      quantityChanged: -item.stockQuantity,
      previousQuantity: item.stockQuantity,
      newQuantity: 0,
      type: 'Adjusted',
      updatedBy: req.user?._id,
      notes: 'Item deleted from inventory'
    });
    
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    console.error('❌ Error deleting item:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get inventory stats
exports.getInventoryStats = async (req, res) => {
  try {
    const items = await Inventory.find();
    
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.purchasePrice || 0) * (item.stockQuantity || 0)), 0);
    const lowStockItems = items.filter(item => (item.stockQuantity || 0) < (item.lowStockAlert || 10)).length;
    
    // Calculate total inventory expense (from Expense model with expenseType 'Equipment')
    const totalInventoryExpense = await Expense.aggregate([
      { $match: { expenseType: 'Equipment' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      totalItems,
      totalStock,
      totalValue,
      lowStockItems,
      expiredItems: 0,
      totalInventoryExpense: totalInventoryExpense[0]?.total || 0
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get inventory logs
exports.getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find()
      .populate('productId', 'productName')
      .populate('supplierId', 'supplierName')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
};