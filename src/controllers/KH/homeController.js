const dbService = require('../../sevices/dbService.js');

// GET /home?sortByPrice=asc,des&area=value&branch=value&q=value&category=value&orderType=value&page=1&limit=5
const homeController = async (req, res) => {
    try {
        const pool = await dbService.connect();

        // Extract query parameters
        const { sortByPrice, area, branch, q, category, orderType} = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // Query all areas
        const areasResult = await pool.request().query(`SELECT * FROM KhuVuc`);
        const areas = areasResult.recordset;

        // Set the default area to the first area in the array if none is selected
        const selectedArea = area || (areas.length > 0 ? areas[0].MaKhuVuc : null);

        // Query branches based on the selected area
        const branchesResult = await pool
            .request()
            .query(`SELECT * FROM ChiNhanh WHERE KhuVuc = '${selectedArea}'`);
        const branches = branchesResult.recordset;

        // Set the default branch to the first branch in the array if none is selected
        const selectedBranch = branch || (branches.length > 0 ? branches[0].MaChiNhanh : null);

        // Query categories from the Muc column in MonAn
        const categoriesResult = await pool.request().query(`SELECT DISTINCT Muc FROM MonAn WHERE Muc IS NOT NULL`);
        const categories = categoriesResult.recordset.map((row) => ({ Muc: row.Muc }));

        // Query foods based on the selected area (shared by all branches in the area)
        const foodQuery = `
            SELECT ma.*, makv.MaKhuVuc
            FROM MonAn ma
            INNER JOIN MonAn_KhuVuc makv ON ma.MaMonAn = makv.MaMon
            WHERE makv.MaKhuVuc = '${selectedArea}'
            ${category && category !== 'all' ? `AND ma.Muc = N'${category}'` : ''}
            ${q ? `AND ma.TenMonAn LIKE N'%${q}%'` : ''}
            ${sortByPrice ? `ORDER BY ma.GiaHienTai ${sortByPrice === 'asc' ? 'ASC' : 'DESC'}` : 'ORDER BY ma.MaMonAn'}
        `;
        const foodsResult = await pool.request().query(foodQuery);
        const foods = foodsResult.recordset;

        // Calculate total pages
        const totalItems = foods.length;
        const totalPages = Math.ceil(totalItems / limit);

        // Paginate foods
        const paginatedFoods = foods.slice(offset, offset + limit);

        // Retrieve tables for the selected branch
        const tablesQuery = `
            SELECT STT, TrangThai 
            FROM BanAn 
            WHERE MaChiNhanh = '${selectedBranch}'
        `;
        const tablesResult = await pool.request().query(tablesQuery);
        const tables = tablesResult.recordset;

        // Retrieve user role from session
        const userRole = req.session.userRole || 'customer';
        const userId = req.session.userId || null;
        let cardInfo = null;
        if (userRole === 'customer') {
            const cardType = req.session.cardType || 1;

            // Query to get card details
            const cardQuery = `
                SELECT * 
                FROM LoaiThe
                WHERE MaThe = @CardType
            `;

            const cardResult = await pool.request()
                .input('CardType', dbService.sql.Int, cardType)
                .query(cardQuery);

            if (cardResult.recordset.length > 0) {
                cardInfo = cardResult.recordset[0];
            }
        }

    //    console.log('cardInfo:', cardInfo);

        // Combine data for rendering
        const data = {
            areas,
            branches,
            categories: [{ Muc: 'all' }, ...categories], // Add 'all' option
            foods: paginatedFoods,
            tables,
            selectedArea,
            selectedBranch,
            selectedCategory: category,
            sortByPrice,
            orderType,
            q,
            userRole : 'branch',
            cardInfo,
            userId,
        };
    //    console.log('data:', data);

        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            // For AJAX, send JSON response
            return res.json({
                ...data,
                page: page,
                totalPages: totalPages,
                limit: limit,
            });
        }
        
        res.render('home', {
            ...data,
            page: page,
            totalPages: totalPages,
            limit: limit,
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({
            success: false,
            message: 'Database query failed',
            error: error.message,
        });
    }
};

// Post home/processOrder
const processOrder = async (req, res) => {
    try {
        const { branchId, tableNumber, foodId, quantity } = req.body;
        const userId = req.session.userId;

        const pool = await dbService.connect();
        const orderQuery = `
            EXEC sp_TaoDonHang @MaChiNhanh = '${branchId}', @MaBan = '${tableNumber}', @MaMonAn = '${foodId}', @SoLuong = ${quantity}, @MaTheKhachHang = ${userId}
        `;
        const orderResult = await pool.request().query(orderQuery);

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
};


module.exports = {
    homeController,
    processOrder,
};