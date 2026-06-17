const User = require('../models/auth/User');
const Role = require('../models/auth/Role');
const bcrypt = require('bcryptjs');

// Get all users with filters
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    // Apply filters
    if (role) {
      if (role.match(/^[0-9a-fA-F]{24}$/)) {
        query.roleId = role;
      } else {
        // Case-insensitive role name search
        const roleDoc = await Role.findOne({ 
          roleName: { $regex: new RegExp('^' + role + '$', 'i') } 
        });
        if (roleDoc) {
          query.roleId = roleDoc._id;
        } else {
          query.roleId = null;
        }
      }
    }
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('roleId')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .select('-password -resetPasswordToken -resetPasswordExpire');

    // Get all roles for filtering
    const roles = await Role.find().select('roleName');

    res.json({
      users,
      roles,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roleId')
      .populate('createdBy', 'name email')
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If it's a patient, also fetch patient details
    let userData = user.toObject();
    const Patient = require('../models/patient/Patient');
    const patient = await Patient.findOne({ userId: user._id });
    
    if (patient) {
      userData = {
        ...userData,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        bloodType: patient.bloodGroup,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies
      };
    }

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, roleId, department, status } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      roleId,
      department: department || null,
      status: status || 'active',
      createdBy: req.user.id,
      loginAttempts: 0
    });

    const populatedUser = await User.findById(user._id)
      .populate('roleId')
      .populate('createdBy', 'name email')
      .select('-password');

    res.status(201).json(populatedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { 
      name, phone, profileImage, department, 
      dateOfBirth, gender, address, bloodType, medicalHistory, allergies 
    } = req.body;
    let { roleId, status } = req.body;
    const userId = req.params.id;

    // 1. Security Check
    const targetUser = await User.findById(userId).populate('roleId');
    const currentUser = await User.findById(req.user.id).populate('roleId');

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isAdmin = ['SuperAdmin', 'Admin'].includes(currentUser?.roleId?.roleName);

    // Prevent non-admins from changing role or status
    if (!isAdmin) {
      roleId = targetUser.roleId._id;
      status = targetUser.status;
    }

    // Prevent SuperAdmin from being modified by non-SuperAdmin
    if (targetUser.roleId.roleName === 'SuperAdmin' && 
        currentUser?.roleId?.roleName !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot modify SuperAdmin user' });
    }

    // 2. Update User Record
    // Handle roleId if it's an object (populated)
    const updateData = { name, phone, status };
    if (profileImage) updateData.profileImage = profileImage;
    if (isAdmin) {
      if (roleId) updateData.roleId = roleId._id || roleId;
      if (department) updateData.department = department;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('roleId')
      .select('-password');

    // 3. Update Patient Record (if user is a patient or has patient data)
    const Patient = require('../models/patient/Patient');
    let patient = await Patient.findOne({ userId: user._id });
    
    if (!patient && (dateOfBirth || address || gender)) {
      // Create patient profile if it doesn't exist but data is provided
      patient = new Patient({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }

    if (patient) {
      if (name) patient.name = name;
      if (phone) patient.phone = phone;
      if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
      if (gender) patient.gender = gender;
      if (address) patient.address = address;
      if (bloodType) patient.bloodGroup = bloodType;
      if (medicalHistory) patient.medicalHistory = medicalHistory;
      if (allergies) patient.allergies = allergies;
      
      await patient.save();
    }

    // Return merged data
    const finalData = user.toObject();
    if (patient) {
      Object.assign(finalData, {
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        bloodType: patient.bloodGroup,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies
      });
    }

    res.json(finalData);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Prevent SuperAdmin deactivation
    const targetUser = await User.findById(id).populate('roleId');
    const currentUser = await User.findById(req.user.id).populate('roleId');

    if (targetUser?.roleId?.roleName === 'SuperAdmin' && 
        currentUser?.roleId?.roleName !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot modify SuperAdmin status' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('roleId')
      .select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent SuperAdmin deletion
    const targetUser = await User.findById(id).populate('roleId');
    const currentUser = await User.findById(req.user.id).populate('roleId');

    if (targetUser?.roleId?.roleName === 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot delete SuperAdmin user' });
    }

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile (for current user)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, profileImage },
      { new: true, runValidators: true }
    )
      .populate('roleId')
      .select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
};