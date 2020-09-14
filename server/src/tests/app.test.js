// File to test
const app = require("../app");

// Require modules
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");

// Require mongoose models
const ProductionReport = require("../models/productionReport");

// Make sure tests are not run on production database :O
beforeAll(() => {
    if (process.env.DATABASE_NAME !== "test") {
        process.exit(1);
    }
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
        let mongooseResponse = (await ProductionReport.find(entry).exec());

        expect(response.statusCode).toBe(201);
        expect(mongooseResponse.length).toBe(1);
    });

    test("Handles bad date parameter", async () => {
        let responses = {
            "Missing": await request.post("/add-daily-report").send({
                site: "Site",
                volume: 1,
                temperature: 1
            })
        };

        for (let key in responses) {
            expect(responses[key].statusCode).toBe(400);
        }
    });

    test("Handles bad site parameter", async () => {
        let responses = {
            "Missing": await request.post("/add-daily-report").send({
                date: new Date(),
                volume: 1,
                temperature: 1
            })
        };

        for (let key in responses) {
            expect(responses[key].statusCode).toBe(400);
        }
    });

    test("Handles bad volume parameter", async () => {
        let responses = {
            "Missing": await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                temperature: "15"
            }),
            "Invalid": await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                volume: "Not a number",
                temperature: "15"
            })
        };

        for (let key in responses) {
            expect(responses[key].statusCode).toBe(400);
        }
    });

    test("Handles bad temperature parameter", async () => {
        let responses = {
            "Missing": await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                volume: "100"
            }),
            "Invalid": await request.post("/add-daily-report").send({
                date: new Date(),
                site: "Test Site",
                volume: "100",
                temperature: "Not a number"
            })
        };

        for (let key in responses) {
            expect(responses[key].statusCode).toBe(400);
        }
    });
});
