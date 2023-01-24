const GoogleMapsAPI = require('googlemaps');
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // other fields ...
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
        type: String,
    }
  },
  // other fields ...
});

productSchema.index({ location: '2dsphere' });

productSchema.methods.calculateDistance = function(destination, apiKey) {
  const googleMaps = new GoogleMapsAPI({
    key: apiKey
  });
  const params = {
    origin: this.location.address,
    destination: destination,
    mode: 'driving'
  };
  return new Promise((resolve, reject) => {
    googleMaps.distance(params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;





// exports.send = catchAsync(async (req,res,next)=>{
//     const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:If you didn't forget your password, please ignore this email!`;
//     await sendEmail({
//         email: 'yonimelkamu357@gmail.com',
//         subject: 'Your password reset token (valid for 10 min)',
//         message
//       });
//       res.status(200).json({
//         status: 'success',
//         message: 'Token sent to email!'
//       });
// })