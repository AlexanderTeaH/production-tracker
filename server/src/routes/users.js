const router   = require("express").Router();
const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");
const jwt      = require("jsonwebtoken");
const utils    = require("../utils");

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

router.post("/login", async (request, response) => {
    try {
        const user = await User
            .findOne({ name: request.body.name })
            .exec();

        if (!user || !await bcrypt.compare(request.body.password, user.password)) {
            response
                .status(401)
                .json({ message: "Unauthorized" });
        }

        else {
            const token = jwt.sign({
                username: request.body.username
            },
            process.env.JWT_KEY,
            {
                expiresIn: "16h"
            });

            response
                .status(200)
                .cookie("authorizationToken", token,
                    {
                        httpOnly: true,
                        maxAge:   16 * 60 * 60 * 1000,
                        path:     "/",
                        sameSite: "strict"
                    })
                .json({ message: "Logged in" });
        }
    }

    catch (error) {
        console.log(`Error occured in "${request.method} ${request.originalUrl}": ${error}`);
        response
            .status(500)
            .json({ message: "Internal server error" });
    }
});

router.post("/logout", async (request, response) => {
    try {
        response
            .status(200)
            .cookie("authorizationToken", "",
                {
                    httpOnly: true,
                    maxAge:   -1,
                    path:     "/",
                    sameSite: "strict"
                })
            .json({ message: "Logged out" });
    }

    catch (error) {
        console.log(`Error occured in "${request.method} ${request.originalUrl}": ${error}`);
        response
            .status(500)
            .json({ message: "Internal server error" });
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
