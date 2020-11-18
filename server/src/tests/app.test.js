const app       = require("../app");
const supertest = require("supertest");
const request   = supertest(app);
const mongoose  = require("mongoose");

const OilProductionReport   = require("../models/reports/production/oilProductionReport");
const WaterProductionReport = require("../models/reports/production/waterProductionReport");
const OilTransportReport    = require("../models/reports/transport/oilTransportReport");
const WaterTransportReport  = require("../models/reports/transport/waterTransportReport");
const WaterInjectionReport  = require("../models/reports/injection/waterInjectionReport");
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

const validEntries = {
    users: {
        user: {
            name:     "userOne",
            password: "Super secure password"
        }
    },
    reports: {
        production: {
            oil: {
                site:        "X-1",
                level:       1,
                volume:      1,
                temperature: 1,
                density:     1,
                weight:      1
            },
            water: {
                site:        "X-1",
                level:       1,
                volume:      1,
                density:     1,
                weight:      1
            }
        },
        transport: {
            oil: {
                from:        "X-1",
                to:          "X-2",
                volume:      1,
                temperature: 1,
                density:     1,
                weight:      1
            },
            water: {
                from:        "X-1",
                to:          "X-2",
                volume:      1,
                density:     1,
                weight:      1
            }
        },
        injection: {
            water: {
                from:    "X-1",
                to:      "X-2",
                volume:  1,
                density: 1,
                weight:  1
            }
        }
    },
    sites: {
        production: {
            name: "X-1"
        }
    }
};

const createMissingParameterRequests = (url, validEntry) => {
    let requests = [];

    for (const property in validEntry) {
        // eslint-disable-next-line no-unused-vars
        const { [property]: ommited, ...rest } = validEntry;
        requests.push(
            request
                .post(url)
                .send(rest)
        );
    }

    return Promise.all(requests);
};

const createBadParameterTypeRequests = (url, validEntry) => {
    let requests = [];

    for (const property in validEntry) {
        let { [property]: ommited, ...rest } = validEntry;

        if (!isNaN(ommited)) {
            rest[property] = "Not a number";
            requests.push(
                request
                    .post(url)
                    .send(rest)
            );
        }
    }

    return Promise.all(requests);
};

describe("/users", () => {
    describe("POST", () => {
        test("[201] Adds user", async () => {
            const response = await request
                .post("/users")
                .send(validEntries.users.user);

            expect(response.statusCode)
                .toBe(201);

            expect(response.body.message)
                .toBe("Added user");

            expect(response.body.document)
                .toMatchObject({ name: validEntries.users.user.name });
            
            expect(response.body.document.password)
                .toBe(undefined);
        });

        test("[400] Missing parameters", async () => {
            const responses = await createMissingParameterRequests("/users", validEntries.users.user);

            for (const response of responses) {
                expect(response.statusCode)
                    .toBe(400);

                expect(response.body.message)
                    .toBe("Bad request");
            }
        });

        test("[400] Non-unique user name", async () => {
            await request
                .post("/users")
                .send(validEntries.users.user);

            const response = await request
                .post("/users")
                .send(validEntries.users.user);

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe("Bad request");
        });
    });

    describe("GET /:name", () => {
        test("[200] Finds user", async () => {
            await request
                .post("/users")
                .send(validEntries.users.user);
            
            const response = await request
                .get(`/users/${validEntries.users.user.name}`);

            expect(response.statusCode)
                .toBe(200);

            expect(response.body.message)
                .toBe("Found user");

            expect(response.body.document)
                .toMatchObject({ name: validEntries.users.user.name });
            
            expect(response.body.document.password)
                .toBe(undefined);
        });
    });
});

