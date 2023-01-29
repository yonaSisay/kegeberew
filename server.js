require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
	console.log(err.name, err.message);
	process.exit(1);
});

const DBL = process.env.DATABASE_LOCAL;

mongoose.set("strictQuery", false);
mongoose
	.connect(DBL, {
		useNewUrlParser: true,
		// useCreateIndex: true,
		// useFindAndModify: false
	})
	.then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});
