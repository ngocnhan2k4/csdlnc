const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const employeeController = {
    manageEmployee: async (req, res) => {
        try {
            // Gán giá trị mặc định nếu không có page hoặc limit từ client
            req.query.page = parseInt(req.query.page) || 1;
            req.query.limit = parseInt(req.query.limit) || 10;
    
            // Gọi getAllEmployee và lấy dữ liệu
            const { employees, totalPages, currentPage } = await employeeController.getAllEmployee(req);
            const branches = await employeeController.getBranches(req);
            const departments = await employeeController.getDepartments(req);
    
            // Render trang với dữ liệu
            res.render("manageEmployee", {
                layout: "main",
                title: "Manage Employee",
                allEmployee: employees,
                totalPages,      // Tổng số trang
                currentPage,     // Trang hiện tại
                rowsPerPage: req.query.limit, // Dòng mỗi trang
                branches,
                departments,
                customHead: `
                    <link rel="stylesheet" href="/CT/manageEmployee/manageEmployee.css">
                    <link rel="stylesheet" href="/CT/manageEmployee/addEmployee.css">
                    <script defer src="/CT/manageEmployee/manageEmployee.js"></script>
                `,
            });
        } catch (error) {
            console.error("Error in manageEmployee:", error);
            res.status(500).send("Internal Server Error");
        }
    },    

    getAllEmployeeFromBranch: async (req) => {
        const pool = await dbService.connect();
        const branchID = req.params.branchID;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select nv.MaNhanVien,nv.HoTen,nv.GioiTinh,nv.SoDienThoai,nv.SoNha,nv.Duong,nv.Quan,nv.ThanhPho,nv.NgayVaoLam,nv.NgayNghiViec,nv.NgaySinh
                from  NhanVien nv,LichSuLamViec ls
                where nv.MaNhanVien = ls.MaNhanVien and ls.MaChiNhanh=${branchID}
                order by nv.MaNhanVien
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    
    getAllEmployee: async (req) => {
        const pool = await dbService.connect();
    
        // Lấy và validate tham số page và limit
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.rowsPerPage, 10) || 10;
        const branch = req.query.branch || ''; // Lấy chi nhánh từ query params
        const search = req.query.search || ''; // Lấy từ khóa tìm kiếm từ query params
    
        if (page < 1 || limit < 1) {
            throw new Error("Page and limit must be positive integers.");
        }
    
        const offset = (page - 1) * limit;
    
        try {
            // Truy vấn lấy dữ liệu nhân viên với điều kiện lọc theo chi nhánh và tìm kiếm
            let query = `
                SELECT nv.MaNhanVien, nv.HoTen, bp.TenBoPhan, nv.NgayVaoLam, nv.NgayNghiViec
                FROM NhanVien nv
                LEFT JOIN LichSuLamViec ls ON nv.MaNhanVien = ls.MaNhanVien
                LEFT JOIN BoPhanHeThong bp ON ls.BoPhanLamViec = bp.MaBoPhan
                LEFT JOIN ChiNhanh cn ON ls.MaChiNhanh = cn.MaChiNhanh
                WHERE 1=1
            `;
    
            // Thêm điều kiện lọc theo chi nhánh nếu có
            if (branch) {
                query += ` AND cn.TenChiNhanh LIKE @branch`;
            }
    
            // Thêm điều kiện tìm kiếm theo họ tên nếu có
            if (search) {
                query += ` AND nv.HoTen LIKE @search`;
            }
    
            query += `
                ORDER BY nv.MaNhanVien
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
            `;
    
            // Thực hiện truy vấn với các tham số đầu vào
            const result = await pool.request()
                .input("offset", offset)
                .input("limit", limit)
                .input("branch", `%${branch}%`) // Lọc theo tên chi nhánh
                .input("search", `%${search}%`) // Lọc theo tên nhân viên
                .query(query);
    
            // Truy vấn lấy tổng số nhân viên với các điều kiện tương tự
            let totalEmployeesQuery = `
                SELECT COUNT(*) AS total
                FROM NhanVien nv
                LEFT JOIN LichSuLamViec ls ON nv.MaNhanVien = ls.MaNhanVien
                LEFT JOIN ChiNhanh cn ON ls.MaChiNhanh = cn.MaChiNhanh
                WHERE 1=1
            `;
            
            if (branch) {
                totalEmployeesQuery += ` AND cn.TenChiNhanh LIKE @branch`;
            }
    
            if (search) {
                totalEmployeesQuery += ` AND nv.HoTen LIKE @search`;
            }
    
            const totalEmployees = await pool.request()
                .input("branch", `%${branch}%`)
                .input("search", `%${search}%`)
                .query(totalEmployeesQuery);
    
            const total = totalEmployees.recordset[0]?.total || 0;
            const totalPages = Math.ceil(total / limit);
    
            // Định dạng NgayVaoLam và NgayNghiViec trước khi trả về
            const formattedEmployees = result.recordset.map((employee) => ({
                ...employee,
                NgayVaoLam: employee.NgayVaoLam
                    ? new Date(employee.NgayVaoLam).toLocaleDateString('vi-VN')  // Định dạng ngày
                    : null,
                NgayNghiViec: employee.NgayNghiViec
                    ? new Date(employee.NgayNghiViec).toLocaleDateString('vi-VN')  // Định dạng ngày
                    : "",
            }));
    
            // Return the employee data with pagination info
            return {
                employees: formattedEmployees,
                totalPages,
                currentPage: page,
                totalEmployees: total,
            };
        } catch (error) {
            console.error("Error fetching employees:", error.message);
            throw new Error("Failed to fetch employee data.");
        }
    },              

    getAllEmployeeJS: async (req, res) => {
        const pool = await dbService.connect();
    
        // Lấy và validate tham số page, limit, branch và search từ query params
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.rowsPerPage, 10) || 10;
        const branch = req.query.branch || ''; // Lấy chi nhánh từ query params
        const search = req.query.search || ''; // Lấy từ khóa tìm kiếm từ query params
    
        if (page < 1 || limit < 1) {
            return res.status(400).json({ error: "Page and limit must be positive integers." });
        }
    
        const offset = (page - 1) * limit;
    
        try {
            // Truy vấn lấy dữ liệu nhân viên với điều kiện lọc theo chi nhánh và tìm kiếm
            let query = `
                SELECT nv.MaNhanVien, nv.HoTen, bp.TenBoPhan, nv.NgayVaoLam, nv.NgayNghiViec
                FROM NhanVien nv
                LEFT JOIN LichSuLamViec ls ON nv.MaNhanVien = ls.MaNhanVien
                LEFT JOIN BoPhanHeThong bp ON ls.BoPhanLamViec = bp.MaBoPhan
                LEFT JOIN ChiNhanh cn ON ls.MaChiNhanh = cn.MaChiNhanh
                WHERE 1=1
            `;
    
            // Thêm điều kiện lọc theo chi nhánh nếu có
            if (branch) {
                query += ` AND cn.TenChiNhanh LIKE @branch`;
            }
    
            // Thêm điều kiện tìm kiếm theo họ tên nếu có
            if (search) {
                query += ` AND nv.HoTen LIKE @search`;
            }
    
            query += `
                ORDER BY nv.MaNhanVien
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
            `;
    
            // Thực hiện truy vấn với các tham số đầu vào
            const result = await pool.request()
                .input("offset", offset)
                .input("limit", limit)
                .input("branch", `%${branch}%`) // Lọc theo tên chi nhánh
                .input("search", `%${search}%`) // Lọc theo tên nhân viên
                .query(query);
    
            // Truy vấn lấy tổng số nhân viên với các điều kiện tương tự
            let totalEmployeesQuery = `
                SELECT COUNT(*) AS total
                FROM NhanVien nv
                LEFT JOIN LichSuLamViec ls ON nv.MaNhanVien = ls.MaNhanVien
                LEFT JOIN ChiNhanh cn ON ls.MaChiNhanh = cn.MaChiNhanh
                WHERE 1=1
            `;
            
            if (branch) {
                totalEmployeesQuery += ` AND cn.TenChiNhanh LIKE @branch`;
            }
    
            if (search) {
                totalEmployeesQuery += ` AND nv.HoTen LIKE @search`;
            }
    
            const totalEmployees = await pool.request()
                .input("branch", `%${branch}%`)
                .input("search", `%${search}%`)
                .query(totalEmployeesQuery);
    
            const total = totalEmployees.recordset[0]?.total || 0;
            const totalPages = Math.ceil(total / limit);
    
            // Định dạng NgayVaoLam và NgayNghiViec trước khi trả về
            const formattedEmployees = result.recordset.map((employee) => ({
                ...employee,
                NgayVaoLam: employee.NgayVaoLam
                    ? new Date(employee.NgayVaoLam).toLocaleDateString('vi-VN')  // Định dạng ngày
                    : null,
                NgayNghiViec: employee.NgayNghiViec
                    ? new Date(employee.NgayNghiViec).toLocaleDateString('vi-VN')  // Định dạng ngày
                    : "",
            }));
    
            // Trả về dữ liệu nhân viên với thông tin phân trang
            res.json({
                employees: formattedEmployees,
                totalPages,
                currentPage: page,
                totalEmployees: total,
            });
        } catch (error) {
            console.error("Error fetching employees:", error.message);
            return res.status(500).json({ error: "Failed to fetch employee data." });
        }
    },       

    getBranches: async () => {
        const pool = await dbService.connect();
    
        try {
            // Truy vấn lấy thông tin tất cả các chi nhánh
            const result = await pool.request()
                .query(`
                    SELECT MaChiNhanh, TenChiNhanh, DiaChi, SoDienThoai
                    FROM ChiNhanh
                    ORDER BY MaChiNhanh;
                `);
    
            // Định dạng dữ liệu trước khi trả về
            const branches = result.recordset.map((branch) => ({
                MaChiNhanh: branch.MaChiNhanh,
                TenChiNhanh: branch.TenChiNhanh,
                DiaChi: branch.DiaChi,
                SoDienThoai: branch.SoDienThoai,
            }));
    
            return branches; // Trả về danh sách các chi nhánh
        } catch (error) {
            console.error("Error fetching branches:", error);
            throw new Error("Failed to fetch branches.");
        } finally {
            pool.close(); // Đảm bảo đóng kết nối
        }
    },    

    getDepartments: async () => {
        const pool = await dbService.connect();
    
        try {
            // Truy vấn lấy thông tin tất cả các bộ phận
            const result = await pool.request()
                .query(`
                    SELECT MaBoPhan, TenBoPhan
                    FROM BoPhanHeThong
                    ORDER BY MaBoPhan;
                `);
    
            // Định dạng dữ liệu trước khi trả về
            const departments = result.recordset.map((department) => ({
                MaBoPhan: department.MaBoPhan,
                TenBoPhan: department.TenBoPhan,
            }));
    
            return departments; // Trả về danh sách các bộ phận
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw new Error("Failed to fetch departments.");
        } finally {
            pool.close(); // Đảm bảo đóng kết nối
        }
    },    

    searchEmployee : async (req, res) => {
        const pool = await dbService.connect();
        const { TuKhoa} = req.body;
        const result = await pool.request()
            .query(`
                SELECT nv.HoTen
                FROM NhanVien nv
                where nv.HoTen like N'%${TuKhoa}%'
            `);
        res.status(200).json(result.recordset);
    },

    createEmployee: async (req, res) => {
        try {
            const pool = await dbService.connect();
            console.log("Received data:", req.body);
    
            let {
                HoTen,
                NgaySinh,
                GioiTinh,
                SoDienThoai,
                SoNha,
                Duong,
                Quan,
                ThanhPho,
                NgayVaoLam,
                MaChiNhanh,
                BoPhanLamViec,
            } = req.body;
    
            // Kiểm tra các trường bắt buộc
            if (!HoTen || !NgaySinh || !GioiTinh || !SoDienThoai || !SoNha || !Duong || !Quan || !ThanhPho || !NgayVaoLam || !MaChiNhanh || !BoPhanLamViec) {
                return res.status(400).json({ error: "Missing required fields" });
            }
    
            // Chuyển đổi giới tính
            if (GioiTinh.toLowerCase() === "male"){
                GioiTinh = "Nam";
            } else {
                GioiTinh = "Nữ";
            }
    
            // Chuyển đổi định dạng ngày tháng sang 'YYYY-MM-DD'
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };
    
            NgaySinh = formatDate(NgaySinh);
            NgayVaoLam = formatDate(NgayVaoLam);
    
            // Thực thi truy vấn
            const result = await pool.request()
                .query(`
                    EXEC sp_AddEmployee 
                    @HoTen = N'${HoTen}',
                    @NgaySinh = '${NgaySinh}',
                    @GioiTinh = N'${GioiTinh}',
                    @SoDienThoai = '${SoDienThoai}',
                    @SoNha = N'${SoNha}',
                    @Duong = N'${Duong}',
                    @Quan = N'${Quan}',
                    @ThanhPho = N'${ThanhPho}',
                    @NgayVaoLam = '${NgayVaoLam}',
                    @NgayNghiViec = NULL,
                    @MaChiNhanh = ${MaChiNhanh},
                    @BoPhanLamViec = ${BoPhanLamViec}
                `);
    
            console.log("Database result:", result);
    
            // Gửi phản hồi JSON
            return res.status(200).json({
                message: "Employee added successfully",
                data: result.recordset,
            });
        } catch (error) {
            console.error("Error adding employee:", error.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },          

    deleteEmployee : async (req,res) =>{
        //chỉ xóa dc khi có 1 dòng dl trong bảng LichSuLamViec
        const pool = await dbService.connect();
        const {MaNhanVien} = req.body;
        const result = await pool.request()
            .query(`
                DELETE FROM LichSuLamViec WHERE MaNhanVien = ${MaNhanVien};
                DELETE FROM NhanVien WHERE MaNhanVien = ${MaNhanVien};
            `);
        res.status(200).json(result.recordset);
    },

    updateEmployee : async (req,res) =>{
        const pool = await dbService.connect();
        const {MaNhanVien,HoTen,NgaySinh,GioiTinh,SoDienThoai,SoNha,Duong,Quan,ThanhPho,NgayVaoLam,NgayNghiViec} = req.body;
        if(!NgayNghiViec){
        const result = await pool.request()
            .query(`
                EXEC sp_UpdateEmployee
                @MaNhanVien = ${MaNhanVien}, 
                @HoTen = N'${HoTen}',
                @NgaySinh = '${NgaySinh}',
                @GioiTinh = N'${GioiTinh}',
                @SoDienThoai = '${SoDienThoai}',
                @SoNha = N'${SoNha}',
                @Duong = N'${Duong}',
                @Quan = N'${Quan}',
                @ThanhPho = N'${ThanhPho}',
                @NgayVaoLam = '${NgayVaoLam}',
                @NgayNghiViec = NULL
            `);
        res.status(200).json(result.recordset);
            }
            else{
                const result = await pool.request()
                .query(`
                    EXEC sp_UpdateEmployee
                    @MaNhanVien = ${MaNhanVien}, 
                    @HoTen = N'${HoTen}',
                    @NgaySinh = '${NgaySinh}',
                    @GioiTinh = N'${GioiTinh}',
                    @SoDienThoai = '${SoDienThoai}',
                    @SoNha = N'${SoNha}',
                    @Duong = N'${Duong}',
                    @Quan = N'${Quan}',
                    @ThanhPho = N'${ThanhPho}',
                    @NgayVaoLam = '${NgayVaoLam}',
                    @NgayNghiViec = '${NgayNghiViec}'
                `);
            res.status(200).json(result.recordset);
            }
    },
    reassignEmployee: async (req,res) =>{
        const pool = await dbService.connect();
        const {MaNhanVien,MaChiNhanh,BoPhanLamViec,NgayBatDau,NgayKetThuc} = req.body;
        if(!NgayKetThuc){
        const result = await pool.request()
            .query(`
                EXEC sp_ReassignEmployee
                @MaNhanVien = ${MaNhanVien},
                @MaChiNhanh = ${MaChiNhanh},
                @BoPhanLamViec = ${BoPhanLamViec},
                @NgayBatDau = '${NgayBatDau}',
                @NgayKetThuc = NULL
            `);
        res.status(200).json(result.recordset);
        }
        else{
            const result = await pool.request()
            .query(`
                EXEC sp_ReassignEmployee
                @MaNhanVien = ${MaNhanVien},
                @MaChiNhanh = ${MaChiNhanh},
                @BoPhanLamViec = ${BoPhanLamViec},
                @NgayBatDau = '${NgayBatDau}',
                @NgayKetThuc = '${NgayKetThuc}'
            `);
        res.status(200).json(result.recordset);
        }
    }
   
}

module.exports = employeeController;
