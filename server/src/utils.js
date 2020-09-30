const mongoose = require("mongoose");

module.exports.saveDocument = async (request, response, Model, successMessage) => {
    try {
        const report = new Model(this.parseDocument(Model.schema, request.body));
        await report.save();
        response
            .status(201)
            .json({
                message: successMessage,
                report:  this.documentToJSON(report)
            });
    }

    catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
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
};

module.exports.getDocument = async (request, response, Model, successMessage, missingMessage) => {
    try {
        const document = await Model
            .findById(request.params.id)
            .exec();

        if (!document) {
            response
                .status(404)
                .json({ message: missingMessage });
        }

        else {
            response
                .status(200)
                .json({
                    message: successMessage,
                    report:  this.documentToJSON(document)
                });
        }
    }

    catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            response
                .status(404)
                .json({ message: missingMessage });
        }

        else {
            console.log(`Error occured in "${request.method} ${request.originalUrl}": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
};

module.exports.parseDocument = (schema, json) => {
    let document = {};

    for (const property in schema.paths) {
        if (!["_id", "__v", "createdAt", "updatedAt"].includes(property)) {
            document[property] = json[property];
        }
    }

    return document;
};

module.exports.documentToJSON = (document) => {
    let json = {
        id:        document.id,
        createdAt: document.createdAt
    };

    for (const property in document.schema.paths) {
        if (!["_id", "__v", "createdAt", "updatedAt"].includes(property)) {
            json[property] = document[property];
        }
    }

    return json;
};

module.exports.parseDate = (dateString) => {
    if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return null;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
};

module.exports.mergeProductionReports = (sites, oilReports, waterReports) => {
    const dict = {};

    for (const site of sites) {
        dict[site.name] = { site: site.name };
    }

    for (const report of oilReports) {
        dict[report.site] = Object.assign(dict[report.site], {
            site:           report.site,
            oilLevel:       report.level,
            oilVolume:      report.volume,
            oilTemperature: report.temperature,
            oilDensity:     report.density,
            oilWeight:      report.weight
        });
    }

    for (const report of waterReports) {
        dict[report.site] = Object.assign(dict[report.site], {
            waterLevel:   report.level,
            waterVolume:  report.volume,
            waterDensity: report.density,
            waterWeight:  report.weight
        });
    }

    return Object.values(dict);
};
