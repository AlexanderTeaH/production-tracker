const app       = require("../app");
const supertest = require("supertest");
const request   = supertest(app);
const mongoose  = require("mongoose");

const models = {
    sites: {
        well: require("../models/sites/well")
    },
    production: {
        daily: require("../models/reports/production/daily"),
        tanks: require("../models/reports/production/tanks")
    },
    transport: {
        oil:   require("../models/reports/transport/oil"),
        water: require("../models/reports/transport/water")
    },
    injection: {
        water: require("../models/reports/injection/water")
    }
};

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

const entries = {
    users: {
        user: {
            name:     "userOne",
            password: "Super secure password"
        }
    },
    reports: {
        production: {
            daily: {
                wellSite:         "X-1",
                date:             "2020-12-28T00:00:00.000Z",
                productionPeriod: 24 * 60,
                tanks: {
                    oil: [{
                        level:       1,
                        volume:      1,
                        temperature: 1,
                        density:     1,
                        weight:      1
                    }],
                    water: [{
                        level:   1,
                        volume:  1,
                        density: 1,
                        weight:  1
                    }]
                }
            },
            tanks: {
                wellSite: "X-1",
                tanks: {
                    oil: [{
                        level:       1,
                        volume:      1,
                        temperature: 1,
                        density:     1,
                        weight:      1
                    }],
                    water: [{
                        level:   1,
                        volume:  1,
                        density: 1,
                        weight:  1
                    }]
                }
            }
        },
        transport: {
            oil: {
                date:        "2020-11-21T00:00:00.000Z",
                from:        "X-1",
                to:          "X-2",
                volume:      1,
                temperature: 1,
                density:     1,
                weight:      1
            },
            water: {
                date:        "2020-11-21T00:00:00.000Z",
                from:        "X-1",
                to:          "X-2",
                volume:      1,
                density:     1,
                weight:      1
            }
        },
        injection: {
            water: {
                date:    "2020-11-21T00:00:00.000Z",
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
    const addUser = async () => {
        return request
            .post("/users")
            .send(entries.users.user);
    };

    describe("POST", () => {
        test("[201] Adds user", async () => {
            const response = await addUser();

            expect(response.statusCode)
                .toBe(201);

            expect(response.body.message)
                .toBe("Added user");

            expect(response.body.document)
                .toMatchObject({ name: entries.users.user.name });
            
            expect(response.body.document.password)
                .toBe(undefined);
        });

        test("[400] Missing parameters", async () => {
            const responses = await createMissingParameterRequests("/users", entries.users.user);

            for (const response of responses) {
                expect(response.statusCode)
                    .toBe(400);

                expect(response.body.message)
                    .toBe("Bad request");
            }
        });

        test("[400] Non-unique user name", async () => {
            await addUser();
            const response = await addUser();

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe("Bad request");
        });
    });

    describe("GET /:name", () => {
        test("[200] Finds user", async () => {
            await addUser();
            const response = await request
                .get(`/users/${entries.users.user.name}`);

            expect(response.statusCode)
                .toBe(200);

            expect(response.body.message)
                .toBe("Found user");

            expect(response.body.document)
                .toMatchObject({ name: entries.users.user.name });
            
            expect(response.body.document.password)
                .toBe(undefined);
        });
    });

    describe("/login", () => {
        describe("POST", () => {
            test("[200] Logs in", async () => {
                await addUser();
                const response = await request
                    .post("/users/login")
                    .send(entries.users.user);
                
                expect(response.statusCode)
                    .toBe(200);
                
                expect(response.body.message)
                    .toBe("Logged in");
            });

            test("[401] Specified user doesn't exist", async () => {
                const response = await request
                    .post("/users/login")
                    .send(entries.users.user);

                expect(response.statusCode)
                    .toBe(401);

                expect(response.body.message)
                    .toBe("Unauthorized");
            });

            test("[401] Invalid user name", async () => {
                await addUser();
                const response = await request
                    .post("/users/login")
                    .send({ name: "invalid", password: entries.users.user.password });

                expect(response.statusCode)
                    .toBe(401);

                expect(response.body.message)
                    .toBe("Unauthorized");
            });

            test("[401] Invalid user password", async () => {
                await addUser();
                const response = await request
                    .post("/users/login")
                    .send({ name: entries.users.user.name, password: "invalid" });

                expect(response.statusCode)
                    .toBe(401);

                expect(response.body.message)
                    .toBe("Unauthorized");
            });
        });
    });
});

describe("/reports", () => {
    const addWellSites = async () => {
        await Promise.all([
            request.post("/sites/well").send({ name: "X-1" }),
            request.post("/sites/well").send({ name: "X-2" })
        ]);
    };

    // TO-DO: Create more complicated missing nested parameter tests

    describe("/production", () => {
        describe("/daily", () => {
            describe("POST", () => {
                test("[201] Adds report", async () => {
                    await addWellSites();
                    const response = await request
                        .post("/reports/production/daily")
                        .send(entries.reports.production.daily);

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");
                    
                    expect(response.body.document)
                        .toMatchObject({
                            wellSite:         entries.reports.production.daily.wellSite,
                            productionPeriod: entries.reports.production.daily.productionPeriod
                        });
                    
                    const databaseQueries = await Promise.all([
                        models.production.daily
                            .findById(response.body.document.id)
                            .exec(),
                        models.production.tanks
                            .findById(response.body.document.tanksReportID)
                            .exec()
                    ]);

                    expect(databaseQueries[0].toJSON())
                        .toMatchObject({
                            wellSite:         entries.reports.production.daily.wellSite,
                            productionPeriod: entries.reports.production.daily.productionPeriod
                        });
                    
                    expect(databaseQueries[0].tanksReportID.toString())
                        .toBe(response.body.document.tanksReportID);
                    
                    expect(databaseQueries[1].toJSON())
                        .toMatchObject({
                            wellSite: entries.reports.production.daily.wellSite,
                            tanks:    entries.reports.production.daily.tanks,
                        });
                });

                test("[400] Missing parameters", async () => {
                    await addWellSites();
                    const responses = await createMissingParameterRequests("/reports/production/daily", entries.reports.production.daily);

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    const databaseQueries = await Promise.all([
                        models.production.daily
                            .find()
                            .exec(),
                        models.production.tanks
                            .find()
                            .exec()
                    ]);

                    for (const query of databaseQueries) {
                        expect(query.length)
                            .toBe(0);
                    }
                });

                test("[400] Bad parameter types", async () => {
                    await addWellSites();
                    const responses = await createBadParameterTypeRequests("/reports/production/daily", entries.reports.production.daily);

                    for (const response of responses) {
                        expect(response.statusCode)
                            .toBe(400);

                        expect(response.body.message)
                            .toBe("Bad request");
                    }

                    const databaseQueries = await Promise.all([
                        models.production.daily
                            .find()
                            .exec(),
                        models.production.tanks
                            .find()
                            .exec()
                    ]);

                    for (const query of databaseQueries) {
                        expect(query.length)
                            .toBe(0);
                    }
                });

                test("[400] Specified site doesn't exist", async () => {
                    await addWellSites();
                    const response = await request
                        .post("/reports/production/daily")
                        .send({
                            wellSite:         "Non-existent site",
                            date:             "2020-11-21T00:00:00.000Z",
                            productionPeriod: 24 * 60,
                            totalDailyVolume: {
                                oil:   1,
                                water: 1
                            },
                            totalDailyWeight: {
                                oil:   1,
                                water: 1
                            }
                        });

                    expect(response.statusCode)
                        .toBe(400);

                    expect(response.body.message)
                        .toBe("Bad request");

                    const databaseQueries = await Promise.all([
                        models.production.daily
                            .find()
                            .exec(),
                        models.production.tanks
                            .find()
                            .exec()
                    ]);

                    for (const query of databaseQueries) {
                        expect(query.length)
                            .toBe(0);
                    }
                });
            });

            describe("GET /:id", () => {
                test("[200] Finds report", async () => {
                    await addWellSites();
                    const id = (await request
                        .post("/reports/production/daily")
                        .send(entries.reports.production.daily)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/production/daily/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject({
                            wellSite:         entries.reports.production.daily.wellSite,
                            productionPeriod: entries.reports.production.daily.productionPeriod
                        });
                    
                    expect(response.body.document.tanksReportID)
                        .toBeDefined();
                });

                test("[404] Report with specified ID doesn't exist", async () => {
                    const response = await request
                        .get("/reports/production/daily/non-existent-id");

                    expect(response.statusCode)
                        .toBe(404);

                    expect(response.body.message)
                        .toBe("Report doesn't exist");
                });
            });
        });

        describe("/tanks", () => {
            describe("POST", () => {
                test("[201] Adds report", async () => {
                    await addWellSites();
                    const response = await request
                        .post("/reports/production/tanks")
                        .send(entries.reports.production.tanks);

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.production.tanks);
                    
                    const databaseQuery = await models.production.tanks
                        .findById(response.body.document.id)
                        .exec();

                    expect(databaseQuery.toJSON())
                        .toMatchObject(entries.reports.production.tanks);
                });

                test("[400] Missing parameters", async () => {
                    await addWellSites();

                    const responses     = await createMissingParameterRequests("/reports/production/tanks", entries.reports.production.tanks);
                    const databaseQuery = await models.production.tanks
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
                    await addWellSites();

                    const responses     = await createBadParameterTypeRequests("/reports/production/tanks", entries.reports.production.tanks);
                    const databaseQuery = await models.production.tanks
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
                    await addWellSites();

                    const response = await request
                        .post("/reports/production/tanks")
                        .send({
                            wellSite: "Non-existent site",
                            tanks: {
                                oil: [{
                                    level:       1,
                                    volume:      1,
                                    temperature: 1,
                                    density:     1,
                                    weight:      1
                                }],
                                water: [{
                                    level:   1,
                                    volume:  1,
                                    density: 1,
                                    weight:  1
                                }]
                            }
                        });

                    const databaseQuery = await models.production.tanks
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
                    await addWellSites();

                    const id = (
                        await request
                            .post("/reports/production/tanks")
                            .send(entries.reports.production.tanks)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/production/tanks/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.production.tanks);
                });

                test("[404] Report with specified ID doesn't exist", async () => {
                    const response = await request
                        .get("/reports/production/tanks/non-existent-id");

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
                    await addWellSites();

                    const response = await request
                        .post("/reports/transport/oil")
                        .send(entries.reports.transport.oil);

                    const databaseQuery = await models.transport.oil
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.transport.oil);

                    // Fixes some unexplained date comparison issue
                    let    expected = JSON.parse(JSON.stringify(entries.reports.transport.oil));
                    delete expected.date;

                    expect(databaseQuery)
                        .toMatchObject(expected);

                    expect(new Date(databaseQuery.date))
                        .toEqual(new Date(entries.reports.transport.oil.date));
                });

                test("[400] Missing parameters", async () => {
                    await addWellSites();

                    const responses     = await createMissingParameterRequests("/reports/transport/oil", entries.reports.transport.oil);
                    const databaseQuery = await models.transport.oil
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
                    await addWellSites();

                    const responses     = await createBadParameterTypeRequests("/reports/transport/oil", entries.reports.transport.oil);
                    const databaseQuery = await models.transport.oil
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
                    await addWellSites();

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

                    const databaseQuery = await models.transport.oil
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
                    await addWellSites();

                    const id = (
                        await request
                            .post("/reports/transport/oil")
                            .send(entries.reports.transport.oil)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/transport/oil/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.transport.oil);
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
                    await addWellSites();

                    const response = await request
                        .post("/reports/transport/water")
                        .send(entries.reports.transport.water);

                    const databaseQuery = await models.transport.water
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.transport.water);

                    // Fixes some unexplained date comparison issue
                    let    expected = JSON.parse(JSON.stringify(entries.reports.transport.water));
                    delete expected.date;

                    expect(databaseQuery)
                        .toMatchObject(expected);

                    expect(new Date(databaseQuery.date))
                        .toEqual(new Date(entries.reports.transport.water.date));
                });

                test("[400] Missing parameters", async () => {
                    await addWellSites();

                    const responses     = await createMissingParameterRequests("/reports/transport/water", entries.reports.transport.water);
                    const databaseQuery = await models.transport.water
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
                    await addWellSites();

                    const responses     = await createBadParameterTypeRequests("/reports/transport/water", entries.reports.transport.water);
                    const databaseQuery = await models.transport.water
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
                    await addWellSites();

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

                    const databaseQuery = await models.transport.water
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
                    await addWellSites();

                    const id = (
                        await request
                            .post("/reports/transport/water")
                            .send(entries.reports.transport.water)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/transport/water/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.transport.water);
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
                    await addWellSites();

                    const response = await request
                        .post("/reports/injection/water")
                        .send(entries.reports.injection.water);

                    const databaseQuery = await models.injection.water
                        .findById(response.body.document.id)
                        .exec();

                    expect(response.statusCode)
                        .toBe(201);

                    expect(response.body.message)
                        .toBe("Added report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.injection.water);

                    // Fixes some unexplained date comparison issue
                    let    expected = JSON.parse(JSON.stringify(entries.reports.injection.water));
                    delete expected.date;

                    expect(databaseQuery)
                        .toMatchObject(expected);

                    expect(new Date(databaseQuery.date))
                        .toEqual(new Date(entries.reports.injection.water.date));
                });

                test("[400] Missing parameters", async () => {
                    await addWellSites();

                    const responses = await createMissingParameterRequests("/reports/injection/water", entries.reports.injection.water);
                    const databaseQuery = await models.injection.water
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
                    await addWellSites();

                    const responses = await createBadParameterTypeRequests("/reports/injection/water", entries.reports.injection.water);
                    const databaseQuery = await models.injection.water
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
                    await addWellSites();

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

                    const databaseQuery = await models.injection.water
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
                    await addWellSites();

                    const id = (
                        await request
                            .post("/reports/injection/water")
                            .send(entries.reports.injection.water)
                    ).body.document.id;

                    const response = await request
                        .get(`/reports/injection/water/${id}`);

                    expect(response.statusCode)
                        .toBe(200);

                    expect(response.body.message)
                        .toBe("Found report");

                    expect(response.body.document)
                        .toMatchObject(entries.reports.injection.water);
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
    describe("/well", () => {
        describe("POST", () => {
            test("[200] Adds site", async () => {
                const response = await request
                    .post("/sites/well")
                    .send(entries.sites.production);

                const databaseQuery = await models.sites.well
                    .findById(response.body.document.id)
                    .exec();

                expect(response.statusCode)
                    .toBe(201);

                expect(response.body.message)
                    .toBe("Added site");

                expect(response.body.document)
                    .toMatchObject(entries.sites.production);

                expect(databaseQuery)
                    .toMatchObject(entries.sites.production);
            });

            test("[400] Missing name parameter", async () => {
                const response = await request
                    .post("/sites/well")
                    .send({});

                const query = await models.sites.well
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
                    .post("/sites/well")
                    .send(entries.sites.production);

                const response = await request
                    .post("/sites/well")
                    .send(entries.sites.production);

                const query = await models.sites.well
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
                        .post("/sites/well")
                        .send({ name: name });
                }

                const response = await request
                    .get("/sites/well");

                expect(response.statusCode)
                    .toBe(200);

                expect(response.body.message)
                    .toBe("Found documents");

                expect(response.body.documents.map(site => site.name))
                    .toMatchObject(names);
            });

            test("[200] Returns empty list when no sites exist", async () => {
                const response = await request
                    .get("/sites/well");

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
                        .post("/sites/well")
                        .send(entries.sites.production)
                ).body.document.id;

                const response = await request
                    .get(`/sites/well/${id}`);

                expect(response.statusCode)
                    .toBe(200);

                expect(response.body.message)
                    .toBe("Found site");

                expect(response.body.document)
                    .toMatchObject(entries.sites.production);
            });

            test("[404] Site with specified ID doesn't exist", async () => {
                const response = await request
                    .get("/sites/well/non-existent-id");

                expect(response.statusCode)
                    .toBe(404);

                expect(response.body.message)
                    .toBe("Site doesn't exist");
            });
        });
    });
});
