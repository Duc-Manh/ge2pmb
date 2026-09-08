const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
// GET / - Render the 3D Architect Landing Page
router.get('/', (req, res) => {
  res.render('home');
});

// GET /login - Render the Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// POST /register - Xử lý đăng ký tài khoản mới
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirm_password, captcha_verified, full_name, phone, room } = req.body;

    if (captcha_verified !== 'true') {
      return res.send('<script>alert("Vui lòng xác thực bằng cách kéo thanh trượt!"); window.location.href="/login";</script>');
    }
    
    if (password !== confirm_password) {
      return res.send('<script>alert("Mật khẩu xác nhận không khớp!"); window.location.href="/login";</script>');
    }

    // Kiểm tra xem email đã tồn tại chưa
    const [existingUsers] = await db.execute('SELECT email FROM login WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.send('<script>alert("Email này đã được đăng ký!"); window.location.href="/login";</script>');
    }

    // Mã hoá mật khẩu với thuật toán bcrypt mạnh mẽ (Salt rounds = 12)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Lưu vào Database với mật khẩu đã mã hóa và các trường thông tin mở rộng (giá trị mặc định nếu bỏ trống từ form)
    const defaultRole = 0; // Đã đổi thành số 0 vì bạn tạo cột kiểu INT
    const finalFullName = full_name || '';
    const finalPhone = phone || '';
    const finalRoom = room || '';
    await db.execute(
      'INSERT INTO login (email, full_name, password, phone, room, state, role) VALUES (?, ?, ?, ?, ?, 1, ?)', 
      [email, finalFullName, hashedPassword, finalPhone, finalRoom, defaultRole]
    );

    // Gửi email thông báo
    try {
      if (process.env.MAIL_USER && process.env.MAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.MAIL_USER,
          to: 'ge2.pmb@gmail.com',
          subject: 'Thông báo: Đăng ký tài khoản mới',
          text: `Một người dùng vừa đăng ký tài khoản mới trên hệ thống.\n\nThông tin đăng ký:\n- Email: ${email}`
        };

        await transporter.sendMail(mailOptions);
      } else {
        console.warn('Chưa cấu hình MAIL_USER và MAIL_PASS trong .env nên bỏ qua gửi mail.');
      }
    } catch (mailError) {
      console.error('Lỗi khi gửi email:', mailError);
    }

    res.send('<script>alert("Đề nghị của bạn sẽ được sớm xem xét"); window.location.href="/login";</script>');
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.send(`<script>alert("Lỗi: ${error.message}"); window.location.href="/login";</script>`);
  }
});

// POST /login - Xử lý đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cfToken = req.body['cf-turnstile-response'];

    if (!cfToken) {
      return res.send('<script>alert("Vui lòng hoàn thành xác thực Cloudflare!"); window.location.href="/login";</script>');
    }

    // Gọi API xác thực Turnstile với Cloudflare
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (secretKey) {
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', cfToken);

      const cfResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
      });
      const cfOutcome = await cfResult.json();

      if (!cfOutcome.success) {
        return res.send('<script>alert("Xác thực Cloudflare thất bại, vui lòng thử lại!"); window.location.href="/login";</script>');
      }
    } else {
      console.warn('Chưa cấu hình TURNSTILE_SECRET_KEY trong .env');
    }

    // Kiểm tra xem email có tồn tại không
    const [users] = await db.execute('SELECT * FROM login WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.send('<script>alert("Email hoặc mật khẩu không chính xác!"); window.location.href="/login";</script>');
    }

    const user = users[0];

    // So sánh mật khẩu đã mã hoá
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.send('<script>alert("Email hoặc mật khẩu không chính xác!"); window.location.href="/login";</script>');
    }

    // Đăng nhập thành công -> Lưu thông tin vào Session
    req.session.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name || 'Người dùng'
    };
    res.redirect('/board');
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.send(`<script>alert("Lỗi: ${error.message}"); window.location.href="/login";</script>`);
  }
});

// GET /board - Render trang bảng điều khiển
router.get('/board', async (req, res) => {
  // Kiểm tra xem đã đăng nhập chưa
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as pending_count FROM login WHERE state = 0');
    const pendingCount = rows[0].pending_count;
    
    const [buildRows] = await db.execute('SELECT COUNT(*) as active_count FROM build WHERE status = ?', ['Đang triển khai']);
    const activeProjectCount = buildRows[0].active_count;

    res.render('board', { user: req.session.user, pendingCount, activeProjectCount });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.render('board', { user: req.session.user, pendingCount: 0, activeProjectCount: 0 });
  }
});

