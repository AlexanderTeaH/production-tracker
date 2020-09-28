const mongoose = require("mongoose");
const ProductionSite = require("../../sites/productionSite");

// TODO: Remove report postfix and create sub-table "reports"

const oilProductionReportSchema = mongoose.Schema({
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

module.exports = mongoose.model("OilProductionReport", oilProductionReportSchema, "reports.production.oil");