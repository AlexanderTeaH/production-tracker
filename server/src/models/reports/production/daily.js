const mongoose = require("mongoose");
const WellSite = require("../../sites/well");

const dailyReportSchema = mongoose.Schema({
    wellSite: {
        type: String,
        required: true,
        validate: function (wellSiteName) {
            return new Promise(function (resolve) {
                WellSite.findOne({ name: wellSiteName }, (error, result) => resolve(result ? true : false));
            });
        }
    },
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
    productionPeriod: { // minutes
        type: Number,
        required: true
    },
    totalDailyVolume: {
        type: {
            oil: {
                type: Number,
                required: true
            },
            water: {
                type: Number,
                required: true
            }
        },
        required: true
    },
    totalDailyWeight: {
        type: {
            oil: {
                type: Number,
                required: true
            },
            water: {
                type: Number,
                required: true
            }
        },
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("ProductionDailyReport", dailyReportSchema, "reports.production.daily");
