const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const { promisify } = require("util");
const Platform = require("../models/platformModel");

const {AUTH_TOKEN,ACCOUNT_SID,SERVICE_SID}= process.env;
const client = require('twilio')(ACCOUNT_SID,AUTH_TOKEN,{
    lazyLoading:true
})



const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, verifiedResponse,res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

	res.cookie("jwt", token, cookieOptions);

	// Remove password from output
	user.password = undefined;

	res.status(statusCode).json({
		status: "success",
		token,
		data: {
			user,
			verifiedResponse
		},
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const { firstName, lastName,role, phone, password, passwordConfirm } =
		req.body;
	const platform = await Platform.findOne({ name: "platform" });

	if (!platform) return next(new AppError("Platform not found", 404));
	
	// Validate password length
	if (password.length < 8) {
		return next(new AppError("Password must be at least 8 characters", 400));
	}
		 
	// Create user
	const otpResponse = await client.verify.services(SERVICE_SID).verifications.create({
	   to:phone,
	   channel:"sms"
   });

   if (!otpResponse) return next(new AppError("Otp not sent", 400))
	const newUser = await User.create({
		firstName,
		lastName,
		role,
		phone,
		password,
		passwordConfirm,
	});
	
	if (req.body.role === "farmer") platform.totalFarmer += 1;
	if (req.body.role === "customer") platform.totalCustomer += 1;


	res.status(200).send({
		message:"success",
		data: `OTP send successfully!: ${JSON.stringify(otpResponse)}`          
	  });
});

exports.verifySignUpOtp = catchAsync(async (req, res, next) => {
	const { otp, phone } = req.body;

	const verifiedResponse = await client.verify.services(process.env.SERVICE_SID).verificationChecks.create({
		to:phone,
		code:otp,
	});

	const filter = { phone: phone };
	const update = { active: true };
	let user = await User.findOneAndUpdate(filter,update);

	createSendToken(user, 200,verifiedResponse,res)
})

exports.login = catchAsync(async (req, res, next) => {
	const { phone, password } = req.body;

	// 1) Check if phone and password exist
	if (!phone || !password) {
		return next(new AppError("Please provide phone and password", 400));
	}

	// 2) Check if user exists && password is correct
	const user = await User.findOne({ phone }).select("+password");

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError("Incorrect phone number or password", 401));
	}

	// 3) If everything is ok, send token to client
	createSendToken(user, 200, phone,res);
});

exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of it's there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return next(
			new AppError("You are not logged in! Please log in to get access.", 401)
		);
	}

	// 2) Verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError(
				"The user belonging to this token does no longer exist.",
				401
			)
		);
	}

	// 4) Check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError("User recently changed password! Please log in again.", 401)
		);
	}

	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action", 403)
			);
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on POSTed phone
	const user = await User.findOne({ phone: req.body.phone });
	if (!user) {
		return next(new AppError("There is no user with phone number.", 404));
	}

	// 2) Generate the random reset token
	const otpResponse = await client.verify.services(SERVICE_SID).verifications.create({
		to:req.body.phone,
		channel:"sms"
	});

	res.status(200).send({
		message:"success",
		data: `OTP send successfully!: ${JSON.stringify(otpResponse)}`
	})
});

exports.verifyResetOtp = catchAsync(async (req, res, next) => {
	const { otp, phone } = req.body;

	const verifiedResponse = await client.verify.services(process.env.SERVICE_SID).verificationChecks.create({
		to:phone,
		code:otp,
	});

	const filter = { phone: phone };
	const update = { active: true };
	let user = await User.findOneAndUpdate(filter,update);
	const doc = await User.findOne({ phone: phone });

	createSendToken(doc, 200,verifiedResponse,res)
})


exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on the phon
	const user = await User.findById(req.user._id);

	// 2) If token has not expired, and there is user, set the new password
	if (!user) {
		return next(new AppError("Token is invalid or has expired", 400));
	}

	if (req.body.password.length < 8) {
		return next(new AppError("Password must be at least 8 characters", 400));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get user from collection
	const user = await User.findById(req.user.id).select("+password");

	// 2) Check if POSTed current password is correct
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError("Your current password is wrong.", 401));
	}
	// check if the password fullfil the minimum requirement
	if (req.body.password.length < 8) {
		return next(new AppError("Password must be at least 8 characters", 400));
	}
	
	// 3) If so, update password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	await user.save();
	// User.findByIdAndUpdate will NOT work as intended!

	// 4) Log user in, send JWT
	createSendToken(user, 200,user.phone, res);
});
