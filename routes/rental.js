const router = require("express").Router();
const House = require("../models/house-model");
const User = require("../models/user-model");
const validation = require("../validation");
const passport = require("passport");
require("../config/passport")(passport);
const appError = require("../utils/appError");
const multer = require("multer");
const upload = multer({
  limits: { files: 1 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new appError("只接受jpg、jpeg、png格式的圖片", 400));
    }
    if (file.size > 2 * 1024 * 1024) {
      return cb(new appError("圖片大小超過2MB", 400));
    }
    return cb(null, true);
  },
});
const sharp = require("sharp");

const isValidObjectId = require("../validation").isValidObjectId;

router.get("/", async (req, res, next) => {
  try {
    if (Object.keys(req.query).length > 0) {
      //這裡需要搜尋特定條件
      let query = {};
      let { type, maxPrice, District, ...other } = req.query;

      if (type) query.type = type;
      if (maxPrice) query.price = { $lte: parseInt(maxPrice) };
      if (District) query.District = District;
      if (Object.keys(other).length > 0)
        return next(new appError("請輸入正確的搜尋條件", 400));

      let foundHouse = await House.find(query).select("-image");
      if (foundHouse.length === 0) return next(new appError("找不到資料", 404));
      return res.send(foundHouse);
    } else {
      //搜尋所有房屋
      let houses = await House.find()
        .select("-image")
        .populate("landlord", ["username", "phoneNumber"]);
      if (!houses || houses.length === 0)
        return next(new appError("找不到資料", 404));
      return res.send(houses);
    }
  } catch (err) {
    return next(new appError(err.message, 500));
  }
});

/* router.get("/search", async (req, res, next) => {
  try {
    console.log("正在search");
    let query = req.query;
    console.log(query);
    console.log(req.query);
    let foundHouse = await House.find(req.query);
    if (foundHouse.length === 0) return next(new appError("找不到資料", 404));
    return res.send(foundHouse);
    //根據條件搜尋
  } catch (err) {
    return next(new appError(err.message, 500));
  }
}); */

router.get("/:_id", async (req, res, next) => {
  try {
    let { _id } = req.params;
    //檢驗是否為合法的id
    if (!isValidObjectId(_id)) {
      return next(new appError("請輸入正確格式的id", 400));
    }
    let foundHouse = await House.findById(_id).populate("landlord", [
      "username",
      "phoneNumber",
    ]);
    if (!foundHouse) return next(new appError("找不到資料", 404));
    return res.send(foundHouse);
  } catch (err) {
    return next(new appError(err.message, 500));
  }
});

//撈取圖片
router.get("/image/:_id", async (req, res, next) => {
  try {
    let { _id } = req.params;
    if (!isValidObjectId(_id))
      return next(new appError("請輸入正確格式的id", 400));
    let foundImage = await House.findById(_id).select("image");
    if (!foundImage) return next(new appError("找不到圖片資料", 404));
    res.set("content-type", "image/png");
    return res.send(foundImage.image);
  } catch (err) {
    next(new appError(err.message, 500));
  }
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  async (req, res, next) => {
    let rentalData = req.body;
    try {
      //轉換圖片
      if (!req.file) return next(new appError("請上傳圖片", 400));
      let buffer = await sharp(req.file.buffer)
        .resize({ width: 300, height: 500 })
        .png()
        .toBuffer();
      rentalData.image = buffer;
      //驗證資料
      const { error } = validation.houseValidation(rentalData);
      if (error) return next(new appError(error.details[0].message, 400));

      const newRental = new House({ ...rentalData, landlord: req.user._id });
      await newRental.save();

      //房東增加出租房屋
      let foundUser = await User.findById(req.user._id);
      foundUser.properties.push(newRental._id);
      await foundUser.save();

      return res.send("上傳成功");
    } catch (err) {
      return next(new appError(err.message, 500));
    }
  }
);

router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      let { _id } = req.params;
      //檢驗是否為合法的id
      if (!isValidObjectId(_id)) {
        return next(new appError("請輸入正確格式的id", 400));
      }
      let foundHouses = await House.findById(_id);
      if (!foundHouses) return next(new appError("找不到資料", 404));
      //console.log(foundHouses.landlord == req.user._id); 這樣會顯示false
      if (foundHouses.landlord.equals(req.user._id)) {
        await House.findByIdAndDelete(_id);
        return res.send("刪除成功");
      }
      return next(new appError("權限不足", 403));
    } catch (err) {
      next(new appError(err.message, 500));
    }
  }
);

module.exports = router;
