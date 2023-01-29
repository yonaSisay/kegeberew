const express = require("express");
const morgan = require("morgan");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const authRoute = require("./routes/authRoute");
const farmerRoute = require("./routes/farmerRoute");
const customerRoute = require("./routes/customerRoute");
const adminRoute = require("./routes/adminRoute");
const transactionRoute = require("./routes/transactionRoute");
const platformModel = require("./models/platformModel");

const app = express();
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(express.json());

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

// this will create if there is no any platform document in the database
const createPlatformIfNotExist = async () => {
	const platform = await platformModel.findOne({});
	if (!platform) {
		await platformModel.create({});
	}
};
createPlatformIfNotExist();

app.use("/user", authRoute);
app.use("/admin", adminRoute);
app.use("/farmer", farmerRoute);
app.use("/customer", customerRoute);
app.use("/transaction", transactionRoute);
app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
