const router = require("express").Router();
const utils  = require("../utils");

const models = {
    production: {
        daily: {
            oil:   require("../models/reports/production/daily/oil"),
            water: require("../models/reports/production/daily/water")
        },
        shifts: {
            oil:   require("../models/reports/production/shifts/oil"),
            water: require("../models/reports/production/shifts/water")
        }
    },
    transport: {
        oil:   require("../models/reports/transport/oil"),
        water: require("../models/reports/transport/water")
    },
    injection: {
        water: require("../models/reports/injection/water")
    }
};

router.post("/production/daily/oil", (request, response) => {
    utils.saveDocument(request, response, models.production.daily.oil, "Added report");
});

router.get("/production/daily/oil/:id", (request, response) => {
    utils.getDocument(request, response, models.production.daily.oil, "Found report", "Report doesn't exist");
});

router.post("/production/daily/water", (request, response) => {
    utils.saveDocument(request, response, models.production.daily.water, "Added report");
});

router.get("/production/daily/water/:id", (request, response) => {
    utils.getDocument(request, response, models.production.daily.water, "Found report", "Report doesn't exist");
});

router.post("/production/shifts/oil", (request, response) => {
    utils.saveDocument(request, response, models.production.shifts.oil, "Added report");
});

router.get("/production/shifts/oil/:id", (request, response) => {
    utils.getDocument(request, response, models.production.shifts.oil, "Found report", "Report doesn't exist");
});

router.post("/production/shifts/water", (request, response) => {
    utils.saveDocument(request, response, models.production.shifts.water, "Added report");
});

router.get("/production/shifts/water/:id", (request, response) => {
    utils.getDocument(request, response, models.production.shifts.water, "Found report", "Report doesn't exist");
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
