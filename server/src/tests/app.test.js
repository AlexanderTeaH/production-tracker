// File to test
const app = require("../app");

// Require modules
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
//const excelJS = require("exceljs");

// Require mongoose models
const OilTanksReport   = require("../models/reports/oilTanksReport");
const WaterTanksReport = require("../models/reports/waterTanksReport");

// Make sure tests are not run on production database :O
beforeAll(async () => {
    if (process.env.NODE_ENV !== "test") {
        process.exit(1);
    }

    else {
        await mongoose.connect(
            "mongodb+srv://admin:" + process.env.MONGO_DB_ATLAS_PASSWORD +
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
describe("POST /reports/oilTanks", () => {
    test("Adds report", async () => {
        const validEntry    = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        const response      = await request.post("/reports/oilTanks").send(validEntry);
        const mongooseQuery = await OilTanksReport.findById(response.body.report.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added oil tank report");
        expect(response.body.report).toMatchObject(validEntry);
        expect(mongooseQuery).toMatchObject(validEntry);
    });

    test("Handles missing parameters", async () => {
        const validEntry = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            // eslint-disable-next-line no-unused-vars
            const { [property]: ommited, ...rest } = validEntry;
            requests.push(request.post("/reports/oilTanks").send(rest));
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await OilTanksReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad parameter values", async () => {
        const validEntry = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            let { [property]: ommited, ...rest } = validEntry;

            if (!isNaN(ommited)) {
                rest[ommited] = "Not a number";
                requests.push(request.post("/reports/oilTanks").send(rest));
            }
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await OilTanksReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });
});

describe("GET /reports/oilTanks/:id", () => {
    test("Retrieves report", async () => {
        const entry    = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/oilTanks").send(entry)).body.report.id;
        const response = await request.get(`/reports/oilTanks/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.report).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/oilTanks/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
    });
});

describe("POST /reports/waterTanks", () => {
    test("Adds report", async () => {
        const validEntry    = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        const response      = await request.post("/reports/waterTanks").send(validEntry);
        const mongooseQuery = await WaterTanksReport.findById(response.body.report.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added water tank report");
        expect(response.body.report).toMatchObject(validEntry);
        expect(mongooseQuery).toMatchObject(validEntry);
    });

    test("Handles missing parameters", async () => {
        const validEntry = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            // eslint-disable-next-line no-unused-vars
            const { [property]: ommited, ...rest } = validEntry;
            requests.push(request.post("/reports/waterTanks").send(rest));
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await WaterTanksReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad parameter values", async () => {
        const validEntry = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            let { [property]: ommited, ...rest } = validEntry;

            if (!isNaN(ommited)) {
                rest[ommited] = "Not a number";
                requests.push(request.post("/reports/waterTanks").send(rest));
            }
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await WaterTanksReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });
});

describe("GET /reports/waterTanks/:id", () => {
    test("Retrieves report", async () => {
        const entry    = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/waterTanks").send(entry)).body.report.id;
        const response = await request.get(`/reports/waterTanks/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.report).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/waterTanks/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
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
