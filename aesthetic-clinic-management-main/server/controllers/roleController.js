const Role = require('../models/auth/Role');

// Create role
exports.createRole = async (req, res) => {
  try {
    const { roleName, permissions, description, level } = req.body;

    // Check if role exists
    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(400).json({ error: 'Role already exists' });
    }

    const role = await Role.create({
      roleName,
      permissions: permissions || [],
      description,
      level: level || 0
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ level: 1 });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { roleName, permissions, description, level } = req.body;
    const roleId = req.params.id;

    // Prevent modification of SuperAdmin role
    const existingRole = await Role.findById(roleId);
    if (existingRole?.roleName === 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot modify SuperAdmin role' });
    }

    const role = await Role.findByIdAndUpdate(
      roleId,
      { roleName, permissions, description, level },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    // Prevent deletion of SuperAdmin role
    const role = await Role.findById(roleId);
    if (role?.roleName === 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot delete SuperAdmin role' });
    }

    // Check if role is assigned to any users
    const User = require('../models/auth/User');
    const usersWithRole = await User.countDocuments({ roleId });
    
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        error: `Cannot delete role assigned to ${usersWithRole} users` 
      });
    }

    await Role.findByIdAndDelete(roleId);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get permissions list
exports.getPermissions = async (req, res) => {
  const permissions = [
    'view_dashboard',
    'manage_patients',
    'view_patients',
    'manage_appointments',
    'view_appointments',
    'manage_finance',
    'view_finance',
    'manage_inventory',
    'view_inventory',
    'manage_users',
    'view_users',
    'view_reports',
    'export_data',
    'manage_settings'
  ];
  res.json(permissions);
};