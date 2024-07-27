const router = require("express").Router();
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;

router.use((req, res, next) => {
  console.log("進路auth route");
  next();
});

router.get("/", (req, res) => {
  return res.send("test");
});

//註冊route
router.post("/register", async (req, res) => {
  let userData = req.body;
  //驗證資料
  const { error } = registerValidation(userData);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    //檢查信箱是否已被註冊
    const foundUser = await User.findOne({ email: userData.email });
    if (foundUser) return res.status(400).send("此信箱已被註冊");
    const newUser = new User(userData);
    await newUser.save();
    return res.send("註冊成功");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

//登入route
router.post("/login", async (req, res) => {
  let userData = req.body;
  //驗證資料
  const { error } = loginValidation(userData);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    //查詢使用者
    const foundUser = await User.findOne({ email: userData.email });
    if (!foundUser) return res.status(400).send("此信箱尚未註冊");
    //比對密碼
    foundUser.comparePassword(userData.password, (err, result) => {
      if (err) return res.status(500).send(err.message);
      if (!result) return res.status(400).send("密碼錯誤");
      //簽發jwt
      else {
        let token = { _id: foundUser._id, email: foundUser.email };
        jwt.sign(token, process.env.API_KEY, (err, token) => {
          if (err) return res.status(500).send(err.message);
          return res.send({
            message: "登入成功",
            token: "bearer " + token,
            user: {
              username: foundUser.username,
              email: foundUser.email,
            },
          });
        });
      }
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
