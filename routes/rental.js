const router = require("express").Router();
const House = require("../models/house-model");
const validation = require("../validation");
const passport = require("passport");
require("../config/passport")(passport);
const appError = require("../utils/appError");
const multer = require("multer");
const upload = multer({
  limits: { files: 1 },
  fileFilter: (req, file, cb) => {
    console.log(file);
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

const isValidObejctId = require("../validation").isValidObejctId;

router.get("/", async (req, res, next) => {
  try {
    //搜尋所有房屋
    let houses = await House.find().populate("landlord", [
      "username",
      "phoneNumber",
    ]);
    if (!houses || houses.length === 0)
      return next(new appError("找不到資料", 404));
    //之後看要不要額外設定res.set('content-type', ...)
    return res.send(houses);
  } catch (err) {
    return next(new appError(err.message, 500));
  }
});

router.get("/search", async (req, res, next) => {
  try {
    let { search } = req.params;
    //根據條件搜尋
  } catch (err) {
    return next(new appError(err.message, 500));
  }
});

router.get("/:_id", async (req, res, next) => {
  try {
    let { _id } = req.params;
    //檢驗是否為合法的id
    if (!isValidObejctId(_id)) {
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

router.post(
  "/post",
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
      console.log(rentalData);
      //驗證資料
      const { error } = validation.houseValidation(rentalData);
      if (error) return next(new appError(error.details[0].message, 400));

      const newRental = new House({ ...rentalData, landlord: req.user._id });
      await newRental.save();
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
      let _id = req.params._id;
      //檢驗是否為合法的id
      if (!isValidObejctId(_id)) {
        return next(new appError("請輸入正確格式的id", 400));
      }
      let foundHouses = await House.findById(_id);
      if (!foundHouses) return next(new appError("找不到資料", 404));
      if (foundHouses.landlord != req.user._id) {
        return next(new appError("權限不足", 403));
      }
      await House.findByIdAndDelete(_id);
      return res.send("刪除成功");
    } catch (err) {
      next(new appError(err.message, 500));
    }
  }
);

module.exports = router;
