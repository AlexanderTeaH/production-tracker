const router = require("express").Router();
const utils  = require("../utils");

const ProductionSite = require("../models/sites/productionSite");

router.post("/production", async (request, response) => {
    utils.saveDocument(request, response, ProductionSite, "Added site");
});

router.get("/production/:id", async (request, response) => {
    utils.getDocument(request, response, ProductionSite, "Found site", "Site doesn't exist");
});

module.exports = router;
