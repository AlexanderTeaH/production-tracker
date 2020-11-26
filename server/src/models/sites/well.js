const mongoose        = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const wellSiteSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
},
{
    timestamps: true
});

wellSiteSchema.plugin(uniqueValidator);

module.exports = mongoose.model("WellSite", wellSiteSchema, "sites.well");
