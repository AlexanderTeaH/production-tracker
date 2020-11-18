const router  = require("express").Router();
const excelJS = require("exceljs");
const utils   = require("../utils");

const OilProductionReport   = require("../models/reports/production/oilProductionReport");
const WaterProductionReport = require("../models/reports/production/waterProductionReport");
const OilTransportReport    = require("../models/reports/transport/oilTransportReport");
const WaterTransportReport  = require("../models/reports/transport/waterTransportReport");
const ProductionSite        = require("../models/sites/productionSite");

router.get("/dailyReport", async (request, response) => {
    try {
        const date    = utils.parseDate(request.body.date);
        const nextDay = new Date();
        nextDay.setDate(date.getDate() + 1);

        const query = await Promise.all([
            ProductionSite
                .find()
                .sort({ name: 1 })
                .exec(),
            OilProductionReport
                .where("dailyReportDate")
                .equals(date)
                .exec(),
            WaterProductionReport
                .where("dailyReportDate")
                .equals(date)
                .exec(),
            OilTransportReport
                .where("createdAt")
                .gte(date)
                .lt(nextDay),
            WaterTransportReport
                .where("createdAt")
                .gte(date)
                .lt(nextDay)
        ]);

        const rows      = utils.mergeReports(query[0], query[1], query[2], query[3], query[4]);
        const workbook  = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet(date.toISOString().split("T")[0]);

        worksheet.getCell("A1").value = "Site";
        worksheet.getCell("A1").fill  = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ffaaaa" }
        };

        worksheet.mergeCells("B1:F1");
        worksheet.getCell("B1").value = "Oil production";
        worksheet.getCell("B1").fill  = {
            type:    "pattern",
            pattern: "solid",
            fgColor: { argb: "aaffaa" }
        };

        worksheet.mergeCells("G1:J1");
        worksheet.getCell("G1").value = "Water production";
        worksheet.getCell("G1").fill  = {
            type:    "pattern",
            pattern: "solid",
            fgColor: { argb: "aaaaff" }
        };

        worksheet.mergeCells("K1:O1");
        worksheet.getCell("K1").value = "Oil transport";
        worksheet.getCell("K1").fill = {
            type:    "pattern",
            pattern: "solid",
            fgColor: { argb: "aaffaa" }
        };

        worksheet.mergeCells("P1:S1");
        worksheet.getCell("P1").value = "Water transport";
        worksheet.getCell("P1").fill = {
            type:    "pattern",
            pattern: "solid",
            fgColor: { argb: "aaaaff" }
        };

        worksheet.columns = [
            { key: "site", width: 10 },
            
            { key: "oilLevel",       width: 20 },
            { key: "oilVolume",      width: 20 },
            { key: "oilTemperature", width: 20 },
            { key: "oilDensity",     width: 20 },
            { key: "oilWeight",      width: 20 },
            
            { key: "waterLevel",   width: 20 },
            { key: "waterVolume",  width: 20 },
            { key: "waterDensity", width: 20 },
            { key: "waterWeight",  width: 20 },
            
            { key: "oilTransportTo",          width: 10 },
            { key: "oilTransportVolume",      width: 20 },
            { key: "oilTransportTemperature", width: 20 },
            { key: "oilTransportDensity",     width: 20 },
            { key: "oilTransportWeight",      width: 20 },
            
            { key: "waterTransportTo",      width: 10 },
            { key: "waterTransportVolume",  width: 20 },
            { key: "waterTransportDensity", width: 20 },
            { key: "waterTransportWeight",  width: 20 }
        ];

        worksheet.getRow(1).font      = { bold: true, size: 16 };
        worksheet.getRow(1).height    = 30;
        worksheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };

        worksheet.addRow({
            site: "",
            
            oilLevel:       "Level (m)",
            oilVolume:      "Volume (m³)",
            oilTemperature: "Temperature (°C)",
            oilDensity:     "Density (g/cm³)",
            oilWeight:      "Weight (tonnes)",
            
            waterLevel:   "Level (m)",
            waterVolume:  "Volume (m³)",
            waterDensity: "Density (g/cm³)",
            waterWeight:  "Weight (tonnes)",
            
            oilTransportTo:          "To",
            oilTransportVolume:      "Volume (m³)",
            oilTransportTemperature: "Temperature (°C)",
            oilTransportDensity:     "Density (g/cm³)",
            oilTransportWeight:      "Weight (tonnes)",
            
            waterTransportTo:      "To",
            waterTransportVolume:  "Volume (m³)",
            waterTransportDensity: "Density (g/cm³)",
            waterTransportWeight:  "Weight (tonnes)"
        });
        
        worksheet.getRow(2).font      = { bold: true, size: 12 };
        worksheet.getRow(2).height    = 20;
        worksheet.getRow(2).alignment = { horizontal: "center", vertical: "middle" };

        for (const row of rows) {
            worksheet.addRow(row);
        }

        response
            .status(200)
            .attachment(`Daily report ${date.toISOString().split("T")[0]}.xlsx`);

        await workbook.xlsx.write(response);
    }

    catch (error) {
        console.log(`Error occured in "GET /spreadsheets/dailyReport": ${error}`);
        response
            .status(500)
            .json({ message: "Internal server error" });
    }
});

module.exports = router;
