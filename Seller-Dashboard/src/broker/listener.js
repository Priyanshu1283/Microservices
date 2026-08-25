const { subscribeToQueue } = require("./broker");
const userModel = require("../models/user.model");


module.exports = async function () {

subscribeToQueue("AUTH_SEllER_DASHBOARD.USER_CREATED", async(user) => {
    await userModel.create(user);   

})
}