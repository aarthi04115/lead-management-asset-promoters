const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  title: { type: String, default: 'Sales Agent' },
  bio: { type: String },
  avatar: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  employeeId: { type: String, unique: true },
  score: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
