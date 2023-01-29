const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema({
    name:{
        type:String,
        default:'platform'
    },
    totalTransaction:{
        type:Number,
        default:0
    },
    totalProfit:{
        type:Number,
        default:0
    },
    totalFarmer:{
        type:Number,
        default:0
    },
    totalCustomer:{
        type:Number,
        default:0
    },
    totalProduct:{
        type:Number,
        default:0
    },
})

const Platform = mongoose.model('Platform', platformSchema);

module.exports = Platform;