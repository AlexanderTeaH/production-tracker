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

// Setup MongoDB Atlas connection using mongoose
mongoose.connect(
    "mongodb+srv://admin:" +
    process.env.MONGO_DB_ATLAS_PASSWORD +
    "@test-cluster.beami.mongodb.net/test-database?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

// Require mongoose models
const ProductionReport = require("./models/productionReport");

// Routes
app.post("/add-daily-report", async (request, response) => {
    const date = request.body.date;
    const site = request.body.site;
    const volume = request.body.volume;
    const temperature = request.body.temperature;

    // TODO: Validate date input
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
        date: date, // Change date to Lithuanian time
        site: site,
        volume: volume,
        temperature: temperature
    });

    try {
        await report.save();
        response.status(201).json("Report added");
    }
    
    catch (exception) {
        console.log(`Exception occured in "/add-daily-report": ${exception}`);
        response.status(500).json("Internal server error");
    }
});

app.get("/generate-report", async (request, response) => {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.columns = [
        {header: "Date", key: "date", width: 15, style: {numFmt: "m/d/yyyy"}},
        {header: "Site", key: "site", width: 15},
        {header: "Volume (m³)", key: "volume", width: 15},
        {header: "Temperature (°C)", key: "temperature", width:15}
    ];

    try {
        const entries = await ProductionReport.find({}).exec();

        for (let key in entries) {
            let date = entries[key].date;
            let formattedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;

            worksheet.addRow({
                date: formattedDate,
                volume: entries[key].volume,
                site: entries[key].site,
                temperature: entries[key].temperature
            });
        }

        response.set({
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=Report.xlsx"
        });
    
        await workbook.xlsx.write(response);
    }

    catch (exception) {
        console.log(`Exception occured in "/generate-report": ${exception}`);
        response.status(500).json("Internal server error");
    }
});

// Export express instance
module.exports = app;
