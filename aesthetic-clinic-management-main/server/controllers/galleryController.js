const Gallery = require('../models/content/Gallery');
const BeforeAfterImage = require('../models/patient/BeforeAfterImage');

// ✅ PUBLIC - Active images dikhao
exports.getActiveGallery = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }
    
    const images = await Gallery.find(query)
      .sort('order')
      .limit(50);

    console.log("📷 Fetching active gallery:", {
      category: category || 'all',
      found: images.length,
      images: images.map(img => ({ title: img.title, image: img.image }))
    });
      
    res.json(images);
  } catch (error) {
    console.error('❌ Error in getActiveGallery:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUBLIC - Get before/after images
exports.getBeforeAfter = async (req, res) => {
  try {
    const images = await BeforeAfterImage.find({ isPublished: true })
      .populate('patientId', 'name')
      .populate('treatmentId', 'name')
      .sort('-date')
      .limit(30);
      
    res.json(images);
  } catch (error) {
    console.error('Error in getBeforeAfter:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Saari images
exports.getAllGallery = async (req, res) => {
  try {
    const images = await Gallery.find()
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    res.json(images);
  } catch (error) {
    console.error('Error in getAllGallery:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Naya image add
exports.uploadImage = async (req, res) => {
  try {
    if (!req.body.title || !req.body.image) {
      return res.status(400).json({ error: 'Title and image are required' });
    }

    console.log("📸 Uploading gallery image:", {
      title: req.body.title,
      imagePath: req.body.image,
      category: req.body.category,
      userId: req.user?.id
    });

    const image = await Gallery.create({
      ...req.body,
      uploadedBy: req.user?.id
    });

    console.log("✅ Gallery image saved:", {
      _id: image._id,
      title: image.title,
      image: image.image
    });
    
    res.status(201).json(image);
  } catch (error) {
    console.error('❌ Error in uploadImage:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Upload before/after image
exports.uploadBeforeAfter = async (req, res) => {
  try {
    const { patientId, treatmentId, beforeImage, afterImage, description } = req.body;
    
    if (!patientId || !treatmentId || !beforeImage || !afterImage) {
      return res.status(400).json({ 
        error: 'Patient, treatment, before and after images are required' 
      });
    }

    console.log('📸 uploadBeforeAfter payload:', { patientId, treatmentId, beforeImage, afterImage, description, userId: req.user?.id });

    const image = await BeforeAfterImage.create({
      patientId,
      treatmentId,
      beforeImage,
      afterImage,
      description,
      uploadedBy: req.user?.id
    });

    console.log('✅ before/after saved:', { _id: image._id, beforeImage: image.beforeImage, afterImage: image.afterImage });
    
    res.status(201).json(image);
  } catch (error) {
    console.error('Error in uploadBeforeAfter:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Image update
exports.updateImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json(image);
  } catch (error) {
    console.error('Error in updateImage:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Image delete
exports.deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error in deleteImage:', error);
    res.status(500).json({ error: error.message });
  }
};
// ✅ ADMIN - Before/After delete
exports.deleteBeforeAfter = async (req, res) => {
  try {
    const image = await BeforeAfterImage.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Before/After resource not found' });
    }

    res.json({ message: 'Before/After deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBeforeAfter:', error);
    res.status(500).json({ error: error.message });
  }
};