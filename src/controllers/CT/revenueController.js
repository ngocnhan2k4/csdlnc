const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const revenueController = {

   
    renderRevenueByType: async (req, res) => {
        const { type } = req.params;
        const pool = await dbService.connect();
        let query = '';
        let revenueData = [];

        try {
            // Xác định loại thống kê và tạo câu lệnh SQL
            if (type === 'day') {
                query = `
                    SELECT 
                    CONVERT(DATE, hd.NgayLap) AS Ngay, 
                    SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                    FROM HoaDon hd
                    GROUP BY CONVERT(DATE, hd.NgayLap)
                    ORDER BY Ngay;
                `;
            } else if (type === 'month') {
                query = `
                   SELECT 
                    YEAR(hd.NgayLap) AS Nam, 
                    MONTH(hd.NgayLap) AS Thang, 
                    SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                    FROM HoaDon hd
                    GROUP BY YEAR(hd.NgayLap), MONTH(hd.NgayLap)
                    ORDER BY Nam, Thang;
                `;
            } else if (type === 'year') {
                query = `
                   SELECT 
                YEAR(hd.NgayLap) AS Nam, 
                SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                FROM HoaDon hd
                GROUP BY YEAR(hd.NgayLap)
                ORDER BY Nam;
                `;
            } else {
                return res.status(400).render("viewRevenueCompany", {
                    layout: "main",
                    title: "RevenueCompany",
                    errorMessage: "Loại thống kê không hợp lệ!",
                    revenue: [],
                    selectedType: type,
                    customHead: `
                      <link rel="stylesheet" href="/CT/viewRevenue/viewRevenueCompany.css">
                      <script defer src="/CT/viewRevenue/viewRevenueCompany.js"></script>`,
                });
            }

            // Thực thi truy vấn
            const result = await pool.request().query(query);
            revenueData = result.recordset;

            // Render trang cùng với dữ liệu doanh thu
            res.render("viewRevenueCompany", {
                layout: "main",
                title: "RevenueCompany",
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

    getDishRevenue : async (req, res) => {
        const {sortType = "ASC", Date = "2024-01-07", month = 1, year = 2024, type = "year", page = 1, pageSize = 10} = req.query;
        const offset = (page - 1) * pageSize;
        const pool = await dbService.connect();
        let query = '';
        if(type==='day'){
            query = `
            SELECT 
            m.TenMonAn,
            c.MaMonAn,
            SUM(m.GiaHienTai*c.SoLuong) AS DoanhThu,
            SUM(c.SoLuong) AS SoLuong
            FROM ChiTietPhieuDat c
            JOIN MonAn m ON c.MaMonAn = m.MaMonAn
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat 
            WHERE CONVERT(DATE, p.NgayLap) = '${Date}' 
            GROUP BY c.MaMonAn, m.TenMonAn
            ORDER BY DoanhThu ${sortType}
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
            `;
        }
        else if(type ==='month')
        {
            query = `
            SELECT 
            m.TenMonAn,
            c.MaMonAn,
            SUM(m.GiaHienTai*c.SoLuong) AS DoanhThu,
            SUM(c.SoLuong) AS SoLuong
            FROM ChiTietPhieuDat c
            JOIN MonAn m ON c.MaMonAn = m.MaMonAn
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat 
            WHERE YEAR(p.NgayLap) = ${year} AND MONTH(p.NgayLap) = ${month}
            GROUP BY c.MaMonAn, m.TenMonAn
            ORDER BY DoanhThu ${sortType}
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
            `;
        }
        else if(type ==='year'){
            query = `
            SELECT 
            m.TenMonAn,
            c.MaMonAn,
            SUM(m.GiaHienTai*c.SoLuong) AS DoanhThu,
            SUM(c.SoLuong) AS SoLuong
            FROM ChiTietPhieuDat c
            JOIN MonAn m ON c.MaMonAn = m.MaMonAn
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat
            WHERE YEAR(p.NgayLap) = ${year}
            GROUP BY c.MaMonAn, m.TenMonAn
            ORDER BY DoanhThu ${sortType}
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
            `;
        }
        const result = await pool.request().query(query);
        dishesData = result.recordset;
        res.render("viewDishRevenue", {
            layout: "main",
            title: "RevenueDish",
            dishes: dishesData,
            customHead: `
                <link rel="stylesheet" href="/CT/viewRevenue/viewRevenueDish.css">
                <script defer src="/CT/viewRevenue/viewRevenueDish.js"></script>`,
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
        res.render("viewRevenue", {
            layout: "main",
            title: "Revenue",
            customHead: `
              <link rel="stylesheet" href="/CT/viewRevenue/viewRevenue.css">
              <script defer src="/CT/viewRevenue/viewRevenue.js"></script>`,
    })
    }
}

module.exports = revenueController;