describe("/reports", () => {
    const addProductionSites = async () => {
        await Promise.all([
            request.post("/sites/production").send({ name: "X-1" }),
            request.post("/sites/production").send({ name: "X-2" })
        ]);
    };

    describe("/production", () => {
        describe("/oil", () => {
            describe("POST", () => {
                test("[201] Adds report", async () => {
                    await addProductionSites();

                    const response = await request
                        .post("/reports/production/oil")
                        .send(validEntries.reports.production.oil);

                    const databaseQuery = await OilProductionReport
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.production.oil);

                    expect(databaseQuery)
                        .toMatchObject(validEntries.reports.production.oil);
                });

                test("[400] Missing parameters", async () => {
                    await addProductionSites();

                    const responses     = await createMissingParameterRequests("/reports/production/oil", validEntries.reports.production.oil);
                    const databaseQuery = await OilProductionReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Bad parameter types", async () => {
                    await addProductionSites();

                    const responses     = await createBadParameterTypeRequests("/reports/production/oil", validEntries.reports.production.oil);
                    const databaseQuery = await OilProductionReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Specified site doesn't exist", async () => {
                    await addProductionSites();

                    const response = await request
                        .post("/reports/production/oil")
                        .send({
                            site:        "Non-existent site",
                            level:       1,
                            volume:      1,
                            temperature: 1,
                            density:     1,
                            weight:      1
                        });

                    const databaseQuery = await OilProductionReport
                        .find()
                        .exec();

                    expect(response.statusCode)
                        .toBe(400);

                    expect(response.body.message)
                        .toBe("Bad request");

                    expect(databaseQuery.length)
                        .toBe(0);
                });
            });

            describe("GET /:id", () => {
                test("[200] Finds report", async () => {
                    await addProductionSites();

                    const id = (
                        await request
                            .post("/reports/production/oil")
                            .send(validEntries.reports.production.oil)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/production/oil/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.production.oil);
                });

                test("[404] Report with specified ID doesn't exist", async () => {
                    const response = await request
                        .get("/reports/production/oil/non-existent-id");

                    expect(response.statusCode)
                        .toBe(404);

                    expect(response.body.message)
                        .toBe("Report doesn't exist");
                });
            });
        });

        describe("/water", () => {
            describe("POST", () => {
                test("[201] Adds report", async () => {
                    await addProductionSites();

                    const response = await request
                        .post("/reports/production/water")
                        .send(validEntries.reports.production.water);

                    const databaseQuery = await WaterProductionReport
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.production.water);

                    expect(databaseQuery)
                        .toMatchObject(validEntries.reports.production.water);
                });

                test("[400] Missing parameters", async () => {
                    await addProductionSites();

                    const responses     = await createMissingParameterRequests("/reports/production/water", validEntries.reports.production.water);
                    const databaseQuery = await WaterProductionReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Bad parameter types", async () => {
                    await addProductionSites();

                    const responses     = await createBadParameterTypeRequests("/reports/production/water", validEntries.reports.production.water);
                    const databaseQuery = await WaterProductionReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Specified site doesn't exist", async () => {
                    await addProductionSites();

                    const response = await request
                        .post("/reports/production/water")
                        .send({
                            site:    "Non-existent site",
                            level:   1,
                            volume:  1,
                            density: 1,
                            weight:  1
                        });

                    const databaseQuery = await WaterProductionReport
                        .find()
                        .exec();

                    expect(response.statusCode)
                        .toBe(400);

                    expect(response.body.message)
                        .toBe("Bad request");

                    expect(databaseQuery.length)
                        .toBe(0);
                });
            });

            describe("GET /:id", () => {
                test("[200] Finds report", async () => {
                    await addProductionSites();

                    const id = (
                        await request
                            .post("/reports/production/water")
                            .send(validEntries.reports.production.water)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/production/water/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.production.water);
                });

                test("[404] Report with specified ID doesn't exist", async () => {
                    const response = await request
                        .get("/reports/production/water/non-existent-id");

                    expect(response.statusCode)
                        .toBe(404);

                    expect(response.body.message)
                        .toBe("Report doesn't exist");
                });
            });
        });
    });

    describe("/transport", () => {
        describe("/oil", () => {
            describe("POST", () => {
                test("[201] Adds report", async () => {
                    await addProductionSites();

                    const response = await request
                        .post("/reports/transport/oil")
                        .send(validEntries.reports.transport.oil);

                    const databaseQuery = await OilTransportReport
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.transport.oil);

                    expect(databaseQuery)
                        .toMatchObject(validEntries.reports.transport.oil);
                });

                test("[400] Missing parameters", async () => {
                    await addProductionSites();

                    const responses     = await createMissingParameterRequests("/reports/transport/oil", validEntries.reports.transport.oil);
                    const databaseQuery = await OilTransportReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Bad parameter types", async () => {
                    await addProductionSites();

                    const responses     = await createBadParameterTypeRequests("/reports/transport/oil", validEntries.reports.transport.oil);
                    const databaseQuery = await OilTransportReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Specified sites don't exist", async () => {
                    await addProductionSites();

                    const responses = await Promise.all([
                        request
                            .post("/reports/transport/oil")
                            .send({
                                from:        "Non-existent site",
                                to:          "X-2",
                                volume:      1,
                                temperature: 1,
                                density:     1,
                                weight:      1
                            }),
                        request
                            .post("/reports/transport/oil")
                            .send({
                                from:        "X-1",
                                to:          "Non-existent site",
                                volume:      1,
                                temperature: 1,
                                density:     1,
                                weight:      1
                            })
                    ]);

                    const databaseQuery = await OilTransportReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });
            });

            describe("GET /:id", () => {
                test("[200] Finds report", async () => {
                    await addProductionSites();

                    const id = (
                        await request
                            .post("/reports/transport/oil")
                            .send(validEntries.reports.transport.oil)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/transport/oil/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.transport.oil);
                });

                test("[404] Report with specified ID doesn't exist", async () => {
                    const response = await request
                        .get("/reports/transport/oil/non-existent-id");

                    expect(response.statusCode)
                        .toBe(404);

                    expect(response.body.message)
                        .toBe("Report doesn't exist");
                });
            });
        });

        describe("/water", () => {
            describe("POST", () => {
                test("[201] Adds report", async () => {
                    await addProductionSites();

                    const response = await request
                        .post("/reports/transport/water")
                        .send(validEntries.reports.transport.water);

                    const databaseQuery = await WaterTransportReport
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.transport.water);

                    expect(databaseQuery)
                        .toMatchObject(validEntries.reports.transport.water);
                });

                test("[400] Missing parameters", async () => {
                    await addProductionSites();

                    const responses     = await createMissingParameterRequests("/reports/transport/water", validEntries.reports.transport.water);
                    const databaseQuery = await WaterTransportReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Bad parameter types", async () => {
                    await addProductionSites();

                    const responses     = await createBadParameterTypeRequests("/reports/transport/water", validEntries.reports.transport.water);
                    const databaseQuery = await WaterTransportReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Specified sites don't exist", async () => {
                    await addProductionSites();

                    const responses = await Promise.all([
                        request
                            .post("/reports/transport/water")
                            .send({
                                from:    "Non-existent site",
                                to:      "X-2",
                                volume:  1,
                                density: 1,
                                weight:  1
                            }),
                        request
                            .post("/reports/transport/water")
                            .send({
                                from:    "X-1",
                                to:      "Non-existent site",
                                volume:  1,
                                density: 1,
                                weight:  1
                            })
                    ]);

                    const databaseQuery = await WaterTransportReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });
            });

            describe("GET /:id", () => {
                test("[200] Finds report", async () => {
                    await addProductionSites();

                    const id = (
                        await request
                            .post("/reports/transport/water")
                            .send(validEntries.reports.transport.water)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/transport/water/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.transport.water);
                });

                test("[404] Report with specified ID doesn't exist", async () => {
                    const response = await request
                        .get("/reports/transport/water/non-existent-id");

                    expect(response.statusCode)
                        .toBe(404);

                    expect(response.body.message)
                        .toBe("Report doesn't exist");
                });
            });
        });
    });

    describe("/injection", () => {
        describe("/water", () => {
            describe("POST", () => {
                test("[201] Adds report", async () => {
                    await addProductionSites();

                    const response = await request
                        .post("/reports/injection/water")
                        .send(validEntries.reports.injection.water);

                    const databaseQuery = await WaterInjectionReport
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.injection.water);

                    expect(databaseQuery)
                        .toMatchObject(validEntries.reports.injection.water);
                });

                test("[400] Missing parameters", async () => {
                    await addProductionSites();

                    const responses = await createMissingParameterRequests("/reports/injection/water", validEntries.reports.injection.water);
                    const databaseQuery = await WaterInjectionReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Bad parameter types", async () => {
                    await addProductionSites();

                    const responses = await createBadParameterTypeRequests("/reports/injection/water", validEntries.reports.injection.water);
                    const databaseQuery = await WaterInjectionReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });

                test("[400] Specified sites don't exist", async () => {
                    await addProductionSites();

                    const responses = await Promise.all([
                        request
                            .post("/reports/injection/water")
                            .send({
                                from:    "Non-existent site",
                                to:      "X-2",
                                volume:  1,
                                density: 1,
                                weight:  1
                            }),
                        request
                            .post("/reports/injection/water")
                            .send({
                                from:    "X-1",
                                to:      "Non-existent site",
                                volume:  1,
                                density: 1,
                                weight:  1
                            })
                    ]);

                    const databaseQuery = await WaterInjectionReport
                        .find()
                        .exec();

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    expect(databaseQuery.length)
                        .toBe(0);
                });
            });

            describe("GET /:id", () => {
                test("[200] Finds report", async () => {
                    await addProductionSites();

                    const id = (
                        await request
                            .post("/reports/injection/water")
                            .send(validEntries.reports.injection.water)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/injection/water/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(validEntries.reports.injection.water);
                });

                test("[404] Report with specified ID doesn't exist", async () => {
                    const response = await request
                        .get("/reports/injection/water/non-existent-id");

                    expect(response.statusCode)
                        .toBe(404);

                    expect(response.body.message)
                        .toBe("Report doesn't exist");
                });
            });
        });
    });
});

