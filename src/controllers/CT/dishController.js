const dbService = require('../../sevices/dbService.js');
const { removeVietnameseAccents } = require('../../../utils/stringVN.js');


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
        const index = removeVietnameseAccents(req.query.index) || 'Hotpot';
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai 
                From MonAn_KhuVuc makv join MonAn ma on makv.MaMon = ma.MaMonAn
                where makv.MaKhuVuc=${areaID} and ma.Muc COLLATE Latin1_General_CI_AI = '${index}'
                order by ma.MaMonAn
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);

            const totalResult = await pool.request()
                .query(`
                    SELECT COUNT(*) AS total FROM MonAn_KhuVuc makv
                    WHERE makv.MaKhuVuc = ${areaID}
                `);

        const totalItems = totalResult.recordset[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        const nameArea = await pool.request()
            .query(`
                SELECT kv.TenKhuVuc
                FROM KhuVuc kv
                where kv.MaKhuVuc = ${areaID}
            `);
        const type = await pool.request()
            .query(`
                SELECT distinct b.Muc
                FROM MonAn_KhuVuc a join MonAn b on a.MaMon = b.MaMonAn
                where a.MaKhuVuc = ${areaID}

            `);

        res.render("manageFoodArea", {
            layout: "main",
            title: "Food of Area",
            customHead: `
                <link rel="stylesheet" href="/CT/manageFood/manageFoodArea.css">
                <script defer src="/CT/manageFood/manageFoodArea.js"></script>
            `,
            dishes: result.recordset,
            nameArea: nameArea.recordset[0]?.TenKhuVuc || 'Unknown',
            currentPage: page,
            totalPages: totalPages,
            areaID: areaID,
            type: type.recordset,
            currentIndex: index,
        });
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
