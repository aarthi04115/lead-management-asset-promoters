const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const avatarUploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(avatarUploadDir, { recursive: true });
    cb(null, avatarUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

// GET /api/employees - list all employees (admin) or self
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const employees = await User.find({ role: 'employee' }).select('-password').sort({ employeeId: 1 });
      return res.json(employees);
    }
    // employee: return own record
    const emp = await User.findById(req.user.id).select('-password');
    res.json([emp]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id).select('-password');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees - create new employee (admin only)
router.post('/', admin, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, password, title } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    
    const count = await User.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
    
    const emp = new User({ name, email, password, title, employeeId, role: 'employee', avatar });
    await emp.save();
    
    res.status(201).json({ id: emp._id, name: emp.name, email: emp.email, employeeId: emp.employeeId, title: emp.title, status: emp.status, score: emp.score, avatar: emp.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/employees/:id - update (admin only)
router.put('/:id', admin, upload.single('avatar'), async (req, res) => {
  try {
    const { name, title, bio, status, score } = req.body;
    const updateData = { name, title, bio, status, score };
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    const emp = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/employees/:id (admin only)
router.delete('/:id', admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
