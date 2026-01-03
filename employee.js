const express = require('express');
const auth = require('./middleware/authMiddleware');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const User = require('../models/User');

const router = express.Router();

/**
 * PROFILE
 */
// GET /api/employee/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/employee/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { phone, address, profilePictureUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone, address, profilePictureUrl },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * ATTENDANCE
 */
// GET /api/employee/attendance
router.get('/attendance', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/employee/attendance/checkin
router.post('/attendance/checkin', auth, async (req, res) => {
  try {
    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await Attendance.findOne({ user: req.user.id, date: dateOnly });
    if (existing) return res.status(400).json({ error: 'Attendance already marked for today' });

    const record = await Attendance.create({
      user: req.user.id,
      date: dateOnly,
      status: 'Present',
      checkIn: req.body.checkIn || '09:00 AM'
    });

    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/employee/attendance/checkout
router.post('/attendance/checkout', auth, async (req, res) => {
  try {
    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const record = await Attendance.findOne({ user: req.user.id, date: dateOnly });
    if (!record) return res.status(400).json({ error: 'No check-in found for today' });

    record.checkOut = req.body.checkOut || '06:00 PM';
    await record.save();
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * LEAVE
 */
// POST /api/employee/leave
router.post('/leave', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, remarks } = req.body;
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const leave = await Leave.create({
      user: req.user.id,
      type,
      startDate,
      endDate,
      remarks,
      status: 'Pending'
    });

    res.json(leave);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/employee/leave
router.get('/leave', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PAYROLL
 */
// GET /api/employee/payroll
router.get('/payroll', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ user: req.user.id });
    if (!payroll) return res.status(404).json({ error: 'Payroll not found' });
    res.json(payroll);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
