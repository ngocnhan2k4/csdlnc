const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const employeeController = {
   
    getAllEmployeeFromBranch: async (req, res) => {
        const pool = await dbService.connect();
        const branchID = req.params.branchID;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select nv.MaNhanVien,nv.HoTen,nv.GioiTinh,nv.SoDienThoai,nv.SoNha,nv.Duong,nv.Quan,nv.ThanhPho,nv.NgayVaoLam,nv.NgayNghiViec,nv.NgaySinh
                from  NhanVien nv,LichSuLamViec ls
                where nv.MaNhanVien = ls.MaNhanVien and ls.MaChiNhanh=${branchID}
                order by nv.MaNhanVien
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    searchEmployee : async (req, res) => {
        const pool = await dbService.connect();
        const {MaChiNhanh, TuKhoa} = req.body;
        const result = await pool.request()
            .query(`
                SELECT nv.HoTen
                FROM NhanVien nv, LichSuLamViec ls
                where nv.MaNhanVien=ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh} and nv.HoTen like N'%${TuKhoa}%'
            `);
        res.status(200).json(result.recordset);
    },
    getEmployeesByRole: async (req, res) => {
        const pool = await dbService.connect();
        const {MaChiNhanh, BoPhanLamViec} = req.body;
        const result = await pool.request()
            .query(`
                select nv.MaNhanVien,nv.HoTen,nv.GioiTinh,nv.SoDienThoai,nv.SoNha,nv.Duong,nv.Quan,nv.ThanhPho,nv.NgayVaoLam,nv.NgayNghiViec,nv.NgaySinh
                from  NhanVien nv,LichSuLamViec ls
                where nv.MaNhanVien = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh} and ls.BoPhanLamViec =${BoPhanLamViec}
                
            `);
        res.status(200).json(result.recordset);
   },
}

module.exports = employeeController;
