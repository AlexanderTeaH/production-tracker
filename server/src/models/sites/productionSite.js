const mongoose        = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productionSiteSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
},
{
    timestamps: true
});

productionSiteSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ProductionSite", productionSiteSchema, "sites.production");
