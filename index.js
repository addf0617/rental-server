const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("./config/passport")(passport);

const appError = require("./utils/appError");
const globalErrorHandler = require("./errorController");
const authRouter = require("./routes/auth");
const rentalRouter = require("./routes/rental");

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRouter);
app.use("/api/rental", rentalRouter);

app.all("*", (req, res, next) => {
  return next(new appError("can't find this route", 404));
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
