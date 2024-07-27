const router = require("express").Router();
const House = require("../models/house-model");
const validation = require("../validation");
const passport = require("passport");
require("./config/passport")(passport);

router.get("/", async (req, res) => {
  try {
    //搜尋之後製作，記得確認search是放到req.body還是其他地方
    /* let search = req.body;
        if(search) {} */
    let houses = await House.find();
    if (houses) return res.send(houses);
    else return res.status(404).send("找不到資料");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post(
  "/post",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let rentalData = req.body;
    //驗證資料
    const { error } = validation.houseValidation(rentalData);
    if (error) return res.status(400).send(error.details[0].message);
    try {
      const newRental = new House(rentalData);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

module.exports = router;
