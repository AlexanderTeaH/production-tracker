const mongoose       = require("mongoose");
const ProductionSite = require("../../sites/productionSite");

const oilTransportReportSchema = mongoose.Schema({
    from: {
        type: String,
        required: true,
        validate: function (siteName) {
            return new Promise(function (resolve) {
                ProductionSite.findOne({ name: siteName }, (error, result) => resolve(result ? true : false));
            });
        }
    },
    to: {
        type: String,
        required: true,
        validate: function (siteName) {
            return new Promise(function (resolve) {
                ProductionSite.findOne({ name: siteName }, (error, result) => resolve(result ? true : false));
            });
        }
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

module.exports = mongoose.model("OilTransportReport", oilTransportReportSchema, "reports.transport.oil");
