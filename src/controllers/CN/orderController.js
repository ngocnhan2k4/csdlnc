const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const orderController = {
   
    getOrderFromBranch: async (req, res) => {
        const pool = await dbService.connect();
        const branchID = req.params.branchID;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select pd.MaPhieuDat, pd.NgayLap, pd.NhanVienLap, pd.Loai
                from PhieuDat pd,LichSuLamViec ls
                where pd.NhanVienLap=ls.MaNhanVien and ls.MaChiNhanh=${branchID}
                order by pd.MaPhieuDat
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    getOrderFromBranchWithType: async (req, res) => {
        const pool = await dbService.connect();
        const branchID = req.params.branchID;
        const {Loai} = req.body;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select pd.MaPhieuDat, pd.NgayLap, pd.NhanVienLap, pd.Loai
                from PhieuDat pd,LichSuLamViec ls
                where pd.NhanVienLap=ls.MaNhanVien and ls.MaChiNhanh=${branchID} and pd.Loai='${Loai}'
                order by pd.MaPhieuDat
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    creatOfflineFood: async (req,res)=>{ 
        const pool = await dbService.connect();
        const { NgayLap, MaChiNhanh, MaBan,NhanVienLap } = req.body;
        const query = `
        EXEC sp_ThemPhieuDatTrucTiep
            @NgayLap = '${NgayLap}',
            @NhanVienLap = ${NhanVienLap},
            @MaChiNhanh = ${MaChiNhanh},
            @MaBan = ${MaBan}
    `;

    const result = await pool.request().query(query);
        res.status(200).json({
            message: 'Phiếu đặt offline đã được tạo thành công.',
            
        });
    },
    createOrderDetail: async (req,res)=>{
        const pool = await dbService.connect();
        const { ChiTiet } = req.body;
        // Lấy MaPhieuDat lớn nhất
        const maxPhieuDatResult = await pool.request().query(`
            SELECT MAX(MaPhieuDat) AS MaPhieuDat FROM PhieuDat
        `);

        const MaPhieuDat = maxPhieuDatResult.recordset[0]?.MaPhieuDat;

        if (!MaPhieuDat) {
            return res.status(404).json({ message: "Không tìm thấy phiếu đặt nào." });
        }

        // Chuẩn bị và thực thi từng câu lệnh INSERT
        const request = pool.request();
        request.input("MaPhieuDat", sql.Int, MaPhieuDat);

        for (const [index, item] of ChiTiet.entries()) {
            const query = `
                INSERT INTO ChiTietPhieuDat (MaPhieuDat, MaMonAn, SoLuong)
                VALUES (@MaPhieuDat, ${item.MaMonAn}, ${item.SoLuong})
            `;
           
            // Thực thi câu truy vấn cho từng bản ghi
            await request.query(query);

            // Xóa tham số cũ trước khi gán giá trị mới
           
        }

        res.status(200).json({
            message: "Thêm chi tiết phiếu đặt thành công.",
            MaPhieuDat,
        });
    },
    createInvoice: async (req, res) => {
        const pool = await dbService.connect();
        const { MaKhachHang, NgayLap } = req.body;
    
        // Lấy MaPhieuDat lớn nhất
        const maxPhieuDatResult = await pool.request().query(`
            SELECT MAX(MaPhieuDat) AS MaPhieuDat FROM PhieuDat
        `);
    
        const MaPhieuDat = maxPhieuDatResult.recordset[0]?.MaPhieuDat;
        if (!MaPhieuDat) {
            return res.status(400).json({ success: false, message: 'Không tìm thấy Phiếu Đặt' });
        }
    
        // Lấy tổng tiền
        const totalResult = await pool.request().query(`
            SELECT 
                SUM(ct.SoLuong * ma.GiaHienTai) AS TongTien
            FROM 
                ChiTietPhieuDat ct
            INNER JOIN 
                MonAn ma ON ct.MaMonAn = ma.MaMonAn
            WHERE 
                ct.MaPhieuDat =${MaPhieuDat}
            GROUP BY 
                ct.MaPhieuDat
        `);
    
        const TongTien = totalResult.recordset[0]?.TongTien;
        if (!TongTien) {
            return res.status(400).json({ success: false, message: 'Không thể tính toán tổng tiền' });
        }
    
        // Lấy thông tin giảm giá
        const tiengiamResult = await pool.request().query(`
            SELECT lt.GiamGia
            FROM TheKhachHang tkh
            JOIN LoaiThe lt ON tkh.LoaiThe = lt.MaThe
            WHERE tkh.MaTheKhachHang = ${MaKhachHang}
        `, );
    
        const tiengiam = tiengiamResult.recordset[0]?.GiamGia || 0; // Nếu không có giảm giá, mặc định là 0
    
        // Tính toán tiền giảm và tạo hóa đơn
        const TienGiam = (tiengiam * TongTien) / 100;
    
        const result = await pool.request().query(`
            INSERT INTO HoaDon (MaKhachHang, TongTien, NgayLap, MaPhieuDat, TienGiam, NhanVienLap)
            VALUES (${MaKhachHang}, ${TongTien}, '${NgayLap}', ${MaPhieuDat}, ${TienGiam}, 1)
        `, );
    
        res.status(200).json({
            success: true,
            message: 'Tạo hóa đơn thành công',
            data: result
        });
    },
    createDG : async (req, res) => {
        try {
            const pool = await dbService.connect();
            const maxHoaDonResult = await pool.request().query(`
                SELECT MAX(MaHoaDon) AS MaHoaDon FROM HoaDon
            `);
        
            const MaHoaDon = maxHoaDonResult.recordset[0]?.MaHoaDon;
            const {DiemPhucVu, DiemViTri, DiemChatLuongMonAn, DiemGiaCa, DiemKhongGian,BinhLuan} = req.body;
            const result = await pool.request().query(`INSERT INTO DanhGiaDichVu(MaHoaDon, DiemPhucVu, DiemViTri, DiemChatLuongMonAn,DiemGiaCa,DiemKhongGian,BinhLuan) VALUES
                                                     (${MaHoaDon}, ${DiemPhucVu}, ${DiemViTri}, ${DiemChatLuongMonAn},${DiemGiaCa},${DiemKhongGian},N'${BinhLuan}')`);
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

    deleteOfflineOrder: async (req, res) => {
        try {
            const MaPhieuDat  = req.params.MaPhieuDat;
            const pool = await dbService.connect();
            await pool.request().query(`DELETE FROM PhieuDatTrucTiep WHERE MaPhieuDatTrucTiep = ${MaPhieuDat};
                                        DELETE FROM PhieuDat WHERE MaPhieuDat = ${MaPhieuDat};`);
            res.status(200).json({
                success: true,
                message: 'Order deleted successfully',
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
    

  
    
    
}

module.exports = orderController;
