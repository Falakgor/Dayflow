const express = require('express');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const auth = require('./middleware/authMiddleware');

const router = express.Router();

// View all attendance
router.get('/attendance', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const records = await Attendance.find();
  res.json(records);
});

// Approve/reject leave
router.put('/leave/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const leave = await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(leave);
});

// Update payroll
router.put('/payroll/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(payroll);
});

module.exports = router;
