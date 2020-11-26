const router = require("express").Router();
const utils  = require("../utils");

const WellSite = require("../models/sites/well");

router.post("/well", async (request, response) => {
    utils.saveDocument(request, response, WellSite, "Added site");
});

router.get("/well", async (request, response) => {
    utils.getAllDocuments(request, response, WellSite, { name: 1 });
});

router.get("/well/:id", async (request, response) => {
    utils.getDocument(request, response, WellSite, "Found site", "Site doesn't exist");
});

module.exports = router;
