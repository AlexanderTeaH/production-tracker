const mongoose = require("mongoose");
const WellSite = require("../../sites/well");

const oilTankSchema = mongoose.Schema({
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
});

const waterTankSchema = mongoose.Schema({
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
});

const tanksReportSchema = mongoose.Schema({
    wellSite: {
        type: String,
        required: true,
        validate: function (wellSiteName) {
            return new Promise(function (resolve) {
                WellSite.findOne({ name: wellSiteName }, (error, result) => resolve(result ? true : false));
            });
        }
    },
    tanks: {
        type: {
            oil: [oilTankSchema],
            water: [waterTankSchema]
        },
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("ProductionTanksReport", tanksReportSchema, "reports.production.tanks");
