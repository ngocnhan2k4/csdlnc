const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const orderController = {
   
    getAllOrder: async (req, res) => {
        const pool = await dbService.connect();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select hd.MaHoaDon, hd.MaKhachHang, hd.MaPhieuDat, hd.NgayLap,hd.NhanVienLap,hd.TienGiam, hd.TongTien
                from PhieuDat pd, HoaDon hd
                where hd.MaPhieuDat=pd.MaPhieuDat
                order by hd.MaHoaDon
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    getAllOrderByType: async (req, res) => {
        const pool = await dbService.connect();
        const Loai = req.params.Loai;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select hd.MaHoaDon, hd.MaKhachHang, hd.MaPhieuDat, hd.NgayLap,hd.NhanVienLap,hd.TienGiam, hd.TongTien
                from PhieuDat pd, HoaDon hd
                where hd.MaPhieuDat=pd.MaPhieuDat and pd.Loai='${Loai}'
                order by hd.MaHoaDon
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    getEvaluation: async (req, res) => {
        const pool = await dbService.connect();
        const MaHoaDon = req.params.MaHoaDon;
        const result = await pool.request()
            .query(`
                select * from DanhGiaDichVu where MaHoaDon=${MaHoaDon};
            `);
        res.status(200).json(result.recordset);
    },
    getAllOrderByBranch: async (req, res) => {
        const pool = await dbService.connect();
        const MaChiNhanh = req.params.MaChiNhanh;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select hd.MaHoaDon, hd.MaKhachHang, hd.MaPhieuDat, hd.NgayLap,hd.NhanVienLap,hd.TienGiam, hd.TongTien
                from  HoaDon hd, LichSuLamViec ls
                where hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh}
                order by hd.MaHoaDon
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },

  
    
    
}

module.exports = orderController;