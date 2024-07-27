const mongoose = require("mongoose");
const { Schema } = mongoose;

const houseSchema = new Schema({
  title: {
    type: String,
    maxlength: 20,
    minLength: 5,
    required: true,
  },
  description: {
    type: String,
    maxlength: 200,
    minLength: 10,
    required: true,
  },
  type: {
    type: String,
    enum: {
      values: ["獨立套房", "分租套房", "雅房", "整層住家", "整棟住家"],
      message: "{VALUE} is not supported",
    },
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    max: 9999999,
    required: true,
  },
  address: {
    type: String,
    minlength: 5,
    maxlength: 80,
    required: true,
  },
  District: {
    type: String,
    enum: {
      values: ["北區", "中區", "南區", "東區"],
      message: "{VALUE} is not supported",
    },
    required: true,
  },
  //這一部分驗證待測試
  image: {
    type: [Buffer],
    validate: {
      validator: function (val) {
        return val.length <= 5;
      },
      message: "最多五張圖片",
    },
  },
  landlord: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("House", houseSchema);
