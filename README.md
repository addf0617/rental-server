進度條
model 完成，router 完成 register、login，login 可以簽發 jwt
JwtStrategy 設定大致完成

完成錯誤統一處理 -> 新增 appError.js、errorController.js
小問題: 使用者上傳超過一張圖片會得到 500HTTPCode，而不是 400

將 login route 在登入成功時發送的 user 資料更改為 foundUser，將 index.js 中 app.all()中一條測試用 log 刪除
刪除各個測試用 log

新增根據用戶 id 搜尋房屋的 route；將從資料庫撈回的資料加上 exec()

search route 完成，不過還有優化空間。
