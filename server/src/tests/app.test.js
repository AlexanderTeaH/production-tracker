// File to test
const app = require("../app");

// Require modules
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");

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
describe("POST /add-daily-report", () => {
    test("Adds report", async () => {
        const entry = {
            date: new Date(),
            site: "Site",
            volume: 1,
            temperature: 1
        };

        let response = await request.post("/add-daily-report").send(entry);
        let mongooseQuery = (await ProductionReport.find(entry).exec());

        expect(response.statusCode).toBe(201);
        expect(mongooseQuery.length).toBe(1);
    });

    test("Handles bad date parameter", async () => {
        let responses = [
            await request.post("/add-daily-report").send({
                site: "Site",
                volume: 1,
                temperature: 1
            })
        ];
        
        let mongooseQuery = (await ProductionReport.find({}).exec());

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }

        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad site parameter", async () => {
        let responses = [
            await request.post("/add-daily-report").send({
                date: new Date(),
                volume: 1,
                temperature: 1
            })
        ];

        let mongooseQuery = (await ProductionReport.find({}).exec());

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }

        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad volume parameter", async () => {
        let responses = [
            await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                temperature: "15"
            }),
            await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                volume: "Not a number",
                temperature: "15"
            })
        ];

        let mongooseQuery = (await ProductionReport.find({}).exec());

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }

        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad temperature parameter", async () => {
        let responses = [
            await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                volume: "100"
            }),
            await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                volume: "100",
                temperature: "Not a number"
            })
        ];

        let mongooseQuery = (await ProductionReport.find({}).exec());

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
        }

        expect(mongooseQuery.length).toBe(0);
    });
});
