const express =  require ('express');
const cookieParser = require('cookie-parser');
const paymentRoutes = require('./routes/payment.routes');
// const cors = require('cors');
// const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(cookieParser());
// app.use(cors());
// app.use(morgan('dev'));


app.use('/api/payments', paymentRoutes);

module.exports = app;