const dbService = require('../../sevices/dbService.js');

const authController = {
    login: async (req, res) => {
        const pool = await dbService.connect();
        const { TenChiNhanh, SoDienThoai } = req.body;
        const result = await pool.request()
            
            .query(`
                SELECT CASE 
                    WHEN COUNT(*) > 0 THEN CAST(1 AS BIT) 
                    ELSE CAST(0 AS BIT) 
                END AS ExistsRecord
                FROM ChiNhanh
                WHERE SoDienThoai = '${SoDienThoai}' AND TenChiNhanh = N'${TenChiNhanh}';
            `);
            const exists = result.recordset[0]?.ExistsRecord;

            res.status(200).json({
                exists: exists === true, // Trả về true nếu bản ghi tồn tại
            });
    },
    getDishFromBranch: async (req, res) => {
        const pool = await dbService.connect();
        const branchID = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai 
                From MonAn_KhuVuc makv, ChiNhanh cn, MonAn ma
                where makv.MaKhuVuc= cn.KhuVuc and makv.MaMon = ma.MaMonAn and cn.MaChiNhanh=${branchID}
                order by ma.MaMonAn
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    
}

module.exports = authController;
