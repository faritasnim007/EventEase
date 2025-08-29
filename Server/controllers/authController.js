const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  createJWT,
  createTokenUser,
  // sendVerificationEmail,
  // sendResetPasswordEmail,
  createHash,
} = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // First registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const tokenUser = createTokenUser(user);
  const token = createJWT({ payload: { user: tokenUser } });

  res.status(StatusCodes.CREATED).json({
    user: tokenUser,
    token,
    msg: 'User created successfully!',
  });
};


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  if (user.isBanned) {
    throw new CustomError.UnauthenticatedError('Your account has been banned');
  }

  const tokenUser = createTokenUser(user);
  const token = createJWT({ payload: { user: tokenUser } });

  res.status(StatusCodes.OK).json({
    user: tokenUser,
    token
  });
};

const logout = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    const origin = process.env.ORIGIN || 'http://localhost:5173';

    // In development, we'll just return the token
    if (process.env.NODE_ENV === 'development') {
      const tenMinutes = 1000 * 60 * 10;
      const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

      user.passwordToken = createHash(passwordToken);
      user.passwordTokenExpirationDate = passwordTokenExpirationDate;
      await user.save();

      res.status(StatusCodes.OK).json({
        msg: 'Password reset token created',
        passwordToken // Only in development
      });
      return;
    }

    // await sendResetPasswordEmail({
    //   name: user.name,
    //   email: user.email,
    //   token: passwordToken,
    //   origin,
    // });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: 'Password reset successful' });
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};