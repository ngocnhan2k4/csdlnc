const dbService = require('../../sevices/dbService.js');

const historyController ={
    getDetailInvoice : async (req, res) => {
        try {
            const pool = await dbService.connect();
            const id = req.params.orderID;
            const result = await pool.request().query(`SELECT ma.TenMonAn, ctpd.SoLuong
                                                       FROM HoaDon hd, PhieuDat pd, ChiTietPhieuDat ctpd, MonAn ma
                                                       where hd.MaPhieuDat = pd.MaPhieuDat and pd.MaPhieuDat = ctpd.MaPhieuDat and hd.MaHoaDon = ${id}and ctpd.MaMonAn=ma.MaMonAn`); 
            res.status(200).json({

                data: result.recordset,
            });
            
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).json({
                success: false,
                message: 'Database query failed',
                error: error.message,
            });
        }
    },
    createDG : async (req, res) => {
        try {
            const pool = await dbService.connect();
            const id = req.params.orderID;
            const {DiemPhucVu, DiemViTri, DiemChatLuongMonAn, DiemGiaCa, DiemKhongGian,BinhLuan} = req.body;
            const result = await pool.request().query(`INSERT INTO DanhGiaDichVu(MaHoaDon, DiemPhucVu, DiemViTri, DiemChatLuongMonAn,DiemGiaCa,DiemKhongGian,BinhLuan) VALUES
                                                     (${id}, ${DiemPhucVu}, ${DiemViTri}, ${DiemChatLuongMonAn},${DiemGiaCa},${DiemKhongGian},N'${BinhLuan}')`);
            res.status(200).json({
                success: true,
                message: 'Create success',
            });
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).json({
                success: false,
                message: 'Database query failed',
                error: error.message,
            });
        }
    },
    getAllInoice: async (req, res) => {
        const pool = await dbService.connect();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request().query(`
                SELECT 
                    hd.MaHoaDon,
                    hd.NgayLap,
                    hd.TongTien,
                    hd.TienGiam,
                    hd.MaPhieuDat,
                    pd.Loai AS LoaiPhieuDat,
                    pdgh.TrangThai AS TinhTrangDonHang
                FROM 
                    HoaDon hd
                LEFT JOIN PhieuDat pd ON hd.MaPhieuDat = pd.MaPhieuDat
                LEFT JOIN PhieuDatGiaoHang pdgh ON pd.MaPhieuDat = pdgh.MaPhieuDatGiaoHang
                ORDER BY 
                    hd.NgayLap DESC
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json({
            data: result.recordset,
        });
    },
}

module.exports = historyController;
