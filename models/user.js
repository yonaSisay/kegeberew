const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    firstName:{
        type:String,
        required: [true, "please enter your first name"],
        trim:true
    },
    lastName:{
        type:String,
        required: [true, "please enter your last name"],
        trim:true
    },
    phone:{
        type:String,
        unique: [true, "phone number already exists in database!"],
        trim: true,
        required: [true, "please enter your phone number"],
    },
    address: {
        type: String,
    },
    role:{
        type:String,
        enum:{
            values:['farmer','customer','admin'],
            message:"a user must have a role"
        },
        required:true
    },
    balance:{
      type:Number,
      min: [0, 'your balance must be greate than or equal to 0'],
      default:0
    },
    password: {
        type: String,
        required: true
      },
    passwordConfirm:{
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: "Passwords are not the same!"
        }
    },
    image: {
      type: String,
      default:'default.png'
    },
    money:{
      type:Number,
      default:0
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {type: Boolean, default: true, select: true}
},{
    timestamps:true
})

userSchema.virtual('fullName').get(function(){
    return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
  });

  userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });

  userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
  });

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  
  userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };
  
  userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
  
const User = mongoose.model("User",userSchema);
module.exports = User 