describe("/sites", () => {
    describe("/production", () => {
        describe("POST", () => {
            test("[200] Adds site", async () => {
                const response = await request
                    .post("/sites/production")
                    .send(validEntries.sites.production);

                const databaseQuery = await ProductionSite
                    .findById(response.body.document.id)
                    .exec();

                expect(response.statusCode)
                    .toBe(201);

                expect(response.body.message)
                    .toBe("Added site");

                expect(response.body.document)
                    .toMatchObject(validEntries.sites.production);

                expect(databaseQuery)
                    .toMatchObject(validEntries.sites.production);
            });

            test("[400] Missing name parameter", async () => {
                const response = await request
                    .post("/sites/production")
                    .send({});

                const query = await ProductionSite
                    .find()
                    .exec();

                expect(response.statusCode)
                    .toBe(400);

                expect(response.body.message)
                    .toBe("Bad request");

                expect(query.length)
                    .toBe(0);
            });

            test("[400] Non-unique site name", async () => {
                await request
                    .post("/sites/production")
                    .send(validEntries.sites.production);

                const response = await request
                    .post("/sites/production")
                    .send(validEntries.sites.production);

                const query = await ProductionSite
                    .find()
                    .exec();

                expect(response.statusCode)
                    .toBe(400);

                expect(response.body.message)
                    .toBe("Bad request");

                expect(query.length)
                    .toBe(1);
            });
        });

        describe("GET", () => {
            test("[200] Finds all sites", async () => {
                const names = ["X-1", "X-2"];

                for (const name of names) {
                    await request
                        .post("/sites/production")
                        .send({ name: name });
                }

                const response = await request
                    .get("/sites/production");

                expect(response.statusCode)
                    .toBe(200);

                expect(response.body.message)
                    .toBe("Found documents");

                expect(response.body.documents.map(site => site.name))
                    .toMatchObject(names);
            });

            test("[200] Returns empty list when no sites exist", async () => {
                const response = await request
                    .get("/sites/production");

                expect(response.statusCode)
                    .toBe(200);

                expect(response.body.message)
                    .toBe("Found documents");

                expect(response.body.documents)
                    .toMatchObject([]);
            });
        });

        describe("GET /:id", () => {
            test("[200] Finds site", async () => {
                const id = (
                    await request
                        .post("/sites/production")
                        .send(validEntries.sites.production)
                ).body.document.id;

                const response = await request
                    .get(`/sites/production/${id}`);

                expect(response.statusCode)
                    .toBe(200);

                expect(response.body.message)
                    .toBe("Found site");

                expect(response.body.document)
                    .toMatchObject(validEntries.sites.production);
            });

            test("[404] Site with specified ID doesn't exist", async () => {
                const response = await request
                    .get("/sites/production/non-existent-id");

                expect(response.statusCode)
                    .toBe(404);

                expect(response.body.message)
                    .toBe("Site doesn't exist");
            });
        });
    });
});
