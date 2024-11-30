const dbService = require('../../sevices/dbService.js');

const authController = {
    login: async (req, res) => {
        const pool = await dbService.connect();
        const { SoDienThoai, HoTen } = req.body;
        const result = await pool.request()
            
            .query(`
                SELECT CASE 
                    WHEN COUNT(*) > 0 THEN CAST(1 AS BIT) 
                    ELSE CAST(0 AS BIT) 
                END AS ExistsRecord
                FROM TheKhachHang
                WHERE SoDienThoai = '${SoDienThoai}' AND HoTen = N'${HoTen}';
            `);
            const exists = result.recordset[0]?.ExistsRecord;

            res.status(200).json({
                exists: exists === true, // Trả về true nếu bản ghi tồn tại
            });
    },
    register: async (req, res) => {
        const pool = await dbService.connect();
        const { HoTen, SoDienThoai, Email, CCCD, NgayLap, GioiTinh, NgayDat} = req.body;
        const query = `
        EXEC sp_ThemTheKhachHang
            @HoTen = N'${HoTen}',
            @SoDienThoai = '${SoDienThoai}',
            @Email = '${Email}',
            @CCCD = '${CCCD}',
            @NgayLap = '${NgayLap}',
            @GioiTinh = N'${GioiTinh}',
            @NgayDat = '${NgayDat}',
            @NhanVienLap = 1
    `;

    const result = await pool.request().query(query);
        res.status(200).json({
            message: 'Phiếu đặt bàn đã được tạo thành công.',
            
        });
    },
}

module.exports = authController;
