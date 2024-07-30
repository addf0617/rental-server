const multer = require("multer");

globalErrorController = (err, req, res, next) => {
  //應該是不太好的做法，所有multerError都賴使用者QQ
  //比較好的做法應該是多做一個專門處理multer的errorHandler，根據err.code回傳不同的錯誤訊息
  if (err instanceof multer.MulterError) {
    err.statusCode = 400;
  }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = globalErrorController;
