const mongoose = require("mongoose");
const WellSite = require("../../../sites/well");

const oilProductionDailyReportSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function (date) {
                return date.getUTCHours() == 0
                    && date.getUTCMinutes() == 0
                    && date.getUTCSeconds() == 0
                    && date.getUTCMilliseconds() == 0;
            }
        }
    },
    productionPeriod: {
        type: Number,
        required: true
    },
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
    temperature: {
        type: Number,
        required: true
    },
    density: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    totalDailyVolume: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    totalDailyWeight: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("OilProductionDailyReport", oilProductionDailyReportSchema, "reports.production.daily.oil");
