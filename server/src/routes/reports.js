const router = require("express").Router();
const utils  = require("../utils");

const OilProductionReport   = require("../models/reports/production/oilProductionReport");
const WaterProductionReport = require("../models/reports/production/waterProductionReport");

router.post("/production/oil", (request, response) => {
    utils.saveDocument(request, response, OilProductionReport, "Added report");
});

router.post("/production/water", (request, response) => {
    utils.saveDocument(request, response, WaterProductionReport, "Added report");
});

router.get("/production/oil/:id", (request, response) => {
    utils.getDocument(request, response, OilProductionReport, "Found report", "Report doesn't exist");
});

router.get("/production/water/:id", (request, response) => {
    utils.getDocument(request, response, WaterProductionReport, "Found report", "Report doesn't exist");
});

module.exports = router;
