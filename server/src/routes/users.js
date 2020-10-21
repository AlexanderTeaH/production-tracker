const router   = require("express").Router();
const utils    = require("../utils");
const mongoose = require("mongoose");

const User = require("../models/users/user");

router.post("/", async (request, response) => {
    try {
        const user = new User(utils.parseDocument(User.schema, request.body));
        await user.save();
        response
            .status(201)
            .json({
                message: "Added user",
                document: {
                    name: user.name
                }
            });
    }

    catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            response
                .status(400)
                .json({ message: "Bad request" });
        }

        else {
            console.log(`Error occured in "${request.method} ${request.originalUrl}": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

router.get("/:name", async (request, response) => {
    try {
        const document = await User
            .findOne({ name: request.params.name })
            .exec();

        if (!document) {
            response
                .status(404)
                .json({ message: "User doesn't exist" });
        }

        else {
            response
                .status(200)
                .json({
                    message: "Found user",
                    document: {
                        name: document.name
                    }
                });
        }
    }

    catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            response
                .status(404)
                .json({ message: "User doesn't exist" });
        }

        else {
            console.log(`Error occured in "${request.method} ${request.originalUrl}": ${error}`);
            response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }
});

module.exports = router;
