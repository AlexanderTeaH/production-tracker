const router   = require("express").Router();
const mongoose = require("mongoose");
const utils    = require("../utils");

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

// Add additional tests for POST "production/daily"

router.post("/production/daily", async (request, response) => {
    let tanksReportID = null;

    try {
        const tanksReport = new models.production.tanks({
            wellSite: request.body.wellSite,
            tanks:    request.body.tanks
        });

        await tanksReport.save();
        tanksReportID = tanksReport._id;

        const dailyReport = new models.production.daily({
            wellSite:         request.body.wellSite,
            date:             request.body.date,
            productionPeriod: request.body.productionPeriod,
            tanksReportID:    tanksReportID
        });

        await dailyReport.save();
        response
            .status(201)
            .json({
                message:  "Added report",
                document: utils.documentToJSON(dailyReport)
            });
    }

    catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            if (tanksReportID !== null) {
                await models.production.tanks
                    .findByIdAndDelete(tanksReportID)
                    .exec();
            }

            response
                .status(400)
                .json({ message: "Bad request" });
        }

        else {
            console.log(`Error occured in "${request.method} ${request.originalUrl}": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
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
