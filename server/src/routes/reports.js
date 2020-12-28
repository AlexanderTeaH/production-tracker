const router = require("express").Router();
const utils  = require("../utils");

const models = {
    production: {
        daily: require("../models/reports/production/daily"),
        tanks: require("../models/reports/production/tanks")
    },
    transport: {
        oil:   require("../models/reports/transport/oil"),
        water: require("../models/reports/transport/water")
    },
    injection: {
        water: require("../models/reports/injection/water")
    }
};

router.post("/production/daily", (request, response) => {
    utils.saveDocument(request, response, models.production.daily, "Added report");
});

router.get("/production/daily/:id", (request, response) => {
    utils.getDocument(request, response, models.production.daily, "Found report", "Report doesn't exist");
});

router.post("/production/tanks", (request, response) => {
    utils.saveDocument(request, response, models.production.tanks, "Added report");
});

router.get("/production/tanks/:id", (request, response) => {
    utils.getDocument(request, response, models.production.tanks, "Found report", "Report doesn't exist");
});

router.post("/transport/oil", (request, response) => {
    utils.saveDocument(request, response, models.transport.oil, "Added report");
});

router.get("/transport/oil/:id", (request, response) => {
    utils.getDocument(request, response, models.transport.oil, "Found report", "Report doesn't exist");
});

router.post("/transport/water", (request, response) => {
    utils.saveDocument(request, response, models.transport.water, "Added report");
});

router.get("/transport/water/:id", (request, response) => {
    utils.getDocument(request, response, models.transport.water, "Found report", "Report doesn't exist");
});

router.post("/injection/water", (request, response) => {
    utils.saveDocument(request, response, models.injection.water, "Added report");
});

router.get("/injection/water/:id", (request, response) => {
    utils.getDocument(request, response, models.injection.water, "Found report", "Report doesn't exist");
});

module.exports = router;
