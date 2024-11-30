const dbService = require('../../sevices/dbService.js');

const dishController = {
   
    getDishFromBranch: async (req, res) => {
        const pool = await dbService.connect();
        const branchID = req.params.branchID;
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
    updateState: async (req, res) => {
        const pool = await dbService.connect();
        const {MaMon, MaChiNhanh, TinhTrangPhucVu} = req.body;
       
        const result = await pool.request()
            .query(`
                UPDATE TinhTrangMonAn
                SET TinhTrangPhucVu = N'${TinhTrangPhucVu}'
                WHERE MaMon = ${MaMon} AND MaChiNhanh = ${MaChiNhanh};
            `);
        res.status(200).json(result.rowsAffected);
    },

    searchDish : async (req, res) => {
        const pool = await dbService.connect();
        const {MaChiNhanh, TuKhoa} = req.body;
        const result = await pool.request()
            .query(`
                SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai 
                From MonAn_KhuVuc makv, ChiNhanh cn, MonAn ma
                where makv.MaKhuVuc= cn.KhuVuc and makv.MaMon = ma.MaMonAn and cn.MaChiNhanh=${MaChiNhanh} and ma.TenMonAn like N'%${TuKhoa}%'
            `);
        res.status(200).json(result.recordset);
    },
    
}

module.exports = dishController;
