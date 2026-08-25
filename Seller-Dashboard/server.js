const app = require('./src/app');
require ('dotenv').config();
const connectDB = require("./src/db/db")
const listener = require("./src/broker/listener")
const {connect} = require("./src/broker/broker")

connectDB();
connect().then(()=>{
    listener();
})


app.listen(3009, () => {
  console.log('Server is running on port 3009');
});
