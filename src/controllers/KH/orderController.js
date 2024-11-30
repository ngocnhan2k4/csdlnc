const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');


const orderController ={
    getDeliveryFood : async (req, res) => {
        try {
            const pool = await dbService.connect();
            const {MaKhuVuc, sortBy} = req.body;
            let sortQuery = '';
        switch (sortBy) {
            case 'alphabet':
                sortQuery = `ORDER BY ma.TenMonAn `;  
                break;
            case 'price':
                sortQuery = `ORDER BY ma.GiaHienTai`;  
                break;
            
            default:
                sortQuery = ''; 
                break;
        }
            const result = await pool.request().query(`select  ma.MaMonAn,ma.TenMonAn, ma.GiaHienTai,ma.MoTa,ma.Muc,ma.HinhAnh
                                                        from MonAn ma, TinhTrangMonAn tt, MonAn_KhuVuc makv
                                                        where ma.MaMonAn=tt.MaMon and tt.TinhTrangGiaoHang =N'Có giao hàng' and ma.MaMonAn=makv.MaMon and makv.MaKhuVuc=${MaKhuVuc}
                                                        Group by ma.MaMonAn,ma.TenMonAn, ma.GiaHienTai,ma.MoTa,ma.Muc,ma.HinhAnh
                                                        ${sortQuery}`); 
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
    creatDeliveryFood: async (req,res)=>{ //mặc định nhânvienlập là 1
        const pool = await dbService.connect();
        const { NgayLap, ThoiGianGiao, DiaChi, SoDienThoai, TrangThai } = req.body;
        const query = `
        EXEC sp_ThemPhieuDatGiaoHang
            @NgayLap = '${NgayLap}',
            @NhanVienLap = 1,
            @ThoiGianGiao = '${ThoiGianGiao}',
            @DiaChi = N'${DiaChi}',
            @SoDienThoai = '${SoDienThoai}',
            @TrangThai = N'${TrangThai}'
    `;

    const result = await pool.request().query(query);
        res.status(200).json({
            message: 'Phiếu đặt giao hàng đã được tạo thành công.',
            
        });
    },

    getArea: async (req, res) => {
        try {
            const pool = await dbService.connect();
            const result = await pool.request().query(`select * from KhuVuc`); 
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
    getBranchFromArea: async (req, res) => {
        try {
            const pool = await dbService.connect();
            const {MaKhuVuc} = req.body;
            const result = await pool.request().query(`select * from ChiNhanh where KhuVuc = ${MaKhuVuc}`); 
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

    getOnlineFood : async (req, res) => {
        try {
            const pool = await dbService.connect();
            const {MaKhuVuc, sortBy} = req.body;
            let sortQuery = '';
        switch (sortBy) {
            case 'alphabet':
                sortQuery = `ORDER BY ma.TenMonAn `;  
                break;
            case 'price':
                sortQuery = `ORDER BY ma.GiaHienTai`;  
                break;
            
            default:
                sortQuery = ''; 
                break;
        }
            const result = await pool.request().query(`select  ma.MaMonAn,ma.TenMonAn, ma.GiaHienTai,ma.MoTa,ma.Muc,ma.HinhAnh
                                                        from MonAn ma, TinhTrangMonAn tt, MonAn_KhuVuc makv
                                                        where ma.MaMonAn=tt.MaMon and tt.TinhTrangPhucVu =N'Có phục vụ' and ma.MaMonAn=makv.MaMon and makv.MaKhuVuc=${MaKhuVuc}
                                                        Group by ma.MaMonAn,ma.TenMonAn, ma.GiaHienTai,ma.MoTa,ma.Muc,ma.HinhAnh
                                                        ${sortQuery}`); 
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
    creatOnlineFood: async (req,res)=>{ //mặc định nhânvienlập là 1
        const pool = await dbService.connect();
        const { NgayLap, MaChiNhanh, SoLuongKhach, NgayDat, GioDen, GhiChu, MaBan} = req.body;
        const query = `
        EXEC sp_ThemPhieuDatOnline
            @NgayLap = '${NgayLap}',
            @NhanVienLap = 1,
            @MaChiNhanh = ${MaChiNhanh},
            @SoLuongKhach = ${SoLuongKhach},
            @NgayDat = '${NgayDat}',
            @GioDen = '${GioDen}',
            @GhiChu = N'${GhiChu}',
            @MaBan = ${MaBan}
    `;

    const result = await pool.request().query(query);
        res.status(200).json({
            message: 'Phiếu đặt bàn đã được tạo thành công.',
            
        });
    },

    getFreeTableOfBranch: async (req, res) => {
        const pool = await dbService.connect();
        const { MaChiNhanh} = req.body;
        const result = await pool.request().query(`select STT from BanAn where MaChiNhanh=${MaChiNhanh} and TrangThai=N'Trống'`);
        res.status(200).json({
            data: result.recordset,
        });
    },
    
    
    
}

module.exports = orderController;