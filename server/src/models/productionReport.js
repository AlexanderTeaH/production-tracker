const mongoose = require("mongoose");

const productionReportSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    site: {
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
    }
});

module.exports = mongoose.model("ProductionReport", productionReportSchema, "production-reports");
