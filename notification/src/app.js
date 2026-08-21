const express = require("express");
const { connect } = require("./broker/broker");

const app = express();
app.use(express.json());

// Connect to RabbitMQ
connect();

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Notification Service is up and running"
    });
});

module.exports = app;
