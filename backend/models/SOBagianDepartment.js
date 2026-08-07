const mongoose = require('mongoose');

const soBagianDepartmentSchema = new mongoose.Schema({
    bagianId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
    },
    route: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: 'bg-gray-500',
    },
    columns: {
        type: [String],
        default: ['BOARD OF DIRECTOR', 'DEPARTMENT HEAD', 'SECTION HEAD', 'STAFF'],
    },
    groups: {
        type: mongoose.Schema.Types.Mixed, // { [column]: string[] }
        default: {},
    },
    header: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    order: {
        type: Number,
        default: 0,
    },
    isCustom: {
        type: Boolean,
        default: true, // true = dibuat lewat Add Department, false = 12 dept bawaan
    },
    deletedAt: {
        type: Date,
        default: null, // soft-delete, biar history/print lama tidak rusak
    },
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('SOBagianDepartment', soBagianDepartmentSchema);