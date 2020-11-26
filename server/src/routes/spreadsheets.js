const router  = require("express").Router();
const excelJS = require("exceljs");
const utils   = require("../utils");

const models = {
    sites: {
        well: require("../models/sites/well")
    },
    production: {
        daily: {
            oil:   require("../models/reports/production/daily/oil"),
            water: require("../models/reports/production/daily/water")
        }
    },
    transport: {
        oil: require("../models/reports/transport/oil")
    },
    injection: {
        water: require("../models/reports/injection/water")
    }
};

router.get("/daily", async (request, response) => {
    try {
        const date  = utils.parseDate(request.body.date);
        const query = await Promise.all([
            models.sites.well
                .find()
                .sort({ name: 1 })
                .exec(),
            models.production.daily.oil
                .where("date")
                .equals(date)
                .exec(),
            models.transport.oil
                .where("date")
                .equals(date)
                .exec(),
            models.production.daily.water
                .where("date")
                .equals(date)
                .exec(),
            models.injection.water
                .where("date")
                .equals(date)
                .exec()
        ]);

        const rows      = linkReports(...query);
        const workbook  = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet(date.toISOString().split("T")[0]);

        worksheet.getCell("B1").value = "Daily report for oil and water production";
        worksheet.getCell("B3").value = "Oil production per day";
        worksheet.getCell("D3").value = "Transported oil per day";
        worksheet.getCell("F3").value = "Water production per day";
        worksheet.getCell("G3").value = "Injected water per day";
        worksheet.mergeCells("B1:C1");
        worksheet.mergeCells("B3:C3");
        worksheet.mergeCells("D3:E3");
        worksheet.getRow(1).font      = { bold: true };
        worksheet.getRow(1).height    = 30;
        worksheet.getRow(3).font      = { bold: true };
        worksheet.getRow(3).height    = 50;
        worksheet.getRow(3).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

        worksheet.columns = [
            { key: "wellSite",              width: 20 },
            { key: "oilProductionVolume",   width: 20 },
            { key: "oilProductionWeight",   width: 20 },
            { key: "oilTransportVolume",    width: 20 },
            { key: "oilTransportWeight",    width: 20 },
            { key: "waterProductionVolume", width: 20 },
            { key: "waterInjectionVolume",  width: 20 }
        ];

        worksheet.addRow({
            wellSite:              "Well site",
            oilProductionVolume:   "Volume (m³)",
            oilProductionWeight:   "Weight (ton)",
            oilTransportVolume:    "Volume (m³)",
            oilTransportWeight:    "Weight (ton)",
            waterProductionVolume: "Volume (m³)",
            waterInjectionVolume:  "Volume (m³)"
        });

        for (const row of rows) {
            worksheet.addRow(row);
        }

        response
            .status(200)
            .attachment(`Daily report ${date.toISOString().split("T")[0]}.xlsx`);

        await workbook.xlsx.write(response);
    }

    catch (error) {
        console.log(`Error occured in "GET /spreadsheets/daily": ${error}`);
        response
            .status(500)
            .json({ message: "Internal server error" });
    }
});

const linkReports = (wellSites, dailyOilReports, oilTransportReports, dailyWaterReports, waterInjectionReports) => {
    const wellSiteData = {};

    for (const wellSite of wellSites) {
        wellSiteData[wellSite.name] = {
            wellSite: wellSite.name
        };
    }

    for (const dailyOilReport of dailyOilReports) {
        const wellSite         = dailyOilReport.wellSite;
        wellSiteData[wellSite] = Object.assign(wellSiteData[wellSite], {
            oilProductionVolume: dailyOilReport.totalDailyVolume,
            oilProductionWeight: dailyOilReport.totalDailyWeight
        });
    }

    for (const oilTransportReport of oilTransportReports) {
        const wellSite = oilTransportReport.from;
        
        if ("oilTransportVolume" in wellSiteData[wellSite]) {
            wellSiteData[wellSite].oilTransportVolume += oilTransportReport.volume;
            wellSiteData[wellSite].oilTransportWeight += oilTransportReport.weight;
        }

        else {
            wellSiteData[wellSite] = Object.assign(wellSiteData[wellSite], {
                oilTransportVolume: oilTransportReport.volume,
                oilTransportWeight: oilTransportReport.weight
            });
        }
    }

    for (const dailyWaterReport of dailyWaterReports) {
        const wellSite         = dailyWaterReport.wellSite;
        wellSiteData[wellSite] = Object.assign(wellSiteData[wellSite], {
            waterProductionVolume: dailyWaterReport.totalDailyVolume
        });
    }

    for (const waterInjectionReport of waterInjectionReports) {
        const wellSite = waterInjectionReport.from;

        if ("waterInjectionVolume" in wellSiteData[wellSite]) {
            wellSiteData[wellSite].waterInjectionVolume += waterInjectionReport.volume;
        }

        else {
            wellSiteData[wellSite] = Object.assign(wellSiteData[wellSite], {
                waterInjectionVolume: waterInjectionReport.volume
            });
        }
    }

    return Object.values(wellSiteData);
};

module.exports = router;
