const app       = require("../app");
const supertest = require("supertest");
const request   = supertest(app);
const mongoose  = require("mongoose");

const OilProductionReport   = require("../models/reports/oilProductionReport");
const WaterProductionReport = require("../models/reports/waterProductionReport");
const ProductionSite        = require("../models/sites/productionSite");

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

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe("POST /reports/oilProduction", () => {
    test("Adds report", async () => {
        const validEntry    = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        const response      = await request.post("/reports/oilProduction").send(validEntry);
        const mongooseQuery = await OilProductionReport.findById(response.body.report.id).exec();

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
            requests.push(request.post("/reports/oilProduction").send(rest));
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await OilProductionReport.find().exec();

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
                requests.push(request.post("/reports/oilProduction").send(rest));
            }
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await OilProductionReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });
});

describe("GET /reports/oilProduction/:id", () => {
    test("Retrieves report", async () => {
        const entry    = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/oilProduction").send(entry)).body.report.id;
        const response = await request.get(`/reports/oilProduction/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.report).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/oilProduction/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
    });
});

describe("POST /reports/waterProduction", () => {
    test("Adds report", async () => {
        const validEntry    = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        const response      = await request.post("/reports/waterProduction").send(validEntry);
        const mongooseQuery = await WaterProductionReport.findById(response.body.report.id).exec();

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
            requests.push(request.post("/reports/waterProduction").send(rest));
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await WaterProductionReport.find().exec();

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
                requests.push(request.post("/reports/waterProduction").send(rest));
            }
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await WaterProductionReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });
});

describe("GET /reports/waterProduction/:id", () => {
    test("Retrieves report", async () => {
        const entry    = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/waterProduction").send(entry)).body.report.id;
        const response = await request.get(`/reports/waterProduction/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.report).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/waterProduction/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
    });
});

describe("POST /sites/production", () => {
    test("Adds production site", async () => {
        const entry    = { name: "X" };
        const response = await request.post("/sites/production").send(entry);
        const query    = await ProductionSite.findById(response.body.report.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added production site");
        expect(response.body.report).toMatchObject(entry);
        expect(query).toMatchObject(entry);
    });

    test("Handles missing name parameter", async () => {
        const response = await request.post("/sites/production").send({});
        const query    = await WaterProductionReport.find().exec();

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Bad request");
        expect(query.length).toBe(0);
    });
});

describe("GET /sites/production/:id", () => {
    test("Retrieves site", async () => {
        const entry    = { name: "X" };
        const id       = (await request.post("/sites/production").send(entry)).body.report.id;
        const response = await request.get(`/sites/production/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found site");
        expect(response.body.report).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/sites/production/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Site doesn't exist");
    });
});
