const mongoose = require("mongoose");
const WellSite = require("../../../sites/well");

const waterProductionShiftReportSchema = mongoose.Schema({
    wellSite: {
        type: String,
        required: true,
        validate: function (wellSiteName) {
            return new Promise(function (resolve) {
                WellSite.findOne({ name: wellSiteName }, (error, result) => resolve(result ? true : false));
            });
        }
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

module.exports = mongoose.model("WaterProductionShiftReport", waterProductionShiftReportSchema, "reports.production.shifts.water");
