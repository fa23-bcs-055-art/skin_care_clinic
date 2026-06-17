const Blog = require('../models/content/Blog');

// ✅ PUBLIC - Published blogs dikhao
exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort('-createdAt')
      .limit(10);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUBLIC - Single blog
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Views count increase
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Saare blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Naya blog
exports.createBlog = async (req, res) => {
  try {
    console.log("📝 Creating new blog:", {
      title: req.body.title,
      image: req.body.image,
      category: req.body.category,
      author: req.user.name
    });

    const blog = await Blog.create({
      ...req.body,
      author: req.user.name,
      createdBy: req.user.id
    });

    console.log("✅ Blog created successfully:", {
      _id: blog._id,
      title: blog.title,
      image: blog.image
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Blog edit
exports.updateBlog = async (req, res) => {
  try {
    console.log("📝 Updating blog:", {
      id: req.params.id,
      title: req.body.title,
      image: req.body.image,
      category: req.body.category
    });

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    console.log("✅ Blog updated successfully:", {
      _id: blog._id,
      title: blog.title,
      image: blog.image
    });

    res.json(blog);
  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Blog delete
exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};