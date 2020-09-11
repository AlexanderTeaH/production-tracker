// Modules
const express = require("express");
const bodyParser = require("body-parser");

// Initialize express instance
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

// Routes
app.post("/add-daily-report", (request, response) => {
    let volume = request.body.volume;
    let density = request.body.density;

    if (!volume || isNaN(volume)) {
        response.status(400).json("Bad request");
    }
    
    if (!density || isNaN(density)) {
        response.status(400).json("Bad request");
    }

    response.status(201).json(volume);
});

// Export express instance
module.exports = app;
