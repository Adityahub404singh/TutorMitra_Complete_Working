import Session from "../models/session.js";

// Get upcoming sessions for logged-in student
export const getUpcomingSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const today = new Date();

    const sessions = await Session.find({
      studentId,
      date: { $gte: today },
      status: "scheduled",
    })
      .populate("tutorId", "name email")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
