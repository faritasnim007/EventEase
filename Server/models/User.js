const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'organiser', 'user'],
      default: 'user',
    },
    // Demographic data
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age cannot exceed 120'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    phone: {
      type: String,
      maxlength: 20,
    },
    department: {
      type: String,
      maxlength: 100,
    },
    year: {
      type: String,
      enum: ['First Year',
        'Second Year',
        'Third Year',
        'Fourth Year',
        'Graduate',
        'PhD',
        'Faculty',
        'Staff',],
    },
    interests: [{
      type: String,
      maxlength: 50,
    }],
    bio: {
      type: String,
      maxlength: 500,
    },
    profileImage: {
      type: String,
      default: '',
    },
    passwordToken: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bannedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    bannedAt: Date,
    bannedReason: String,
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);