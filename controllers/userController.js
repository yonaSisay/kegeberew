const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/user');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const fs = require('fs')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(x, false);
  } 
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserPhoto = upload.single("image");

// in this function i have used the sharp module to resize and save the image in the folder
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`images/users/${req.file.filename}`);
  next();
};


exports.updateUser = catchAsync(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);
    // Make sure user is found
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    
    if(req.body.password){
        return next(new AppError("this is not the route to update password"))
    }
    // Make sure user is the owner of the resource or an admin
    
    if (user.id !== req.user.id) {
        return next(new AppError('You do not have permission to update this user', 403));
    }
    
    if (req.file) req.body.image = req.file.filename
    
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  });

  exports.deleteAccount = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    if (user.image !== 'default.png') {
      fs.unlink(`images/users/${user.image}`, (err) => {
        if (err) {
          return next(new AppError('Failed to delete user image', 500));
        }
      });
    }
    
    await user.remove();

    res.status(200).json({
      status: 'success',
      data: null
    });
  });
