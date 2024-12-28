const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const revenueController = {

   
    renderRevenueByType: async (req, res) => {
        const { type } = req.params;
        const MaChiNhanh = parseInt(req.query.branch) || 0;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const limit = 10;
        const offset = (page - 1) * limit;
        const pool = await dbService.connect();
        let query = '';
        let countQuery = '';
        let revenueData = [];

        try {
            // Xác định loại thống kê và tạo câu lệnh SQL
            if (type === 'day') {
                query = `
                    SELECT 
                    CONVERT(DATE, hd.NgayLap) AS Ngay, 
                    SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                    FROM HoaDon hd, LichSuLamViec ls
                    WHERE (${MaChiNhanh} = 0)
                    OR (hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh})
                    GROUP BY CONVERT(DATE, hd.NgayLap)
                    ORDER BY Ngay
                    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
                `;
                countQuery = `
                    SELECT
                    COUNT(DISTINCT CONVERT(DATE, hd.NgayLap)) AS TotalCount
                    FROM HoaDon hd, LichSuLamViec ls
                    WHERE (${MaChiNhanh} = 0)
                    OR (hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh});
                `;
            } 
            if (type === 'month') {
                query = `
                    SELECT 
                    YEAR(hd.NgayLap) AS Nam, 
                    MONTH(hd.NgayLap) AS Thang, 
                    SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                    FROM HoaDon hd, LichSuLamViec ls
                    WHERE (${MaChiNhanh} = 0)
                    OR (hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh})
                    GROUP BY YEAR(hd.NgayLap), MONTH(hd.NgayLap)
                    ORDER BY Nam, Thang
                    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
                `;
                countQuery = `
                    SELECT
                    COUNT(DISTINCT CONCAT(YEAR(hd.NgayLap), '-', MONTH(hd.NgayLap))) AS TotalCount
                    FROM HoaDon hd, LichSuLamViec ls
                    WHERE (${MaChiNhanh} = 0)
                    OR (hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh});
                `;
            }
            if (type === 'year') {
                query = `
                    SELECT 
                    YEAR(hd.NgayLap) AS Nam, 
                    SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                    FROM HoaDon hd, LichSuLamViec ls
                    WHERE (${MaChiNhanh} = 0)
                    OR (hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh})
                    GROUP BY YEAR(hd.NgayLap)
                    ORDER BY Nam
                    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
                `;
                countQuery = `
                    SELECT
                    COUNT(DISTINCT YEAR(hd.NgayLap)) AS TotalCount
                    FROM HoaDon hd, LichSuLamViec ls
                    WHERE (${MaChiNhanh} = 0)
                    OR (hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh});
                `;
            } 

            // Thực thi truy vấn
            const result = await pool.request().query(query);
            revenueData = result.recordset;
            // Tính toán thông tin phân trang
            const countResult = await pool.request().query(countQuery);
            const totalRecords = countResult.recordset[0].TotalCount;
            const totalPages = Math.ceil(totalRecords / limit);
            const min = limit * (page - 1) + 1;
            const max = limit * page;
            let previous = page;
            let nextPage = page;

            if (page > 1) {
                previous = page - 1;
            }
            if (page < totalPages) {
                nextPage = page + 1;
            }

            // Render trang cùng với dữ liệu doanh thu
            res.render("viewRevenueCompany", {
                type,
                currentPage: page,
                totalPages: totalPages,
                totalRecords: totalRecords,
                min: min,
                max: max,
                nextPage: nextPage,
                previous: previous,
                layout: "main",
                title: "RevenueCompany",
                branch: MaChiNhanh,
                revenue: revenueData,
                selectedType: type,
                customHead: `
                  <link rel="stylesheet" href="/CT/viewRevenue/viewRevenueCompany.css">
                  <script defer src="/CT/viewRevenue/viewRevenueCompany.js"></script>`,
            });
        } catch (error) {
            console.error(error);
            res.status(500).render("viewRevenueCompany", {
                layout: "main",
                title: "RevenueCompany",
                errorMessage: "Lỗi khi lấy dữ liệu doanh thu!",
                revenue: [],
                selectedType: type,
                customHead: `
                  <link rel="stylesheet" href="/CT/viewRevenue/viewRevenueCompany.css">
                  <script defer src="/CT/viewRevenue/viewRevenueCompany.js"></script>`,
            });
        }
    },

    getDishRevenue: async (req, res) => {
        const { sortType = "ASC", Date = "2024-01-07", month = 1, year = 2024} = req.query;
        const MaChiNhanh = parseInt(req.query.branch) || 0;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const type = req.params.type;
        const limit = 10;
        const offset = (page - 1) * limit;
        const pool = await dbService.connect();
        let query = '';
        let countQuery = '';
        
        if (type === 'day') {
            query = `
        SELECT 
        m.TenMonAn,
        c.MaMonAn,
        SUM(m.GiaHienTai*c.SoLuong) AS DoanhThu,
        SUM(c.SoLuong) AS SoLuong
        FROM ChiTietPhieuDat c
        JOIN MonAn m ON c.MaMonAn = m.MaMonAn
        JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
        WHERE
        (${MaChiNhanh} = 0 AND CONVERT(DATE, p.NgayLap) = '${Date}')
        OR
        (CONVERT(DATE, p.NgayLap) = '${Date}' AND ls.MaChiNhanh = ${MaChiNhanh})
        GROUP BY c.MaMonAn, m.TenMonAn
        ORDER BY DoanhThu ${sortType}
        OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
    `;
            countQuery = `
        SELECT 
        COUNT(*) AS TotalCount
        FROM (
            SELECT c.MaMonAn
            FROM ChiTietPhieuDat c
            JOIN MonAn m ON c.MaMonAn = m.MaMonAn
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat  JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
            WHERE
            (${MaChiNhanh} = 0 AND CONVERT(DATE, p.NgayLap) = '${Date}')
            OR
            (CONVERT(DATE, p.NgayLap) = '${Date}' AND ls.MaChiNhanh = ${MaChiNhanh})
            GROUP BY c.MaMonAn, m.TenMonAn
        ) AS CountTable;
    `;
        } else if (type === 'month') {
            query = `
        SELECT 
        m.TenMonAn,
        c.MaMonAn,
        SUM(m.GiaHienTai*c.SoLuong) AS DoanhThu,
        SUM(c.SoLuong) AS SoLuong
        FROM ChiTietPhieuDat c
        JOIN MonAn m ON c.MaMonAn = m.MaMonAn
        JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat  JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
        WHERE
        (${MaChiNhanh} = 0 AND YEAR(p.NgayLap) = ${year} AND MONTH(p.NgayLap) = ${month})
        OR
        (YEAR(p.NgayLap) = ${year} AND MONTH(p.NgayLap) = ${month} AND ls.MaChiNhanh = ${MaChiNhanh})
        GROUP BY c.MaMonAn, m.TenMonAn
        ORDER BY DoanhThu ${sortType}
        OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
    `;
            countQuery = `
        SELECT 
        COUNT(*) AS TotalCount
        FROM (
            SELECT c.MaMonAn
            FROM ChiTietPhieuDat c
            JOIN MonAn m ON c.MaMonAn = m.MaMonAn
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat  JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
            WHERE
            (${MaChiNhanh} = 0 AND YEAR(p.NgayLap) = ${year} AND MONTH(p.NgayLap) = ${month})
            OR
            (YEAR(p.NgayLap) = ${year} AND MONTH(p.NgayLap) = ${month} AND ls.MaChiNhanh = ${MaChiNhanh})
            GROUP BY c.MaMonAn, m.TenMonAn
        ) AS CountTable;
    `;
        } else if (type === 'year') {
            query = `
        SELECT 
        m.TenMonAn,
        c.MaMonAn,
        SUM(m.GiaHienTai*c.SoLuong) AS DoanhThu,
        SUM(c.SoLuong) AS SoLuong
        FROM ChiTietPhieuDat c
        JOIN MonAn m ON c.MaMonAn = m.MaMonAn
        JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat  JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
        WHERE
        (${MaChiNhanh} = 0 AND YEAR(p.NgayLap) = ${year})
        OR
        (YEAR(p.NgayLap) = ${year} AND ls.MaChiNhanh = ${MaChiNhanh})
        GROUP BY c.MaMonAn, m.TenMonAn
        ORDER BY DoanhThu ${sortType}
        OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
    `;
            countQuery = `
        SELECT 
        COUNT(*) AS TotalCount
        FROM (
            SELECT c.MaMonAn
            FROM ChiTietPhieuDat c
            JOIN MonAn m ON c.MaMonAn = m.MaMonAn
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat  JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
            WHERE
            (${MaChiNhanh} = 0 AND YEAR(p.NgayLap) = ${year})
            OR
            (YEAR(p.NgayLap) = ${year} AND ls.MaChiNhanh = ${MaChiNhanh})
            GROUP BY c.MaMonAn, m.TenMonAn
        ) AS CountTable;
    `;  }else {
            return res.status(400).send('Invalid type parameter');
        }

        try {
            // Execute the SQL query
            const result = await pool.request().query(query);
            const dishesData = result.recordset;

            // Render or respond with JSON
            const acceptsJSON = req.headers['accept']?.includes('application/json');
            if (acceptsJSON) {
                return res.status(200).json(dishesData);
            }

            const countResult = await pool.request().query(countQuery);
            const totalDishes = countResult.recordset[0].TotalCount;
            const totalPages = Math.ceil(totalDishes / limit);
            const min = limit * (page - 1) + 1;
            const max = limit * page;
            let previous = page;
            let nextPage = page;

            if (page > 1) {
                previous = page - 1;
            }
            if (page < totalPages) {
                nextPage = page + 1;
            }
            
            // Render the Handlebars view
            res.render('dishRevenue', {
                type,
                Date: Date,
                month: month,
                year: year,
                data: dishesData,
                sortType: sortType,
                currentPage: page,
                totalPages: totalPages,
                totalDishes: totalDishes,
                min: min,
                max: max,
                nextPage: nextPage,
                previous: previous,
                branch: MaChiNhanh,
                filters: { sortType, Date, month, year },
                layout: 'main',
                title: 'Dish Revenue',
                customHead: `
                    <link rel="stylesheet" href="/CT/viewRevenue/DishRevenue.css">`               
            });
        } catch (err) {
            console.error('Error fetching dish revenue:', err);
            res.status(500).send('Internal Server Error');
        }
    },


    renderDishRevenue : async (req, res) => {
        query = `SELECT ChiNhanh.MaChiNhanh, ChiNhanh.TenChiNhanh 
                FROM ChiNhanh`;
        
        const pool = await dbService.connect();
        const result = await pool.request().query(query);
        const branches = result.recordset;
        res.render("viewDishRevenue", {
            layout: "main",
            title: "RevenueDish",
            customHead: `
                <link rel="stylesheet" href="/CT/viewRevenue/viewDishRevenue.css">
                <script defer src="/CT/viewRevenue/viewDishRevenue.js"></script>`,
            branches: branches,
        });
    },


    
    getAverageEvalu : async (req, res) => {
        const type = req.params.type;
        const pool = await dbService.connect();
        let query = '';
        if(type==='day'){
            query = `
            SELECT 
            CN.TenChiNhanh,
            CONVERT(DATE, HD.NgayLap) AS Ngay,
            AVG(DG.DiemPhucVu) AS DiemPhucVuTB,
            AVG(DG.DiemViTri) AS DiemViTriTB,
            AVG(DG.DiemChatLuongMonAn) AS DiemChatLuongMonAnTB,
            AVG(DG.DiemGiaCa) AS DiemGiaCaTB,
            AVG(DG.DiemKhongGian) AS DiemKhongGianTB
        FROM 
            DanhGiaDichVu DG
        INNER JOIN 
            HoaDon HD ON DG.MaHoaDon = HD.MaHoaDon
        INNER JOIN 
            LichSuLamViec LS ON LS.MaNhanVien = HD.NhanVienLap
        INNER JOIN 
            ChiNhanh CN ON CN.MaChiNhanh = LS.MaChiNhanh
        GROUP BY 
            CN.TenChiNhanh, CONVERT(DATE, HD.NgayLap)
        ORDER BY 
            CN.TenChiNhanh, Ngay;
            `;
        }
        else if(type ==='month'){
            query = `
            SELECT 
            CN.TenChiNhanh,
            YEAR(HD.NgayLap) AS Nam,
            MONTH(HD.NgayLap) AS Thang,
            AVG(DG.DiemPhucVu) AS DiemPhucVuTB,
            AVG(DG.DiemViTri) AS DiemViTriTB,
            AVG(DG.DiemChatLuongMonAn) AS DiemChatLuongMonAnTB,
            AVG(DG.DiemGiaCa) AS DiemGiaCaTB,
            AVG(DG.DiemKhongGian) AS DiemKhongGianTB
        FROM 
            DanhGiaDichVu DG
        INNER JOIN 
            HoaDon HD ON DG.MaHoaDon = HD.MaHoaDon
        INNER JOIN 
            LichSuLamViec LS ON LS.MaNhanVien = HD.NhanVienLap
        INNER JOIN 
            ChiNhanh CN ON CN.MaChiNhanh = LS.MaChiNhanh
        GROUP BY 
            CN.TenChiNhanh, YEAR(HD.NgayLap), MONTH(HD.NgayLap)
        ORDER BY 
            CN.TenChiNhanh, Nam, Thang;
            `
        }
        else if(type ==='year'){
            query = `
            SELECT 
            CN.TenChiNhanh,
            YEAR(HD.NgayLap) AS Nam,
            AVG(DG.DiemPhucVu) AS DiemPhucVuTB,
            AVG(DG.DiemViTri) AS DiemViTriTB,
            AVG(DG.DiemChatLuongMonAn) AS DiemChatLuongMonAnTB,
            AVG(DG.DiemGiaCa) AS DiemGiaCaTB,
            AVG(DG.DiemKhongGian) AS DiemKhongGianTB
        FROM 
            DanhGiaDichVu DG
        INNER JOIN 
            HoaDon HD ON DG.MaHoaDon = HD.MaHoaDon
        INNER JOIN 
            LichSuLamViec LS ON LS.MaNhanVien = HD.NhanVienLap
        INNER JOIN 
            ChiNhanh CN ON CN.MaChiNhanh = LS.MaChiNhanh
        GROUP BY 
            CN.TenChiNhanh, YEAR(HD.NgayLap)
        ORDER BY 
            CN.TenChiNhanh, Nam;
    `
        }
        const result = await pool.request().query(query);
        res.status(200).json(result.recordset);
    },
    
    renderRevenue : async (req, res) => {
        query = `SELECT ChiNhanh.MaChiNhanh, ChiNhanh.TenChiNhanh 
                FROM ChiNhanh`;

        const pool = await dbService.connect();
        const result = await pool.request().query(query);
        const branches = result.recordset;

        res.render("viewRevenue", {
            layout: "main",
            title: "Revenue",
            customHead: `
              <link rel="stylesheet" href="/CT/viewRevenue/viewRevenue.css">
              <script defer src="/CT/viewRevenue/viewRevenue.js"></script>`,
            branches: branches,
    })
    }
}

module.exports = revenueController;