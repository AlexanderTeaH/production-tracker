const mongoose = require("mongoose");

const productionReportSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: Date,
    site: String,
    volume: Number,
    temperature: Number
});

module.exports = mongoose.model("ProductionReport", productionReportSchema, "production-reports");
