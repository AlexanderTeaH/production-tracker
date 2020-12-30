const mongoose    = require("mongoose");
const WellSite    = require("../../sites/well");
const TanksReport = require("../production/tanks");

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
        required: true,
        min: 0,
        max: 24 * 60
    },
    tanksReportID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        validate: function (reportID) {
            return new Promise(function (resolve) {
                TanksReport.findById(reportID, (error, result) => resolve(result ? true : false));
            });
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("ProductionDailyReport", dailyReportSchema, "reports.production.daily");
