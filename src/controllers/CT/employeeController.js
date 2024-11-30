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
    getAllEmployee: async (req, res) => {
        const pool = await dbService.connect();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select nv.MaNhanVien,nv.HoTen,nv.GioiTinh,nv.SoDienThoai,nv.SoNha,nv.Duong,nv.Quan,nv.ThanhPho,nv.NgayVaoLam,nv.NgayNghiViec,nv.NgaySinh
                from  NhanVien nv
                order by nv.MaNhanVien
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
    searchEmployee : async (req, res) => {
        const pool = await dbService.connect();
        const { TuKhoa} = req.body;
        const result = await pool.request()
            .query(`
                SELECT nv.HoTen
                FROM NhanVien nv
                where nv.HoTen like N'%${TuKhoa}%'
            `);
        res.status(200).json(result.recordset);
    },
    createEmployee: async (req,res) =>{
        const pool = await dbService.connect();
        const {HoTen,NgaySinh,GioiTinh,SoDienThoai,SoNha,Duong,Quan,ThanhPho,NgayVaoLam,MaChiNhanh,BoPhanLamViec} = req.body;
        
       
        const result = await pool.request()
            .query(`
                EXEC sp_AddEmployee 
                @HoTen = N'${HoTen}',
                @NgaySinh = '${NgaySinh}',
                @GioiTinh = N'${GioiTinh}',
                @SoDienThoai = '${SoDienThoai}',
                @SoNha = N'${SoNha}',
                @Duong = N'${Duong}',
                @Quan = N'${Quan}',
                @ThanhPho = N'${ThanhPho}',
                @NgayVaoLam = '${NgayVaoLam}',
                @NgayNghiViec = NULL,
                @MaChiNhanh = ${MaChiNhanh},
                @BoPhanLamViec = ${BoPhanLamViec}
            `);
        res.status(200).json(result.recordset);
    },
    deleteEmployee : async (req,res) =>{
        //chỉ xóa dc khi có 1 dòng dl trong bảng LichSuLamViec
        const pool = await dbService.connect();
        const {MaNhanVien} = req.body;
        const result = await pool.request()
            .query(`
                DELETE FROM LichSuLamViec WHERE MaNhanVien = ${MaNhanVien};
                DELETE FROM NhanVien WHERE MaNhanVien = ${MaNhanVien};
            `);
        res.status(200).json(result.recordset);
    },
    updateEmployee : async (req,res) =>{
        const pool = await dbService.connect();
        const {MaNhanVien,HoTen,NgaySinh,GioiTinh,SoDienThoai,SoNha,Duong,Quan,ThanhPho,NgayVaoLam,NgayNghiViec} = req.body;
        if(!NgayNghiViec){
        const result = await pool.request()
            .query(`
                EXEC sp_UpdateEmployee
                @MaNhanVien = ${MaNhanVien}, 
                @HoTen = N'${HoTen}',
                @NgaySinh = '${NgaySinh}',
                @GioiTinh = N'${GioiTinh}',
                @SoDienThoai = '${SoDienThoai}',
                @SoNha = N'${SoNha}',
                @Duong = N'${Duong}',
                @Quan = N'${Quan}',
                @ThanhPho = N'${ThanhPho}',
                @NgayVaoLam = '${NgayVaoLam}',
                @NgayNghiViec = NULL
            `);
        res.status(200).json(result.recordset);
            }
            else{
                const result = await pool.request()
                .query(`
                    EXEC sp_UpdateEmployee
                    @MaNhanVien = ${MaNhanVien}, 
                    @HoTen = N'${HoTen}',
                    @NgaySinh = '${NgaySinh}',
                    @GioiTinh = N'${GioiTinh}',
                    @SoDienThoai = '${SoDienThoai}',
                    @SoNha = N'${SoNha}',
                    @Duong = N'${Duong}',
                    @Quan = N'${Quan}',
                    @ThanhPho = N'${ThanhPho}',
                    @NgayVaoLam = '${NgayVaoLam}',
                    @NgayNghiViec = '${NgayNghiViec}'
                `);
            res.status(200).json(result.recordset);
            }
    },
    reassignEmployee: async (req,res) =>{
        const pool = await dbService.connect();
        const {MaNhanVien,MaChiNhanh,BoPhanLamViec,NgayBatDau,NgayKetThuc} = req.body;
        if(!NgayKetThuc){
        const result = await pool.request()
            .query(`
                EXEC sp_ReassignEmployee
                @MaNhanVien = ${MaNhanVien},
                @MaChiNhanh = ${MaChiNhanh},
                @BoPhanLamViec = ${BoPhanLamViec},
                @NgayBatDau = '${NgayBatDau}',
                @NgayKetThuc = NULL
            `);
        res.status(200).json(result.recordset);
        }
        else{
            const result = await pool.request()
            .query(`
                EXEC sp_ReassignEmployee
                @MaNhanVien = ${MaNhanVien},
                @MaChiNhanh = ${MaChiNhanh},
                @BoPhanLamViec = ${BoPhanLamViec},
                @NgayBatDau = '${NgayBatDau}',
                @NgayKetThuc = '${NgayKetThuc}'
            `);
        res.status(200).json(result.recordset);
        }
    }
   
}

module.exports = employeeController;
