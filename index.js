const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("./config/passport")(passport);
const authRouter = require("./routes/auth");

const PORT = process.env.PORT;

mongoose
  .connect("mongodb://127.0.0.1:27017/rent")
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("server is running");
});

app.get("/test", (req, res) => {
  console.log(req);
  res.send("test ok");
});

app.use("/api/user", authRouter);
//app.use();

app.all("*", (req, res) => {
  res.status(404).send("404 page not found");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
