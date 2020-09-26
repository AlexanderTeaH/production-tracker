const mongoose = require("mongoose");

const waterTanksReportSchema = mongoose.Schema({
    site: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    density: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("WaterTankReport", waterTanksReportSchema);
