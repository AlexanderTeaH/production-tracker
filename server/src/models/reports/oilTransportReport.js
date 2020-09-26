const mongoose = require("mongoose");

const oilTransportReportSchema = mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
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

module.exports = mongoose.model("OilTransportReport", oilTransportReportSchema);
