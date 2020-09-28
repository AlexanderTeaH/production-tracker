const mongoose = require("mongoose");

const productionSiteSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("ProductionSite", productionSiteSchema);
