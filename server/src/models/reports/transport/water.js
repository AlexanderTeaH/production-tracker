const mongoose = require("mongoose");
const WellSite = require("../../sites/well");

const waterTransportReportSchema = mongoose.Schema({
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
    from: {
        type: String,
        required: true,
        validate: function (siteName) {
            return new Promise(function (resolve) {
                WellSite.findOne({ name: siteName }, (error, result) => resolve(result ? true : false));
            });
        }
    },
    to: {
        type: String,
        required: true,
        validate: function (siteName) {
            return new Promise(function (resolve) {
                WellSite.findOne({ name: siteName }, (error, result) => resolve(result ? true : false));
            });
        }
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

module.exports = mongoose.model("WaterTransportReport", waterTransportReportSchema, "reports.transport.water");
