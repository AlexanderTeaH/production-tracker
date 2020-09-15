// Require modules
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const excelJS = require("exceljs");

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
    const date = parseDate(request.body.date);
    const site = request.body.site;
    const volume = request.body.volume;
    const temperature = request.body.temperature;

    if (!date) {
        response.status(400).json("Bad request");
        return;
    }

    if (!site) {
        response.status(400).json("Bad request");
        return;
    }

    if (!volume || isNaN(volume)) {
        response.status(400).json("Bad request");
        return;
    }
    
    if (!temperature || isNaN(temperature)) {
        response.status(400).json("Bad request");
        return;
    }

    const report = new ProductionReport({
        _id: new mongoose.Types.ObjectId(),
        date: date,
        site: site,
        volume: volume,
        temperature: temperature
    });

    try {
        await report.save();
        response.status(201).json({id: report.id});
    }
    
    catch (exception) {
        console.log(`Exception occured in "/addSiteReport": ${exception}`);
        response.status(500).json("Internal server error");
    }
});

app.get("/siteReports/:id", async (request, response) => {
    try {
        const document = await ProductionReport.findById(request.params.id).exec();

        if (!document) {
            response.status(404).json("Report doesn't exist");
        }
        
        else {
            response.status(200).json({
                date: document.date.toISOString().split("T")[0],
                site: document.site,
                volume: document.volume,
                temperature: document.temperature
            });
        }
    }

    catch (exception) {
        if (exception instanceof mongoose.Error.CastError) {
            response.status(404).json("Report doesn't exist");
        }
        
        else {
            response.status(500).json("Internal server error");
            console.log(`Error occured in "/siteReports/:id": ${exception}`);
        }
    }
});

const defaultStartDate = new Date(-8640000000000000);
const defaultEndDate = new Date(8640000000000000);

app.get("/generateReport", async (request, response) => {
    const startDate = parseDate(request.body.startDate);
    const endDate = parseDate(request.body.endDate);

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.columns = [
        {header: "Date", key: "date", width: 15, style: {numFmt: "m/d/yyyy"}},
        {header: "Site", key: "site", width: 15},
        {header: "Volume (m³)", key: "volume", width: 15},
        {header: "Temperature (°C)", key: "temperature", width:15}
    ];

    try {
        const documents = await ProductionReport.where("date")
            .gte(startDate || defaultStartDate)
            .lte(endDate || defaultEndDate)
            .exec();

        for (const document of documents) {
            worksheet.addRow({
                date: document.date.toISOString().split("T")[0],
                volume: document.volume,
                site: document.site,
                temperature: document.temperature
            });
        }

        response.status(200).attachment("Report.xlsx");
        await workbook.xlsx.write(response);
    }

    catch (exception) {
        console.log(`Exception occured in "/generateReport": ${exception}`);
        response.status(500).json("Internal server error");
    }
});

// Helper functions
function parseDate(dateString) {
    if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return null;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
}

// Export express instance
module.exports = app;