// GET /employ - Render trang quản lý nhân sự
router.get('/employ', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  try {
    const [employees] = await db.execute('SELECT email, full_name, password, phone, room, position, role FROM login');
    const [rows] = await db.execute('SELECT COUNT(*) as pending_count FROM login WHERE state = 0');
    const pendingCount = rows[0].pending_count;
    res.render('employ', { user: req.session.user, employees, pendingCount });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /project - Render trang quản lý dự án
router.get('/project', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const [userRows] = await db.execute('SELECT COUNT(*) as pending_count FROM login WHERE state = 0');
    const pendingCount = userRows[0].pending_count;

    const [projectRows] = await db.execute('SELECT COUNT(*) as total_projects FROM build');
    const totalProjects = projectRows[0].total_projects;

    const [activeRows] = await db.execute('SELECT COUNT(*) as active_projects FROM build WHERE status = ?', ['Đang triển khai']);
    const activeProjects = activeRows[0].active_projects;

    const [completedRows] = await db.execute('SELECT COUNT(*) as completed_projects FROM build WHERE status = ?', ['Hoàn thành']);
    const completedProjects = completedRows[0].completed_projects;

    const [delayedRows] = await db.execute('SELECT COUNT(*) as delayed_projects FROM build WHERE status = ?', ['Chậm tiến độ']);
    const delayedProjects = delayedRows[0].delayed_projects;

    const [projects] = await db.execute('SELECT * FROM build ORDER BY id DESC');

    res.render('project', { user: req.session.user, pendingCount, totalProjects, activeProjects, completedProjects, delayedProjects, projects });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.render('project', { user: req.session.user, pendingCount: 0, totalProjects: 0, activeProjects: 0, completedProjects: 0, delayedProjects: 0, projects: [] });
  }
});

// GET /bid - Render trang quản lý hồ sơ đấu thầu
router.get('/bid', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as pending_count FROM login WHERE state = 0');
    const pendingCount = rows[0].pending_count;
    res.render('bid', { user: req.session.user, pendingCount });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.render('bid', { user: req.session.user, pendingCount: 0 });
  }
});

// GET /save - Render trang Văn thư - Lưu trữ
router.get('/save', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as pending_count FROM login WHERE state = 0');
    const pendingCount = rows[0].pending_count;
    res.render('save', { user: req.session.user, pendingCount });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.render('save', { user: req.session.user, pendingCount: 0 });
  }
});

// POST /employ/update - Cập nhật thông tin nhân sự
router.post('/employ/update', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const { email, full_name, password, phone, room, position, role } = req.body;
  
  if (!email || !full_name || !phone || !room || !role) {
    return res.status(400).send('Thiếu thông tin bắt buộc');
  }
  
  try {
    if (password && password.trim() !== '') {
      await db.execute(
        'UPDATE login SET full_name = ?, password = ?, phone = ?, room = ?, position = ?, role = ? WHERE email = ?',
        [full_name, password, phone, room, position, role, email]
      );
    } else {
      await db.execute(
        'UPDATE login SET full_name = ?, phone = ?, room = ?, position = ?, role = ? WHERE email = ?',
        [full_name, phone, room, position, role, email]
      );
    }


    // Gửi email thông báo cập nhật thành công
    try {
      if (process.env.MAIL_USER && process.env.MAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.MAIL_USER,
          to: email,
          subject: 'Thông báo: Cập nhật thông tin tài khoản thành công',
          text: `Xin chào ${full_name},\n\nThông tin tài khoản của bạn trên hệ thống Quản trị Nhân sự EVNGENCO2 đã được quản trị viên cập nhật thành công.\n\nThông tin hiện tại:\n- Phòng ban: ${room}\n- Chức vụ: ${position || 'Không có'}\n- Số điện thoại: ${phone}\n- Vai trò: ${role == 2 ? 'Admin' : 'User'}\n\nTrân trọng!`
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (mailError) {
      console.error('Lỗi khi gửi email cập nhật:', mailError);
    }

    res.redirect('/employ');
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

// GET /logout - Đăng xuất
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// POST /project/add - Tạo dự án mới
router.post('/project/add', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const { 
    project_name, contract_num, contract_name, unit_build, 
    contract_time, contract_price, contract_employ, 
    schedule_level1, schedule_level2, schedule_level3, status 
  } = req.body;
  
  try {
    const [result] = await db.execute(
      `INSERT INTO build 
      (project_name, contract_num, contract_name, contract_time, contract_price, contract_employ, schedule_level1, schedule_level2, schedule_level3, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_name, contract_num, contract_name, contract_time, contract_price, contract_employ, schedule_level1, schedule_level2, schedule_level3, status]
    );
    
    // Yêu cầu: cột unit_build lưu giá trị giống cột id
    const insertId = result.insertId;
    await db.execute('UPDATE build SET unit_build = ? WHERE id = ?', [insertId.toString(), insertId]);

    res.redirect('/project');
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

module.exports = router;
