const router = require("express").Router();
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");

const appError = require("../utils/appError");
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;

//註冊route
router.post("/register", async (req, res, next) => {
  let userData = req.body;
  //驗證資料
  const { error } = registerValidation(userData);
  if (error) return next(new appError(error.details[0].message, 400));
  try {
    //檢查信箱是否已被註冊
    const foundUser = await User.findOne({ email: userData.email }).exec();
    if (foundUser) return next(new appError("此信箱已被註冊", 400));
    const newUser = new User(userData);
    await newUser.save();
    return res.send("註冊成功");
  } catch (err) {
    return next(new appError(err.message, 500));
  }
});

//登入route
router.post("/login", async (req, res, next) => {
  let userData = req.body;
  //驗證資料
  const { error } = loginValidation(userData);
  if (error) return next(new appError(error.details[0].message, 400));
  try {
    //查詢使用者
    const foundUser = await User.findOne({ email: userData.email }).exec();
    if (!foundUser) return next(new appError("此信箱尚未註冊", 400));
    //比對密碼
    foundUser.comparePassword(userData.password, (err, result) => {
      if (err) return next(new appError(err.message, 500));
      if (!result) return next(new appError("密碼錯誤", 400));
      //簽發jwt
      else {
        let token = { _id: foundUser._id, email: foundUser.email };
        jwt.sign(token, process.env.API_KEY, (err, token) => {
          if (err) return next(new appError(err.message, 500));
          return res.send({
            message: "登入成功",
            token: "bearer " + token,
            user: foundUser,
          });
        });
      }
    });
  } catch (err) {
    return next(new appError(err.message, 500));
  }
});

module.exports = router;
