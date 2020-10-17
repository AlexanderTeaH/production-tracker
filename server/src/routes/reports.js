const router = require("express").Router();
const utils  = require("../utils");

const OilProductionReport   = require("../models/reports/production/oilProductionReport");
const WaterProductionReport = require("../models/reports/production/waterProductionReport");

const OilTransportReport    = require("../models/reports/transport/oilTransportReport");
const WaterTransportReport  = require("../models/reports/transport/waterTransportReport");

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

router.post("/transport/oil", (request, response) => {
    utils.saveDocument(request, response, OilTransportReport, "Added report");
});

router.post("/transport/water", (request, response) => {
    utils.saveDocument(request, response, WaterTransportReport, "Added report");
});

router.get("/transport/oil/:id", (request, response) => {
    utils.getDocument(request, response, OilTransportReport, "Found report", "Report doesn't exist");
});

router.get("/transport/water/:id", (request, response) => {
    utils.getDocument(request, response, WaterTransportReport, "Found report", "Report doesn't exist");
});

module.exports = router;
