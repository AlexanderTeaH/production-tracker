const mongoose = require("mongoose");

const oilTanksReportSchema = mongoose.Schema({
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
    temperature: {
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

module.exports = mongoose.model("OilTankReport", oilTanksReportSchema);
