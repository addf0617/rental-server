const router = require("express").Router();
const House = require("../models/house-model");
const validation = require("../validation");
const passport = require("passport");
require("../config/passport")(passport);

const appError = require("../utils/appError");

router.get("/", async (req, res, next) => {
  try {
    //搜尋之後製作，記得確認search是放到req.body還是其他地方
    /* let search = req.body;
        if(search) {} */
    let houses = await House.find();
    if (!houses || houses.length === 0)
      return next(new appError("找不到資料", 404));
    return res.send(houses);
  } catch (err) {
    return next(new appError(err.message, 500));
  }
});

router.post(
  "/post",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    let rentalData = req.body;
    //驗證資料
    const { error } = validation.houseValidation(rentalData);
    if (error) return next(new appError(error.details[0].message, 400));
    try {
      const newRental = new House(rentalData);
    } catch (err) {
      return next(new appError(err.message, 500));
    }
  }
);

module.exports = router;
