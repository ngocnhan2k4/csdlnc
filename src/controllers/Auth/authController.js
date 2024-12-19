const dbService = require('../../sevices/dbService.js');

const authController = {
    // login: async (req, res) => {
    //     const pool = await dbService.connect();
    //     const { TenChiNhanh, SoDienThoai } = req.body;
    //     const result = await pool.request()
    //         .query(`
    //             SELECT CASE 
    //                 WHEN COUNT(*) > 0 THEN CAST(1 AS BIT) 
    //                 ELSE CAST(0 AS BIT) 
    //             END AS ExistsRecord
    //             FROM ChiNhanh
    //             WHERE SoDienThoai = '${SoDienThoai}' AND TenChiNhanh = N'${TenChiNhanh}';
    //         `);
    //         const exists = result.recordset[0]?.ExistsRecord;

    //         res.status(200).json({
    //             exists: exists === true, // Trả về true nếu bản ghi tồn tại
    //         });
    // },
    // getDishFromBranch: async (req, res) => {
    //     const pool = await dbService.connect();
    //     const branchID = req.params.id;
    //     const page = parseInt(req.query.page) || 1;
    //     const limit = parseInt(req.query.limit) || 10;
    //     const offset = (page - 1) * limit;  
    //     const result = await pool.request()
    //         .query(`
    //             SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai 
    //             From MonAn_KhuVuc makv, ChiNhanh cn, MonAn ma
    //             where makv.MaKhuVuc= cn.KhuVuc and makv.MaMon = ma.MaMonAn and cn.MaChiNhanh=${branchID}
    //             order by ma.MaMonAn
    //             OFFSET ${offset} ROWS
    //             FETCH NEXT ${limit} ROWS ONLY;
    //         `);
    //     res.status(200).json(result.recordset);
    // },
    


    getSignupForm: async (req, res) => {
        // const pool = await dbService.connect();
        // const { TenChiNhanh, SoDienThoai } = req.body;
        // const result = await pool.request().
        // query(`
        // `);


        res.render("signup", {
            layout: "main",
            title: "Sign up",
            customHead: `
            <link rel="stylesheet" href="/Auth/signup.css">
            <script defer src="/Auth/signup.js"></script>
        `,
        });
    },

    getSigninForm: async (req, res) => {
        // const pool = await dbService.connect();
        // const { TenChiNhanh, SoDienThoai } = req.body;
        // const result = await pool.request().
        // query(`

        // `);

        res.render("signin", {
            layout: "main",
            title: "Sign in",
            customHead: `
            <link rel="stylesheet" href="/Auth/signin.css">
            <script defer src="/Auth/signin.js"></script>
        `,
        });
    },

    postSignin: async (req, res) => {
        try {
            if (req.session.userRole) {
                if (req.session.userRole === 'admin') {
                    // do something, redirect or return error
                    return res.status(400).json({ message: "Bạn đã đăng nhập với tư cách là admin!" });
                }
                else if (req.session.userRole === 'branch') {
                    // do something, redirect or return error
                    return res.status(400).json({ message: "bạn đã đăng nhập với tư cách là chi nhánh!" });
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

            if (username === 'admin' && password === 'admin') {
                req.session.userRole = 'admin'; // Store role in session
                return res.status(200).json({ message: "Đăng nhập thành công với tư cách là Admin!", code: 1});
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
                req.session.userRole = 'branch'; // Store role in session
                // Store branch ID in session
                req.session.userId = result1.recordset[0].MaChiNhanh;
                return res.status(200).json({ message: "Đăng nhập thành công với tu cách là Chi nhánh!", data: result1.recordset[0], code: 2});
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
                req.session.userRole = 'customer'; // Store role in session
                console.log('result: ', result.recordset[0]);
                // Store customer ID in session
                req.session.userId = result.recordset[0].MaTheKhachHang;
                // Store type of card in session
                req.session.cardType = result.recordset[0].LoaiThe;
                return res.status(200).json({ message: "Đăng nhập thành công với tư cách là khách hàng!", data: result.recordset[0], code: 3 });
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
}

module.exports = authController;