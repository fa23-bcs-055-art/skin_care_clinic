const Service = require('../models/Service');

// ✅ PUBLIC - Sirf active services dikhao
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort('order')
      .select('-__v -createdBy -updatedBy');
    res.json(services);
  } catch (error) {
    console.error('Error in getServices:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Saari services dikhao (edit/delete ke liye)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort('-createdAt')
      .populate('createdBy', 'name');
    res.json(services);
  } catch (error) {
    console.error('Error in getAllServices:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error in getServiceById:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Naya service add karo
exports.createService = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.description || !req.body.price || !req.body.duration) {
      return res.status(400).json({ 
        error: 'Name, description, price and duration are required' 
      });
    }

    console.log("💆 Creating new service:", {
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      price: req.body.price
    });

    const serviceData = {
      ...req.body,
      createdBy: req.user?.id
    };

    const service = await Service.create(serviceData);

    console.log("✅ Service created successfully:", {
      _id: service._id,
      name: service.name,
      image: service.image
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('❌ Error in createService:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Service edit karo
exports.updateService = async (req, res) => {
  try {
    console.log("💆 Updating service:", {
      id: req.params.id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category
    });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id
      },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    console.log("✅ Service updated successfully:", {
      _id: service._id,
      name: service.name,
      image: service.image
    });
    
    res.json(service);
  } catch (error) {
    console.error('❌ Error in updateService:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Service delete karo
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in deleteService:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Toggle service active status
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    service.isActive = !service.isActive;
    service.updatedBy = req.user?.id;
    await service.save();
    
    res.json({ 
      message: `Service ${service.isActive ? 'activated' : 'deactivated'}`,
      isActive: service.isActive 
    });
  } catch (error) {
    console.error('Error in toggleServiceStatus:', error);
    res.status(500).json({ error: error.message });
  }
};