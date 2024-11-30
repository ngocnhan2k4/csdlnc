const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const revenueController = {
   
    getRevenue: async (req, res) => {
        const { type } = req.params;
        const pool = await dbService.connect();
        const {MaChiNhanh} = req.body;
        let query = '';
        if (type === 'day') {
            query = `
                SELECT 
                CONVERT(DATE, hd.NgayLap) AS Ngay, 
                SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                FROM HoaDon hd, LichSuLamViec ls
                where hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh}
                GROUP BY CONVERT(DATE, hd.NgayLap)
                ORDER BY Ngay;

            `;
        } else if (type === 'month') {
            query = `
               SELECT 
                YEAR(hd.NgayLap) AS Nam, 
                MONTH(hd.NgayLap) AS Thang, 
                SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
                FROM HoaDon hd, LichSuLamViec ls
                where hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh}
                GROUP BY YEAR(hd.NgayLap), MONTH(hd.NgayLap)
                ORDER BY Nam, Thang;
            `;
        } else if (type === 'year') {
            query = `
               SELECT 
            YEAR(hd.NgayLap) AS Nam, 
            SUM(hd.TongTien - hd.TienGiam) AS DoanhThu 
            FROM HoaDon hd, LichSuLamViec ls
            where hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh}
            GROUP BY YEAR(hd.NgayLap)
            ORDER BY Nam;
            `;
        } else {
            return res.status(400).json({ message: 'Loại thống kê không hợp lệ!' });
        }
        const result = await pool.request().query(query);
        res.status(200).json(result.recordset);
    },
    getDishRevenue : async (req, res) => {
        const {sortType, Date, month, year, type, page, pageSize, MaChiNhanh} = req.body;
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
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
            WHERE CONVERT(DATE, p.NgayLap) = '${Date}' and ls.MaChiNhanh= ${MaChiNhanh}
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
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
            WHERE YEAR(p.NgayLap) = ${year} AND MONTH(p.NgayLap) = ${month} and ls.MaChiNhanh= ${MaChiNhanh}
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
            JOIN PhieuDat p ON c.MaPhieuDat = p.MaPhieuDat JOIN LichSuLamViec ls on ls.MaNhanVien=p.NhanVienLap
            WHERE YEAR(p.NgayLap) = ${year} and ls.MaChiNhanh= ${MaChiNhanh}
            GROUP BY c.MaMonAn, m.TenMonAn
            ORDER BY DoanhThu ${sortType}
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
            `;
        }
        const result = await pool.request().query(query);
        res.status(200).json(result.recordset);
    }
    
}

module.exports = revenueController;