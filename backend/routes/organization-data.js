const express = require("express");
const router = express.Router();
const OrganizationData = require("../models/OrganizationData");
const auth = require("../middleware/auth");

// GET /api/organization-data
router.get("/", auth, async (req, res) => {
  try {
    const record = await OrganizationData.findOne().sort({ updatedAt: -1 });
    return res.json({ success: true, data: record ? record.data : null });
  } catch (err) {
    console.error("GET /api/organization-data error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/organization-data
router.put("/", auth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ success: false, message: "Data wajib diisi" });

    const updatedBy = req.user?.name || req.user?.email || "system";

    let record = await OrganizationData.findOne();
    if (record) {
      record.data = data;
      record.updatedBy = updatedBy;
      await record.save();
    } else {
      record = await OrganizationData.create({ data, updatedBy });
    }

    return res.json({ success: true, message: "Data tersimpan", updatedAt: record.updatedAt });
  } catch (err) {
    console.error("PUT /api/organization-data error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
