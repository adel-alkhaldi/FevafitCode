import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const {
      EID,
      phoneNumber,
      fullName,
      gender,
      dob, // frontend sends dob (YYYY-MM-DD)
      role,
      employedCompany,
      companyDept,
      baselineVitals,
      email,
      password,
    } = req.body;

    // Validate required fields (require dob instead of age)
    if (!fullName || !gender || !dob || !role || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: "Missing required fields. dob is required instead of age." });
    }

    // Normalize and validate role
    const roleNormalized = String(role).toLowerCase();
    const validRoles = ["attendee", "admin", "viewer", "trainer"];
    if (!validRoles.includes(roleNormalized)) {
      return res.status(422).json({ error: "Invalid role." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ error: "Phone Number already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // store dob as Date
    const dobDate = new Date(dob);
    if (Number.isNaN(dobDate.getTime())) {
      return res.status(422).json({ error: "Invalid dob format. Use YYYY-MM-DD." });
    }

    // Create user object
    const user = new User({
      EID,
      phoneNumber,
      fullName,
      gender,
      dob: dobDate,
      role: roleNormalized,
      employedCompany,
      companyDept,
      baselineVitals,
      email,
      password: hashedPassword,
    });

    await user.save();
    return res.status(201).json({ user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Server error." });
  }
};

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ message: 'Phone number and password are required' });
  }

  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });

  } catch (error) {
    console.error('Error Logging In:', error);
    return res.status(500).json({ message: 'server error' });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if(!user){
      return res.status(404).json({message: "User not found"})
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m"}
    )

    res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        fullName: user.fullName, // <-- added
      }
    })

  } 
  
  catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export const logout = (req, res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict"
    })
    res.status(200).json({ message: "Logged out Successfully"})

  }