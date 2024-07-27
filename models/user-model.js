const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    minlength: 2,
    maxlength: 20,
    required: true,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 30,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  properties: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//比對用戶密碼
userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    cb(null, result);
  } catch (err) {
    cb(err, result);
  }
};

//middleware，若是新用戶或是有更改密碼，則將密碼加密
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (err) {
      next(err);
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
