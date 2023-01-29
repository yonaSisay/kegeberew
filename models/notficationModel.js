const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Notification must have a recipient']
    },
    message: {
        type: String,
        required: [true, 'Notification must have a message']
    },
    read: {
        type: Boolean,
        default: false
    }
},{timestamps:true}
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
