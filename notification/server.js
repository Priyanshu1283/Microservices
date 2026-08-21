
require('dotenv').config();
const app = require("./src/app");




app.listen(3006, () => {
    console.log('Notification Server running on port 3006');
})

