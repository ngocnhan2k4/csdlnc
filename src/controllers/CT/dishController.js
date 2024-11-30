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
    getDishFromArea: async (req, res) => {
        const pool = await dbService.connect();
        const areaID = req.params.areaID;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai 
                From MonAn_KhuVuc makv, MonAn ma
                where makv.MaMon = ma.MaMonAn and makv.MaKhuVuc=${areaID}
                order by ma.MaMonAn
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
   

    searchDish : async (req, res) => {
        const pool = await dbService.connect();
        const {TuKhoa} = req.body;
        const result = await pool.request()
            .query(`
                SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai 
                From MonAn ma
                where ma.TenMonAn like N'%${TuKhoa}%'
            `);
        res.status(200).json(result.recordset);
    },

    createDish: async (req,res) =>{
        const pool = await dbService.connect();
        const {TenMonAn,Muc,MoTa,HinhAnh,GiaHienTai} = req.body;
        const result = await pool.request()
            .query(`
                EXEC sp_AddDish @TenMonAn = N'${TenMonAn}', @GiaHienTai = ${GiaHienTai}, @Muc = N'${Muc}', @MoTa = N'${MoTa}', @HinhAnh = N'${HinhAnh}'
            `);
        res.status(200).json(result.recordset);
    },
    deleteDish : async (req,res) =>{
        const pool = await dbService.connect();
        const {MaMonAn} = req.body;
        const result = await pool.request()
            .query(`
                EXEC sp_DeleteDish @MaMonAn = ${MaMonAn}
            `);
        res.status(200).json(result.recordset);
    },
    updateDish : async (req,res) =>{
        const pool = await dbService.connect();
        const {MaMonAn,TenMon,Muc,MoTa,HinhAnh,GiaHienTai} = req.body;
        const result = await pool.request()
            .query(`
                EXEC sp_UpdateDish @MaMonAn = ${MaMonAn}, @TenMon = N'${TenMon}', @GiaHienTai = ${GiaHienTai}, @Muc = N'${Muc}', @MoTa = N'${MoTa}', @HinhAnh = N'${HinhAnh}'
            `);
        res.status(200).json(result.recordset);
    }
    
}
module.exports = dishController;
