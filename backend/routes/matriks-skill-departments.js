const express = require("express");
const auth = require("../middleware/auth");
const MatriksSkillDepartment = require("../models/MatriksSkillDepartment");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const departments = await MatriksSkillDepartment.find({ deletedAt: null }).sort({ order: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error("Error fetching Matriks Skill departments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
