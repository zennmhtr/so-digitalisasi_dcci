const express = require("express");
const router = express.Router();
const SOBagianData = require("../models/SOBagianData");
const auth = require("../middleware/auth");

// GET /api/so-bagian-data/:bagianId — ambil data 1 bagian
router.get("/:bagianId", auth, async (req, res) => {
  try {
    const record = await SOBagianData.findOne({ bagianId: req.params.bagianId });
    if (!record) return res.json({ success: true, data: null });
    return res.json({ success: true, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/so-bagian-data — ambil semua bagian
router.get("/", auth, async (req, res) => {
  try {
    const records = await SOBagianData.find({});
    return res.json({ success: true, data: records });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/so-bagian-data/:bagianId — save/update seluruh data bagian
router.put("/:bagianId", auth, async (req, res) => {
  try {
    const { bagianName, columns, header, boxes } = req.body;
    const record = await SOBagianData.findOneAndUpdate(
      { bagianId: req.params.bagianId },
      { bagianId: req.params.bagianId, bagianName, columns, header, boxes },
      { upsert: true, new: true }
    );
    return res.json({ success: true, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/so-bagian-data/:bagianId/box — tambah 1 box baru
router.post("/:bagianId/box", auth, async (req, res) => {
  try {
    const { id, code, title, name, empId, column, parentId, order } = req.body;
    const record = await SOBagianData.findOne({ bagianId: req.params.bagianId });
    if (!record) return res.status(404).json({ success: false, message: "Bagian tidak ditemukan" });

    record.boxes.push({ id, code, title, name, empId, column, parentId, order });
    await record.save();
    return res.json({ success: true, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/so-bagian-data/:bagianId/box/:boxId — hapus 1 box
router.delete("/:bagianId/box/:boxId", auth, async (req, res) => {
  try {
    const record = await SOBagianData.findOne({ bagianId: req.params.bagianId });
    if (!record) return res.status(404).json({ success: false, message: "Bagian tidak ditemukan" });

    record.boxes = record.boxes.filter(b => b.id !== req.params.boxId);
    await record.save();
    return res.json({ success: true, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
