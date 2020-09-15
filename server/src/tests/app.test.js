// File to test
const app = require("../app");

// Require modules
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const excelJS = require("exceljs");

// Require mongoose models
const ProductionReport = require("../models/productionReport");

// Make sure tests are not run on production database :O
beforeAll(async () => {
    if (process.env.NODE_ENV !== "test") {
        process.exit(1);
    }

    else {
        await mongoose.connect(
            "mongodb+srv://admin:" +
            process.env.MONGO_DB_ATLAS_PASSWORD +
            "@test-cluster.beami.mongodb.net/test?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );

        await mongoose.connection.db.dropDatabase();
    }
});

// Clear database after each test
afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

// Disconnect database after tests so that Jest exits
afterAll(async () => {
    await mongoose.disconnect();
});

// Tests
describe("POST /addSiteReport", () => {
    test("Adds report", async () => {
        const entry = {date: "2020-09-01", site: "X", volume: 1, temperature: 1};
        const response = await request.post("/addSiteReport").send(entry);
        const mongooseQuery = await ProductionReport.find(entry).exec();

        expect(response.statusCode).toBe(201);
        expect(mongooseQuery.length).toBe(1);
    });

    test("Handles bad date parameter", async () => {
        const responses = await Promise.all([
            request.post("/addSiteReport").send({site: "X", volume: 1, temperature: 1}),
            request.post("/addSiteReport").send({date: "2020-09-300", site: "X", volume: 1, temperature: 1}),
            request.post("/addSiteReport").send({date: "Not a date", site: "X", volume: 1, temperature: 1})
        ]);
        
        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }
        
        const mongooseQuery = await ProductionReport.find({}).exec();
        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad site parameter", async () => {
        const responses = await Promise.all([
            request.post("/addSiteReport").send({date: "2020-09-01", volume: 1, temperature: 1})
        ]);
        
        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }
        
        const mongooseQuery = (await ProductionReport.find({}).exec());
        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad volume parameter", async () => {
        const responses = await Promise.all([
            request.post("/addSiteReport").send({date: "2020-09-01", site: "X", temperature: 15}),
            request.post("/addSiteReport").send({date: new Date(), site: "X", volume: "Not a number", temperature: 15})
        ]);

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }
        
        const mongooseQuery = (await ProductionReport.find({}).exec());
        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad temperature parameter", async () => {
        const responses = await Promise.all([
            request.post("/addSiteReport").send({date: "2020-09-01", site: "Test Site", volume: 1}),
            request.post("/addSiteReport").send({date: "2020-09-01", site: "X", volume: 1, temperature: "Not a number"})
        ]);

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }
        
        const mongooseQuery = (await ProductionReport.find({}).exec());
        expect(mongooseQuery.length).toBe(0);
    });
});

describe("GET /siteReport/:id", () => {
    test("Retrieves report", async () => {
        const entry = {date: "2020-09-01", site: "X", volume: 1, temperature: 1};
        const id = (await request.post("/addSiteReport").send(entry)).body.id;
        const response = await request.get(`/siteReports/${id}`);
        expect(response.body).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/siteReports/invalidID");
        expect(response.statusCode).toBe(404);
    });
});

// Still need to figure out how to write a test for this
// describe("GET /generateReport", () => {
//     test("Generates reports correctly", async () => {
//         await Promise.all([
//             request.post("/addSiteReport").send({date: "2020-09-01", site: "X", volume: 1, temperature: 1}),
//             request.post("/addSiteReport").send({date: "2020-09-02", site: "X", volume: 1, temperature: 1}),
//             request.post("/addSiteReport").send({date: "2020-09-03", site: "X", volume: 1, temperature: 1}),
//             request.post("/addSiteReport").send({date: "2020-09-04", site: "X", volume: 1, temperature: 1})
//         ]);

//         const response = await request.get("/generateReport");
//         const workbook = new excelJS.Workbook();
//         await workbook.xlsx.load(response.text);
        
//         workbook.eachSheet(function(worksheet, sheetId) {
//             console.log(worksheet.name);
//         });

//         expect(true).toBe(true);
//     });
// });
