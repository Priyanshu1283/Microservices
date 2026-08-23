const express = require("express");
require("./broker/listner");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Notification Service is up and running"
    });
});

module.exports = app;