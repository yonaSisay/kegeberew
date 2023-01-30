const contactUs = require("../models/contactUsModel");

exports.contactUs = catchAsync(async (req, res, next) => {
    const contact = await contactUs.create({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        message: req.body.message,
    });

    res.status(200).json({
        status: "success",
        data: {
            contact,
            message: "your message has been sent successfully",
        },
    });
})

exports.getContactUs = catchAsync(async (req, res, next) => {
    const contact = await contactUs.find();

    res.status(200).json({
        status: "success",
        data: {
            contact,
        },
    });
})