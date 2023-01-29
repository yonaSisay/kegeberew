const express = require("express")
const morgan = require("morgan")
const globalErrorHandler = require('./controllers/errorController')
const AppError = require('./utils/appError');
const authRoute = require('./routes/authRoute')
const farmerRoute = require('./routes/farmerRoute')
const customerRoute = require('./routes/customerRoute')
const adminRoute = require('./routes/adminRoute')

const app = express()
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
 
app.use(express.json())

// express static page
app.use(express.static(__dirname + "images"));
  
app.use((req, res, next) => {
    console.log("Hello from the middleware 👋");
    next();
  });
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });
// Routes
app.use('/user',authRoute)
app.use('/admin',adminRoute)
app.use('/farmer',farmerRoute)
app.use('/customer',customerRoute)
app.all('*',(req,res,next) =>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
  });


app.use(globalErrorHandler);

module.exports = app;