const mongoose = require("mongoose");

const waterTransportReportSchema = mongoose.Schema({
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

module.exports = mongoose.model("WaterTransportReport", waterTransportReportSchema);
