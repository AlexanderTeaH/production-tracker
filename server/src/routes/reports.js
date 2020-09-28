const router   = require("express").Router();
const mongoose = require("mongoose");
const utils    = require("../utils");

const OilProductionReport   = require("../models/reports/production/oilProductionReport");
const WaterProductionReport = require("../models/reports/production/waterProductionReport");

router.post("/production/oil", async (request, response) => {
    try {
        const report = new OilProductionReport(utils.parseDocument(OilProductionReport.schema, request.body));
        await report.save();
        response
            .status(201)
            .json({
                message: "Added oil tank report",
                report:  utils.documentToJSON(report)
            });
    }

    catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            response
                .status(400)
                .json({ message: "Bad request" });
        }

        else {
            console.log(`Error occured in "/reports/oilTank": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

router.get("/production/oil/:id", async (request, response) => {
    try {
        const document = await OilProductionReport
            .findById(request.params.id)
            .exec();
        
        if (!document) {
            response
                .status(404)
                .json({ message: "Report doesn't exist" });
        }

        else {
            response
                .status(200)
                .json({
                    message: "Found report",
                    report:  utils.documentToJSON(document)
                });
        }
    }

    catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            response
                .status(404)
                .json({ message: "Report doesn't exist" });
        }

        else {
            console.log(`Error occured in "/reports/oilProduction/:id": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

router.post("/production/water", async (request, response) => {
    try {
        const report = new WaterProductionReport(utils.parseDocument(WaterProductionReport.schema, request.body));
        await report.save();
        response
            .status(201)
            .json({
                message: "Added water tank report",
                report:  utils.documentToJSON(report)
            });
    }

    catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            response
                .status(400)
                .json({ message: "Bad request" });
        }

        else {
            console.log(`Error occured in "/reports/waterTank": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

router.get("/production/water/:id", async (request, response) => {
    try {
        const document = await WaterProductionReport
            .findById(request.params.id)
            .exec();

        if (!document) {
            response
                .status(404)
                .json({ message: "Report doesn't exist" });
        }

        else {
            response
                .status(200)
                .json({
                    message: "Found report",
                    report:  utils.documentToJSON(document)
                });
        }
    }

    catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            response
                .status(404)
                .json({ message: "Report doesn't exist" });
        }

        else {
            console.log(`Error occured in "/reports/waterProduction/:id": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

module.exports = router;
