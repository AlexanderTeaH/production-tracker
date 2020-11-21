const mongoose       = require("mongoose");
const ProductionSite = require("../../../sites/productionSite");

const oilProductionDailyReportSchema = mongoose.Schema({
    site: {
        type: String,
        required: true,
        validate: function (siteName) {
            return new Promise(function (resolve) {
                ProductionSite.findOne({ name: siteName }, (error, result) => resolve(result ? true : false));
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
    },
    dailyReportDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date.getUTCHours() == 0
                    && date.getUTCMinutes() == 0
                    && date.getUTCSeconds() == 0
                    && date.getUTCMilliseconds() == 0;
            }
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("OilProductionDailyReport", oilProductionDailyReportSchema, "reports.production.daily.oil");
