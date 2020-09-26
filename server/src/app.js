// Require modules
const express    = require("express");
const bodyParser = require("body-parser");
const cors       = require("cors");
const dotenv     = require("dotenv");
const mongoose   = require("mongoose");
const excelJS    = require("exceljs");
const utils      = require("./utils");

// Configure environment variables
dotenv.config();

// Initialize express instance
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: "*"}));
app.use("/reports", require("./routes/reports"));

// Setup MongoDB Atlas connection using mongoose if Jest is not running
if (process.env.JEST_WORKER_ID === undefined) {
    mongoose.connect(
        "mongodb+srv://admin:"             + process.env.MONGO_DB_ATLAS_PASSWORD +
        "@test-cluster.beami.mongodb.net/" + process.env.NODE_ENV +
        "?retryWrites=true&w=majority",
        {
            useNewUrlParser:    true,
            useUnifiedTopology: true
        }
    );
}

// Require mongoose models
const ProductionReport = require("./models/productionReport");

// Routes
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
            .attachment("Report.xlsx");

        await workbook.xlsx.write(response);
    }

    catch (error) {
        console.log(`Error occured in "/generateReport": ${error}`);
        response
            .status(500)
            .json({message: "Internal server error"});
    }
});

// Export express instance
module.exports = app;
