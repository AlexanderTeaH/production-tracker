const router   = require("express").Router();
const mongoose = require("mongoose");
const utils    = require("../utils");

const ProductionSite = require("../models/sites/productionSite");

router.post("/production", async (request, response) => {
    try {
        const report = new ProductionSite(utils.parseDocument(ProductionSite.schema, request.body));
        await report.save();
        response
            .status(201)
            .json({
                message: "Added production site",
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
            console.log(`Error occured in "POST /sites/production": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

router.get("/production/:id", async (request, response) => {
    try {
        const document = await ProductionSite
            .findById(request.params.id)
            .exec();

        if (!document) {
            response
                .status(404)
                .json({ message: "Site doesn't exist" });
        }

        else {
            response
                .status(200)
                .json({
                    message: "Found site",
                    report:  utils.documentToJSON(document)
                });
        }
    }

    catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            response
                .status(404)
                .json({ message: "Site doesn't exist" });
        }

        else {
            console.log(`Error occured in "GET /sites/production/:id": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

module.exports = router;
