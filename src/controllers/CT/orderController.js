const dbService = require('../../sevices/dbService.js');
const sql = require('mssql');
const orderController = {
   
    getAllOrder: async (req, res) => {
        try {
            const pool = await dbService.connect();
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            
            // Lấy dữ liệu từ cơ sở dữ liệu
            const result = await pool.request()
                .query(`
                    select pd.MaPhieuDat ,pd.NgayLap, hd.TongTien, nv.HoTen
                    from PhieuDat pd join HoaDon hd on hd.MaPhieuDat = pd.MaPhieuDat  
                    join NhanVien nv on nv.MaNhanVien = hd.NhanVienLap 
                    ORDER BY hd.MaHoaDon
                    OFFSET ${offset} ROWS
                    FETCH NEXT ${limit} ROWS ONLY;
                `);

                // Lấy tổng số đơn hàng
                const countResult = await pool.request()
                .query(`
                    SELECT COUNT(*) AS totalCount
                    FROM PhieuDat 
                `);

                const totalOrders = countResult.recordset[0].totalCount;
                const totalPages = Math.ceil(totalOrders / limit);
                const min = limit * (page - 1) + 1;
                const max = limit* page;
                let previous = page;
                let nextPage = page;

                if (page >1 ){
                    previous = page -1; 
                }
                if (page < totalPages){
                    nextPage = page +1; 
                }
            res.render('manageOrder', {
                title: 'List order',
                orders: result.recordset,
                currentPage: page,
                totalPages: totalPages,
                totalOrders: totalOrders,
                min: min,
                max:max,
                nextPage:nextPage,
                previous:previous,
                customHead: `
                <link rel="stylesheet" href="/CT/manageOrder/manageOrder.css">
                <script defer src="/CT/manageOrder/manageOrder.js"></script>
                `,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hóa đơn:", error);
            res.status(500).send("Lỗi máy chủ.");
        }
    },    

    getAllOrderByType: async (req, res) => {
        const pool = await dbService.connect();
        const Loai = req.params.Loai;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select pd.MaPhieuDat ,pd.NgayLap, hd.TongTien, nv.HoTen
                from PhieuDat pd join HoaDon hd on hd.MaPhieuDat = pd.MaPhieuDat  
                join NhanVien nv on nv.MaNhanVien = hd.NhanVienLap 
                where pd.Loai='${Loai}'
                order by hd.MaHoaDon
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);

            const countResult = await pool.request()
            .query(`
                SELECT COUNT(*) AS totalCount
                FROM PhieuDat pd
                WHERE pd.Loai='${Loai}'
            `);

            const totalOrders = countResult.recordset[0].totalCount;
            const totalPages = Math.ceil(totalOrders / limit);
            const min = limit * (page - 1) + 1;
            const max = limit* page;
            let previous = page;
            let nextPage = page;

            if (page >1 ){
                previous = page -1; 
            }
            if (page < totalPages){
                nextPage = page +1; 
            }
            
            if(Loai =='T'){
                res.render('directOrder', {
                    title: 'Direct Order',
                    orders: result.recordset,
                    currentPage: page,
                    totalPages: totalPages,
                    totalOrders: totalOrders,
                    min: min,
                    max:max,
                    nextPage:nextPage,
                    previous:previous,
                    Loai:Loai,
                    customHead: `
                    <link rel="stylesheet" href="/CT/manageOrder/manageOrder.css">
                    <script defer src="/CT/manageOrder/manageOrder.js"></script>
                    `,
                });
            }else if(Loai === 'O'){
                res.render('onlineOrder', {
                    title: 'Online Order',
                    orders: result.recordset,
                    currentPage: page,
                    totalPages: totalPages,
                    totalOrders: totalOrders,
                    min: min,
                    max:max,
                    nextPage:nextPage,
                    previous:previous,
                    Loai:Loai,
                    customHead: `
                    <link rel="stylesheet" href="/CT/manageOrder/manageOrder.css">
                    <script defer src="/CT/manageOrder/manageOrder.js"></script>
                    `,
                });
            }
            else{
                res.render('reservationOrder', {
                    title: 'Reservation Order',
                    orders: result.recordset,
                    currentPage: page,
                    totalPages: totalPages,
                    totalOrders: totalOrders,
                    min: min,
                    max:max,
                    nextPage:nextPage,
                    previous:previous,
                    Loai:Loai,
                    customHead: `
                    <link rel="stylesheet" href="/CT/manageOrder/manageOrder.css">
                    <script defer src="/CT/manageOrder/manageOrder.js"></script>
                    `,
                });
            }
           
    },

    getEvaluation: async (req, res) => {
        const pool = await dbService.connect();
        const MaHoaDon = req.params.MaHoaDon;
        const result = await pool.request()
            .query(`
                select * from DanhGiaDichVu where MaHoaDon=${MaHoaDon};
            `);
        res.status(200).json(result.recordset);
    },

    getAllOrderByBranch: async (req, res) => {
        const pool = await dbService.connect();
        const MaChiNhanh = req.params.MaChiNhanh;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;  
        const result = await pool.request()
            .query(`
                select hd.MaHoaDon, hd.MaKhachHang, hd.MaPhieuDat, hd.NgayLap,hd.NhanVienLap,hd.TienGiam, hd.TongTien
                from  HoaDon hd, LichSuLamViec ls
                where hd.NhanVienLap = ls.MaNhanVien and ls.MaChiNhanh=${MaChiNhanh}
                order by hd.MaHoaDon
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);
        res.status(200).json(result.recordset);
    },
}

module.exports = orderController;