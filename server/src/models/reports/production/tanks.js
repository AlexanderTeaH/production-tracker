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
},
{
    _id : false
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
},
{
    _id : false
});

const combinedTanksSchema = mongoose.Schema({
    oil: {
        type: [oilTankSchema],
        required: true
    },
    water: {
        type: [waterTankSchema],
        required: true
    }
},
{
    _id : false
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
        type: combinedTanksSchema,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("ProductionTanksReport", tanksReportSchema, "reports.production.tanks");
