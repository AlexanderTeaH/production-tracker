const app       = require("../app");
const supertest = require("supertest");
const request   = supertest(app);
const mongoose  = require("mongoose");

const OilProductionReport   = require("../models/reports/production/oilProductionReport");
const WaterProductionReport = require("../models/reports/production/waterProductionReport");
const OilTransportReport    = require("../models/reports/transport/oilTransportReport");
const WaterTransportReport  = require("../models/reports/transport/waterTransportReport");
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

describe("POST /reports/production/oil", () => {
    test("Adds report", async () => {
        await request.post("/sites/production").send({ name: "X" });

        const entry    = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        const response = await request.post("/reports/production/oil").send(entry);
        const query    = await OilProductionReport.findById(response.body.document.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added report");
        expect(response.body.document).toMatchObject(entry);
        expect(query).toMatchObject(entry);
    });

    test("Handles missing parameters", async () => {
        await request.post("/sites/production").send({ name: "X" });

        const validEntry = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            // eslint-disable-next-line no-unused-vars
            const { [property]: ommited, ...rest } = validEntry;
            requests.push(request.post("/reports/production/oil").send(rest));
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
        await request.post("/sites/production").send({ name: "X" });
        
        const validEntry = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            let { [property]: ommited, ...rest } = validEntry;

            if (!isNaN(ommited)) {
                rest[property] = "Not a number";
                requests.push(request.post("/reports/production/oil").send(rest));
            }

            else if (property == "site") {
                rest[property] = "Y";
                requests.push(request.post("/reports/production/oil").send(rest));
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

describe("GET /reports/production/oil/:id", () => {
    test("Retrieves report", async () => {
        await request.post("/sites/production").send({ name: "X" });

        const entry    = { site: "X", level: 1, volume: 1, temperature: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/production/oil").send(entry)).body.document.id;
        const response = await request.get(`/reports/production/oil/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.document).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/production/oil/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
    });
});

describe("POST /reports/production/water", () => {
    test("Adds report", async () => {
        await request.post("/sites/production").send({ name: "X" });

        const validEntry    = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        const response      = await request.post("/reports/production/water").send(validEntry);
        const mongooseQuery = await WaterProductionReport.findById(response.body.document.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added report");
        expect(response.body.document).toMatchObject(validEntry);
        expect(mongooseQuery).toMatchObject(validEntry);
    });

    test("Handles missing parameters", async () => {
        await request.post("/sites/production").send({ name: "X" });

        const validEntry = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            // eslint-disable-next-line no-unused-vars
            const { [property]: ommited, ...rest } = validEntry;
            requests.push(request.post("/reports/production/water").send(rest));
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
        await request.post("/sites/production").send({ name: "X" });

        const validEntry = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        let   requests   = [];

        for (const property in validEntry) {
            let { [property]: ommited, ...rest } = validEntry;

            if (!isNaN(ommited)) {
                rest[property] = "Not a number";
                requests.push(request.post("/reports/production/water").send(rest));
            }

            else if (property == "site") {
                rest[property] = "Y";
                requests.push(request.post("/reports/production/water").send(rest));
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

describe("GET /reports/production/water/:id", () => {
    test("Retrieves report", async () => {
        await request.post("/sites/production").send({ name: "X" });

        const entry    = { site: "X", level: 1, volume: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/production/water").send(entry)).body.document.id;
        const response = await request.get(`/reports/production/water/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.document).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/production/water/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
    });
});

describe("POST /reports/transport/oil", () => {
    test("Adds report", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const entry    = { from: "X", to: "Y", volume: 1, temperature: 1, density: 1, weight: 1 };
        const response = await request.post("/reports/transport/oil").send(entry);
        const query    = await OilTransportReport.findById(response.body.document.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added report");
        expect(response.body.document).toMatchObject(entry);
        expect(query).toMatchObject(entry);
    });

    test("Handles missing parameters", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const validEntry = { from: "X", to: "Y", volume: 1, temperature: 1, density: 1, weight: 1 };
        let requests     = [];

        for (const property in validEntry) {
            // eslint-disable-next-line no-unused-vars
            const { [property]: ommited, ...rest } = validEntry;
            requests.push(request.post("/reports/transport/oil").send(rest));
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await OilTransportReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad parameter values", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const validEntry = { from: "X", to: "Y", volume: 1, temperature: 1, density: 1, weight: 1 };
        let requests     = [];

        for (const property in validEntry) {
            let { [property]: ommited, ...rest } = validEntry;

            if (!isNaN(ommited)) {
                rest[property] = "Not a number";
                requests.push(request.post("/reports/transport/oil").send(rest));
            }

            else if (property == "site") {
                rest[property] = "Y";
                requests.push(request.post("/reports/transport/oil").send(rest));
            }
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await OilTransportReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });
});

describe("GET /reports/transport/oil/:id", () => {
    test("Retrieves report", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const entry    = { from: "X", to: "Y", volume: 1, temperature: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/transport/oil").send(entry)).body.document.id;
        const response = await request.get(`/reports/transport/oil/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.document).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/transport/oil/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
    });
});

describe("POST /reports/transport/water", () => {
    test("Adds report", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const validEntry    = { from: "X", to: "Y", volume: 1, density: 1, weight: 1 };
        const response      = await request.post("/reports/transport/water").send(validEntry);
        const mongooseQuery = await WaterTransportReport.findById(response.body.document.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added report");
        expect(response.body.document).toMatchObject(validEntry);
        expect(mongooseQuery).toMatchObject(validEntry);
    });

    test("Handles missing parameters", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const validEntry = { from: "X", to: "Y", volume: 1, density: 1, weight: 1 };
        let requests     = [];

        for (const property in validEntry) {
            // eslint-disable-next-line no-unused-vars
            const { [property]: ommited, ...rest } = validEntry;
            requests.push(request.post("/reports/transport/water").send(rest));
        }

        const responses     = await Promise.all(requests);
        const mongooseQuery = await WaterTransportReport.find().exec();

        for (const response of responses) {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Bad request");
        }

        expect(mongooseQuery.length).toBe(0);
    });

    test("Handles bad parameter values", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const validEntry = { from: "X", to: "Y", volume: 1, density: 1, weight: 1 };
        let requests     = [];

        for (const property in validEntry) {
            let { [property]: ommited, ...rest } = validEntry;

            if (!isNaN(ommited)) {
                rest[property] = "Not a number";
                requests.push(request.post("/reports/transport/water").send(rest));
            }

            else if (property == "site") {
                rest[property] = "Y";
                requests.push(request.post("/reports/transport/water").send(rest));
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

describe("GET /reports/transport/water/:id", () => {
    test("Retrieves report", async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X" }),
            request.post("/sites/production").send({ name: "Y" })
        ]);

        const entry    = { from: "X", to: "Y", volume: 1, density: 1, weight: 1 };
        const id       = (await request.post("/reports/transport/water").send(entry)).body.document.id;
        const response = await request.get(`/reports/transport/water/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found report");
        expect(response.body.document).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/reports/transport/water/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Report doesn't exist");
    });
});

describe("POST /sites/production", () => {
    test("Adds production site", async () => {
        const entry    = { name: "X" };
        const response = await request.post("/sites/production").send(entry);
        const query    = await ProductionSite.findById(response.body.document.id).exec();

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Added site");
        expect(response.body.document).toMatchObject(entry);
        expect(query).toMatchObject(entry);
    });

    test("Handles missing name parameter", async () => {
        const response = await request.post("/sites/production").send({});
        const query    = await ProductionSite.find().exec();

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Bad request");
        expect(query.length).toBe(0);
    });

    test("Handles non-unique name parameter", async () => {
        const entry = { name: "X" };
        await request.post("/sites/production").send(entry);

        const response = await request.post("/sites/production").send(entry);
        const query    = await ProductionSite.find().exec();

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Bad request");
        expect(query.length).toBe(1);
    });
});

describe("GET /sites/production", () => {
    test("Retrieves production sites", async () => {
        const names = ["X", "Y"];

        for (const name of names) {
            await request.post("/sites/production").send({ name: name });
        }

        const response = await request.get("/sites/production");

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found documents");
        expect(response.body.documents.map(site => site.name)).toMatchObject(names);
    });

    test("Handles no production sites", async () => {
        const response = await request.get("/sites/production");

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found documents");
        expect(response.body.documents).toMatchObject([]);
    });
});

describe("GET /sites/production/:id", () => {
    test("Retrieves site", async () => {
        const entry    = { name: "X" };
        const id       = (await request.post("/sites/production").send(entry)).body.document.id;
        const response = await request.get(`/sites/production/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Found site");
        expect(response.body.document).toMatchObject(entry);
    });

    test("Handles bad id parameter", async () => {
        const response = await request.get("/sites/production/invalidID");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Site doesn't exist");
    });
});
