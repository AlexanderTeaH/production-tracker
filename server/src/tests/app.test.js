// File to test
const app = require("../app");

// Testing modules
const supertest = require("supertest");
const request = supertest(app);

// Tests
describe("POST /add-daily-report", () => {
    test("Adds report", async () => {
        let response = await request.post("/add-daily-report").send({
            volume: "100",
            density: "1"
        });

        expect(response.statusCode).toBe(201);
    });

    test("Handles bad volume parameter", async () => {
        let responses = {
            "Missing volume": await request.post("/add-daily-report").send({
                density: "1"
            }),
            "Invalid volume": invalidVolumeResponse = await request.post("/add-daily-report").send({
                volume: "Not a number",
                density: "1"
            })
        };

        for (let key in responses) {
            expect(responses[key].statusCode).toBe(400);
        }
    });

    test("Handles bad density parameter", async () => {
        let responses = {
            "Missing density": await request.post("/add-daily-report").send({
                volume: "100"
            }),
            "Invalid density": invalidVolumeResponse = await request.post("/add-daily-report").send({
                volume: "100",
                density: "Not a number"
            })
        };

        for (let key in responses) {
            expect(responses[key].statusCode).toBe(400);
        }
    });
});
