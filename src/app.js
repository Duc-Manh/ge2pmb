const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');

// Nạp cấu hình từ file .env
dotenv.config();

const app = express();

// Cấu hình View Engine là EJS để hiển thị giao diện
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình thư mục chứa file tĩnh (CSS, hình ảnh, JS client)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/geojson', express.static(path.join(__dirname, '../vietnam/json/geojson')));
app.use('/geojson-data', express.static(path.join(__dirname, '../vietnam/json')));

// Phục vụ favicon.ico trực tiếp
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/images/favicon.ico/favicon.ico'));
});

// Middleware giúp xử lý dữ liệu gửi lên từ Form và JSON từ Client
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình express-session
app.use(session({
  secret: 'evngenco2_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // Phiên đăng nhập tồn tại 1 ngày
}));

// Import và sử dụng các router
const webRouter = require('./routes/web.routes');
const apiRouter = require('./routes/api.routes');

app.use('/api', apiRouter);
app.use('/', webRouter);

module.exports = app;

