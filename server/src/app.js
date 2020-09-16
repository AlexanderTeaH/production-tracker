// Require modules
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const excelJS = require("exceljs");
const utils = require("./utils");

// Configure environment variables
dotenv.config();

// Initialize express instance
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Setup MongoDB Atlas connection using mongoose if Jest is not running
if (process.env.JEST_WORKER_ID === undefined) {
    mongoose.connect(
        "mongodb+srv://admin:" +
        process.env.MONGO_DB_ATLAS_PASSWORD +
        "@test-cluster.beami.mongodb.net/" +
        process.env.NODE_ENV +
        "?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
}

// Require mongoose models
const ProductionReport = require("./models/productionReport");

// Routes
app.post("/addSiteReport", async (request, response) => {
    try {
        const report = new ProductionReport({
            date:        utils.parseDate(request.body.date),
            site:        request.body.site,
            volume:      request.body.volume,
            temperature: request.body.temperature
        });
        
        await report.save();
        response
            .status(201)
            .json({
                message: "Added site report",
                report: {
                    id:          report.id,
                    date:        report.date.toISOString().split("T")[0],
                    site:        report.site,
                    volume:      report.volume,
                    temperature: report.temperature
                }
            });
    }
    
    catch (exception) {
        if (exception instanceof mongoose.Error.ValidationError) {
            response
                .status(400)
                .json({message: "Bad request"});
        }

        else {
            console.log(`Exception occured in "/addSiteReport": ${exception}`);
            response
                .status(500)
                .json({message: "Internal server error"});
        }
    }
});

app.get("/siteReports/:id", async (request, response) => {
    try {
        const document = await ProductionReport
            .findById(request.params.id)
            .exec();

        if (!document) {
            response
                .status(404)
                .json({message: "Report doesn't exist"});
        }
        
        else {
            response
                .status(200)
                .json({
                    message: "Found report",
                    report: {
                        id:          document.id,
                        date:        document.date.toISOString().split("T")[0],
                        site:        document.site,
                        volume:      document.volume,
                        temperature: document.temperature
                    }
                });
        }
    }

    catch (exception) {
        if (exception instanceof mongoose.Error.CastError) {
            response
                .status(404)
                .json({message: "Report doesn't exist"});
        }
        
        else {
            console.log(`Error occured in "/siteReports/:id": ${exception}`);
            response
                .status(500)
                .json({message: "Internal server error"});
        }
    }
});

app.get("/generateReport", async (request, response) => {
    try {
        const startDate = utils.parseDate(request.body.startDate) || new Date(-8640000000000000);
        const endDate   = utils.parseDate(request.body.endDate)   || new Date(8640000000000000);

        const documents = await ProductionReport.where("date")
            .gte(startDate)
            .lte(endDate)
            .exec();
        
        const workbook  = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Report");

        worksheet.columns = [
            {header: "Date",             key: "date",        width: 15},
            {header: "Site",             key: "site",        width: 15},
            {header: "Volume (m³)",      key: "volume",      width: 15},
            {header: "Temperature (°C)", key: "temperature", width: 15}
        ];

        for (const document of documents) {
            worksheet.addRow({
                date:        document.date.toISOString().split("T")[0],
                volume:      document.volume,
                site:        document.site,
                temperature: document.temperature
            });
        }

        response
            .status(200)
            .json({message: "Generated report"})
            .attachment("Report.xlsx");

        await workbook.xlsx.write(response);
    }

    catch (exception) {
        console.log(`Exception occured in "/generateReport": ${exception}`);
        response
            .status(500)
            .json({message: "Internal server error"});
    }
});

// Export express instance
module.exports = app;
