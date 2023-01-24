const express = require("express")
const morgan = require("morgan")
const globalErrorHandler = require('./controllers/errorController')
const AppError = require('./utils/appError');
const productRouter = require('./routes/productRoute')
const userRouter = require('./routes/authRoute')

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
app.use('/products',productRouter)
app.use('/user',userRouter)
app.all('*',(req,res,next) =>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
  });


app.use(globalErrorHandler);

module.exports = app;