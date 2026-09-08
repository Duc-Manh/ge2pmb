const app = require('./src/app');

// Lấy biến PORT từ .env, nếu không có sẽ mặc định chạy cổng 3000
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(` Server đang chạy thành công tại:`);
    console.log(` http://localhost:${PORT}`);
    console.log(`=============================================`);
  });
}

// Xuất app để Vercel nhận diện Serverless Function
module.exports = app;
