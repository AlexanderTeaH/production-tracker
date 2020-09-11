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
            temperature: "15"
        });

        expect(response.statusCode).toBe(201);
    });

    test("Handles bad volume parameter", async () => {
        let responses = {
            "Missing volume": await request.post("/add-daily-report").send({
                temperature: "15"
            }),
            "Invalid volume": await request.post("/add-daily-report").send({
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
            "Missing temperature": await request.post("/add-daily-report").send({
                volume: "100"
            }),
            "Invalid temperature": await request.post("/add-daily-report").send({
                volume: "100",
                temperature: "Not a number"
            })
        };

        for (let key in responses) {
            expect(responses[key].statusCode).toBe(400);
        }
    });
});
