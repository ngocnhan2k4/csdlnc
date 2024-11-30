const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const profileController ={
    getCustomer : async (req, res) => {
        try {
            const pool = await dbService.connect();
            const id = req.params.userID;
            const result = await pool.request().query(`EXEC sp_TimKiemTheKhachHang @MaTheKhachHang = ${id};`); 
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
    editCustomer : async (req, res) => {
        try {
            const pool = await dbService.connect();
            const id = req.params.userID;
            const {HoTen, SoDienThoai, Email, CCCD} = req.body;
            const result = await pool.request()
            .input('MaTheKhachHang', sql.Int, id)
            .input('HoTen', sql.NVarChar(255), HoTen || null)
            .input('SoDienThoai', sql.VarChar(10), SoDienThoai || null)
            .input('Email', sql.VarChar(255), Email || null)
            .input('CCCD', sql.VarChar(20), CCCD || null)
            .execute('sp_CapNhatThongTinTheKhachHang');
            res.status(200).json({
                message: 'OK',
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

module.exports = profileController;
