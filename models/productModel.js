
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,"a product must have name"],
  },
  image: {
    type: String,
    required: [true,"a product must have an image"]
  },
  type: {
    type: String,
    required: [true,"a product must have type"]
  },
  plantedDate: {
    type: Date,
    required: [true,"you must specify the planted date"]
  },
  harvestingDate: {
    type: Date,
    required: [true, "you must specify the harvesting date"]
  },
  location: {
    type: String,
    required: [true,"a product must have location"]
  },
  productDescription: {
    type: String
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: [true,"a product must have owner"]
  },
  totalAmount: {
    type: Number,
    required: [true,"a product must have total amount"],
    min: [0, 'totalAmount should be greater than or equal to 0']
  },
  remainingAmount: {
    type: Number,
    min: [0, 'remainingAmount should be greater than or equal to 0'],
    default: function () {
      return this.totalAmount
    }
  },
  active: {
    type: Boolean,
    default:false
  },
  price: {
    type: Number,
    required: [true,"a product must have price"],
    min: [0, 'price should be greater than or equal to 0']
  }
},{timestamps:true});

productSchema.methods.daysRemaining = function() {
  const today = new Date();
  const harvestingDate = new Date(this.harvestingDate);
  const diffInTime = harvestingDate.getTime() - today.getTime();
  const diffInDays = diffInTime / (1000 * 3600 * 24);
  return Math.ceil(diffInDays);
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;

// const product = new Product({...});
// console.log(product.daysRemaining());

