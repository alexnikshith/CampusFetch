import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { sendOtpEmail } from '../utils/mailer';
import { AuthRequest } from '../middleware/auth';

const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const JWT_SECRET = process.env.JWT_SECRET || 'campusfetch_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'campusfetch_super_secret_refresh_key_2026';

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid college email is required' });
    }

    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save OTP record
    await prisma.otpRecord.create({
      data: {
        email: email.toLowerCase().trim(),
        otp,
        expiresAt,
      },
    });

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'Verification OTP sent to your college email address',
      expiresInMinutes: 5,
      // For easy demo testing:
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (err: any) {
    console.error('requestOtp error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

export const verifyOtpAndRegister = async (req: Request, res: Response) => {
  try {
    const {
      username,
      fullName,
      email,
      phone,
      gender,
      department,
      year,
      hostel,
      roomNumber,
      otp,
      role = 'CUSTOMER',
    } = req.body;

    if (!email || !otp || !username || !fullName) {
      return res.status(400).json({ success: false, error: 'Missing required registration parameters' });
    }

    const formattedEmail = email.toLowerCase().trim();

    // Check OTP
    const validOtp = await prisma.otpRecord.findFirst({
      where: {
        email: formattedEmail,
        otp: otp.trim(),
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP verification code' });
    }

    // Mark OTP as used
    await prisma.otpRecord.update({
      where: { id: validOtp.id },
      data: { used: true },
    });

    // Check existing user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: formattedEmail }, { username: username.trim() }],
      },
    });

    if (user) {
      return res.status(400).json({ success: false, error: 'User with this email or username already exists' });
    }

    // Fetch default Amrita University
    const university = await prisma.university.findFirst();

    // Create user
    user = await prisma.user.create({
      data: {
        username: username.trim(),
        fullName: fullName.trim(),
        email: formattedEmail,
        phone: phone || '',
        gender: gender || 'Other',
        department: department || 'Computer Science',
        year: year || '3rd Year',
        hostel: hostel || 'Gargi Hostel',
        roomNumber: roomNumber || '101',
        role: role.toUpperCase(),
        universityId: university?.id,
        isVerified: true,
        trustScore: 85.0,
        walletBalance: 150.0, // Welcome bonus balance
      },
    });

    // Generate Tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created and verified successfully',
      user,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error('verifyOtpAndRegister error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
};

export const loginWithOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required for login' });
    }

    const formattedEmail = email.toLowerCase().trim();

    // Find OTP
    const validOtp = await prisma.otpRecord.findFirst({
      where: {
        email: formattedEmail,
        otp: otp.trim(),
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired login OTP code' });
    }

    // Mark OTP as used
    await prisma.otpRecord.update({
      where: { id: validOtp.id },
      data: { used: true },
    });

    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'No CampusFetch account found with this email' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended by campus administration' });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error('loginWithOtp error:', err);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        university: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { fullName, phone, gender, department, year, hostel, roomNumber, profilePic, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName !== undefined ? fullName : undefined,
        phone: phone !== undefined ? phone : undefined,
        gender: gender !== undefined ? gender : undefined,
        department: department !== undefined ? department : undefined,
        year: year !== undefined ? year : undefined,
        hostel: hostel !== undefined ? hostel : undefined,
        roomNumber: roomNumber !== undefined ? roomNumber : undefined,
        profilePic: profilePic !== undefined ? profilePic : undefined,
        role: role !== undefined ? role : undefined,
      },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};
