const router   = require("express").Router();
const mongoose = require("mongoose");
const utils    = require("../utils");

const OilTanksReport   = require("../models/reports/oilTanksReport");
const WaterTanksReport = require("../models/reports/waterTanksReport");

router.post("/oilTanks", async (request, response) => {
    try {
        const report = new OilTanksReport(utils.parseDocument(OilTanksReport.schema, request.body));
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

router.get("/oilTanks/:id", async (request, response) => {
    try {
        const document = await OilTanksReport
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
            console.log(`Error occured in "/reports/oilTanks/:id": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

router.post("/waterTanks", async (request, response) => {
    try {
        const report = new WaterTanksReport(utils.parseDocument(WaterTanksReport.schema, request.body));
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

router.get("/waterTanks/:id", async (request, response) => {
    try {
        const document = await WaterTanksReport
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
            console.log(`Error occured in "/reports/waterTanks/:id": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

module.exports = router;
