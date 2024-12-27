const dbService = require('../../sevices/dbService.js');

const authController = {
    getSignupForm: async (req, res) => {

        res.render("signup", {
            layout: "auth",
            title: "Sign up",
            customHead: `
            <link rel="stylesheet" href="/Auth/signup.css">
            <script defer src="/Auth/signup.js"></script>
        `,
        });
    },

    getSigninForm: async (req, res) => {

        res.render("signin", {
            layout: "auth",
            title: "Sign in",
            customHead: `
            <link rel="stylesheet" href="/Auth/signin.css">
            <script defer src="/Auth/signin.js"></script>
        `,
        });
    },

    postSignin: async (req, res) => {
        try {
            req.session.userRole = "";
            let userRole = req.session.userRole;
            if (userRole) {
                if (userRole === 'admin') {
                    // do something, redirect or return error
                    return res.status(400).json({ message: "Bạn đã đăng nhập với tư cách là admin!" });
                }
                else if (userRole === 'branch') {
                    // do something, redirect or return error
                    return res.status(400).json({ message: "Bạn đã đăng nhập với tư cách là chi nhánh!" });
                }
                else {
                    // do something, redirect or return error
                    return res.status(400).json({ message: "Bạn đã đăng nhập với tư cách là khách hàng!" });
                }
            }

            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: "Username và password không được để trống!" });
            }

            if (username === 'admin' && password === '0000000000') {
                userRole = 'admin'; // Store role in session
                req.session.userName = 'admin';
                req.session.userRole = userRole;
                return res.status(200).json({ message: "Đăng nhập thành công với tư cách là Admin!", code: 1, userRole});
            }

            const pool = await dbService.connect();

            const result1 = await pool.request()
                .input('Username', dbService.sql.NVarChar, username)
                .input('Password', dbService.sql.NVarChar, password)
                .query(`
                    SELECT * 
                    FROM ChiNhanh
                    WHERE TenChiNhanh = @Username AND SoDienThoai = @Password
                `);
            if (result1.recordset.length > 0) {
                userRole = 'branch'; // Store role in session
                // Store branch ID in session
                req.session.userId = result1.recordset[0].MaChiNhanh;
                req.session.userName = result1.recordset[0].TenChiNhanh;
                req.session.userRole = userRole;
                return res.status(200).json({ message: "Đăng nhập thành công với tu cách là Chi nhánh!", data: result1.recordset[0], code: 2, userRole});
            }

            
            const result = await pool.request()
                .input('Username', dbService.sql.NVarChar, username)
                .input('Password', dbService.sql.NVarChar, password)
                .query(`
                    SELECT * 
                    FROM TheKhachHang 
                    WHERE HoTen = @Username AND SoDienThoai = @Password
                `);

            if (result.recordset.length > 0) {
                userRole = 'customer'; // Store role in session
                console.log('result: ', result.recordset[0]);
                // Store customer ID in session
                req.session.userId = result.recordset[0].MaTheKhachHang;
                // Store type of card in session
                req.session.cardType = result.recordset[0].LoaiThe;
                req.session.userName = result.recordset[0].HoTen;
                req.session.userRole = userRole;
                return res.status(200).json({ message: "Đăng nhập thành công với tư cách là khách hàng!", data: result.recordset[0], code: 3, userRole });
            } else {
                return res.status(404).json({ message: "Tên đăng nhập hoặc mật khẩu không tồn tại!" });
            }
        } catch (error) {
            console.error("Error in postSignin:", error);
            return res.status(500).json({ message: "Lỗi server!", error });
        }
    },

    postSignup: async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                gender,
                username,
                password,
                cid,
                email,
            } = req.body;

            console.log(req.body);
    
            // Kiểm tra thông tin đầu vào
            if (!firstName || !lastName || !gender || !username || !password || !cid || !email) {
                return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
            }
    
            // Tạo HoTen từ firstName và lastName
            const fullName = username;
            
            // Ngày hiện tại
            const currentDate = new Date().toISOString().split('T')[0]; // Chỉ lấy phần yyyy-mm-dd
    
            // NhanVienLap ngẫu nhiên (1 đến 9)
            const randomStaffNumber = Math.floor(Math.random() * 10);
    
            // Giá trị mặc định cho các trường
            const totalSpending = 0.00;
            const loyaltyPoints = 0;
            const cardType = 1; // LoaiThe là 1
            const cardDate = currentDate; // Ngày đặt thẻ là ngày hiện tại
            
            let gen;
            if (gender === 'male'){
                gen = 'Nam';
            }                
            else {
                gen = 'Nu';
            }
    
            const pool = await dbService.connect();
    
            // Thực hiện câu truy vấn để thêm khách hàng vào bảng TheKhachHang
            const result = await pool.request()
                .input('FullName', dbService.sql.NVarChar, fullName)
                .input('Password', dbService.sql.VarChar, password)
                .input('CID', dbService.sql.VarChar, cid)
                .input('Email', dbService.sql.VarChar, email)
                .input('Gender', dbService.sql.NVarChar, gen)
                .input('TotalSpending', dbService.sql.Float, totalSpending)
                .input('LoyaltyPoints', dbService.sql.Int, loyaltyPoints)
                .input('CardType', dbService.sql.Int, cardType)
                .input('CurrentDate', dbService.sql.Date, currentDate)
                .input('StaffNumber', dbService.sql.Int, randomStaffNumber)
                .input('CardDate', dbService.sql.Date, cardDate)
                .query(`
                    INSERT INTO TheKhachHang (HoTen, SoDienThoai, CCCD, Email, GioiTinh, TongGiaTriTieuDungTichLuy, DiemTichLuy, LoaiThe, NgayLap, NhanVienLap, NgayDatThe)
                    VALUES (@FullName, @Password, @CID, @Email, @Gender, @TotalSpending, @LoyaltyPoints, @CardType, @CurrentDate, @StaffNumber, @CardDate)
                `);
    
            return res.status(201).json({ message: "Đăng ký thành công!", code: 1 });
        } catch (error) {
            console.error("Error in postSignup:", error);
            return res.status(500).json({ message: "Lỗi server!", error });
        }
    },

    checkAuth: async (req, res) => {
        try {
            // Kiểm tra xem userRole có trong session hay không
            if (req.session && req.session.userRole) {
                return res.status(200).json({ 
                    message: "Người dùng đã đăng nhập.", 
                    userRole: req.session.userRole, 
                    code: 1 
                });
            } else {
                return res.status(200).json({ 
                    message: "Người dùng chưa đăng nhập.", 
                    userRole: null, 
                    code: 0 
                });
            }
        } catch (error) {
            return res.status(500).json({ 
                message: "Lỗi server!", 
                error 
            });
        }
    },   
    
    logout: async (req, res) => {
        try {
            // Xóa toàn bộ session
            req.session.destroy(err => {
                if (err) {
                    // Nếu có lỗi khi xóa session
                    console.error("Lỗi khi xóa session:", err);
                    return res.status(500).json({ 
                        message: "Lỗi khi đăng xuất!", 
                        error: err 
                    });
                }
    
                // Đăng xuất thành công
                return res.status(200).json({ 
                    message: "Đăng xuất thành công!" 
                });
            });
        } catch (error) {
            // Xử lý lỗi chung
            console.error("Lỗi server:", error);
            return res.status(500).json({ 
                message: "Lỗi server!", 
                error 
            });
        }
    },
}

module.exports = authController;