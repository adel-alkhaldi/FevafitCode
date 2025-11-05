import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try {
       const page = parseInt(req.query.page) || 1;
       const limit = parseInt(req.query.limit) || 2;
       const skip = (page - 1) * limit;
       const total = await User.countDocuments();
       const users = await User.find().skip(skip).limit(limit).select('-password');
       res.status(200).json({
        users, 
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page 
       })
    } catch (error) {
        console.error("Error Fetching Users:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const user  = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        return res.status(200).json({message: "User deleted successfully"})
    } catch (error) {
        console.error("Error Deleting User:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const getProfile = async (req, res) => {
    try {
        // Use the userId from the JWT payload
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });  
    } catch (error) {
        console.error("Error Fetching User Profile:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Exclude password and phoneNumber from updates
        const { password, phoneNumber, ...updateFields } = req.body;
        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error Updating User:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const getTrainers = async (req, res) => {
  try {
    // return users with role 'trainer' (case-insensitive)
    const trainers = await User.find({ role: { $regex: /^trainer$/i } })
      .select("_id fullName email role")
      .lean();
    return res.status(200).json({ trainers });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};