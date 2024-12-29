const { parse } = require('dotenv');
const dbService = require('../../sevices/dbService.js');
const orderController = require('./orderController.js');

// GET /home?sortByPrice=asc,des&area=value&branch=value&q=value&category=value&orderType=value&page=1&limit=5
const homePage = async (req, res) => {
    try {
        console.log('Home controller:', req.query);
        
        const pool = await dbService.connect();

        // Extract query parameters
        const { sortByPrice, area, branch, q, category, orderType} = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // Query all areas
        const areasResult = await pool.request().query(`SELECT * FROM KhuVuc`);
        let areas = areasResult.recordset;

        // Set the default area to the first area in the array if none is selected
        const selectedArea = area || (areas.length > 0 ? areas[0].MaKhuVuc : null);

        // Query branches based on the selected area
        const branchesResult = await pool
            .request()
            .query(`SELECT * FROM ChiNhanh WHERE KhuVuc = '${selectedArea}'`);
        let branches = branchesResult.recordset;

        // Set the default branch to the first branch in the array if none is selected
    //    console.log('branch:' , branch);
        let selectedBranch = branch || (branches.length > 0 ? branches[0].MaChiNhanh : null);

        // check branch is in branches if not set to first branch
        if (selectedBranch) {
            const branchIds = branches.map((branch) => parseInt(branch.MaChiNhanh, 10));
            if (!branchIds.includes(parseInt(selectedBranch, 10))) {
                selectedBranch = parseInt(branches[0].MaChiNhanh, 10);
            }
        } 

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

        console.log(req.session);

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
    //    selectedBranch = branches[0].MaChiNhanh;
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
            userRole : userRole,
            cardInfo,
            userId,
        };

        console.log("userRole ",data.userRole);

    //    console.log('selectedArea:', selectedArea);
    //    console.log('branches', branches);
    //    console.log('selectedBranch:', selectedBranch);
    //    console.log('tables:', tables);

    //    console.log('userRole:', userRole);
    //    console.log('userId:', userId);
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
        const { 
            menu, 
            tableNumber, 
            userId, 
            userRole, 
            employeeId = 1, // Default employeeId to 1 if not provided
            orderType, 
            address, 
            phone, 
            timeDelivery, 
            amountOfPeople, 
            note, 
            dateOrder, 
            timeOrder,
            branchId,
        } = req.body;

        console.log('Processing order:', req.body);

        const pool = await dbService.connect();

        // Insert order details based on order type
        let MaPhieuDat;

        if (orderType === "G") {
            // Process delivery order
        //    console.log('1');
            const currentDate = new Date();
            // Ensure timeDelivery is in the correct format for SQL Server
            const formattedTimeDelivery = timeDelivery.endsWith(':00') ? timeDelivery : `${timeDelivery}:00`;
            const query = `
                EXEC sp_ThemPhieuDatGiaoHang
                    @NgayLap = '${currentDate.toISOString().slice(0, 10)}',
                    @NhanVienLap = ${employeeId},
                    @ThoiGianGiao = '${formattedTimeDelivery}',
                    @DiaChi = N'${address}',
                    @SoDienThoai = '${phone}',
                    @TrangThai = N'Chưa nhận'
            `;
            const result = await pool.request().query(query);
        //    console.log('1c');
            // Get the latest inserted MaPhieuDat for delivery
            const deliveryResult = await pool.request().query(`
                SELECT MAX(MaPhieuDat) AS MaPhieuDat FROM PhieuDat WHERE Loai = 'G'
            `);
            MaPhieuDat = deliveryResult.recordset[0]?.MaPhieuDat;
        //    console.log('1h');
        } else if (orderType === "O") {
            try {
                // Sanitize inputs to prevent SQL injection
                const sanitizedNote = note.replace(/'/g, "''");
                const tableValue = tableNumber ? parseInt(tableNumber, 10) : 'NULL';
                const currentDate = new Date();
        
                // Start a transaction to ensure atomicity
                const transaction = await pool.transaction();
                await transaction.begin();
        
                // Step 1: Insert into `PhieuDat` table
                const insertPhieuDatQuery = `
                    INSERT INTO PhieuDat (NgayLap, NhanVienLap, Loai)
                    OUTPUT INSERTED.MaPhieuDat
                    VALUES ('${currentDate.toISOString().slice(0, 10)}', ${employeeId}, 'O')
                `;
                console.log('Insert PhieuDat Query:', insertPhieuDatQuery); // Debugging
                const phieuDatResult = await transaction.request().query(insertPhieuDatQuery);
                MaPhieuDat = phieuDatResult.recordset[0]?.MaPhieuDat;
        
                // Step 2: Insert into `DatBanOnline` table
                const insertDatBanOnlineQuery = `
                    INSERT INTO DatBanOnline (MaPhieuDatOnline, MaChiNhanh, SoLuongKhach, NgayDat, GioDen, GhiChu, MaSoBan)
                    VALUES (${MaPhieuDat}, ${branchId}, ${amountOfPeople}, '${dateOrder}', '${timeOrder}', N'${sanitizedNote}', ${tableValue})
                `;
                console.log('Insert DatBanOnline Query:', insertDatBanOnlineQuery); // Debugging
                await transaction.request().query(insertDatBanOnlineQuery);
        
                // Step 3: Update the status of the selected table in `BanAn` table
                console.log('Table Number:', tableNumber);
                if (tableNumber) { // Only update if a table number was provided
                    const updateTableQuery = `
                        UPDATE BanAn
                        SET TrangThai = N'Không trống'
                        WHERE MaChiNhanh = ${branchId} AND STT = ${tableValue}
                    `;
                    console.log('Update BanAn Query:', updateTableQuery); // Debugging
                    const result = await transaction.request().query(updateTableQuery);
                    console.log('Update Table Result:', result); // Debugging
                }
        
                // Commit the transaction
                await transaction.commit();
                console.log('Transaction completed successfully.');
        
            } catch (error) {
                console.error('Error during transaction:', error);
        
                // If there's an error, roll back the transaction
                if (transaction) {
                    await transaction.rollback();
                    console.log('Transaction rolled back.');
                }
            }
        } else if (orderType === "T") {
            try {
                const currentDate = new Date().toISOString().slice(0, 10); // Format date to 'YYYY-MM-DD'
                const request = pool.request();
        
                // Add inputs for the stored procedure
                request.input('NgayLap', currentDate);
                request.input('NhanVienLap', employeeId);
                request.input('MaChiNhanh', branchId);
                request.input('MaBan', parseInt(tableNumber, 10));
        
                // Execute the stored procedure
                const result = await request.execute('sp_ThemPhieuDatTrucTiep');
                console.log('Direct order created successfully:', result);

                const deliveryResult = await pool.request().query(`
                    SELECT MAX(MaPhieuDat) AS MaPhieuDat FROM PhieuDat WHERE Loai = 'T'
                `);
                MaPhieuDat = deliveryResult.recordset[0]?.MaPhieuDat;
        
                // Additional logic can be added here if needed (e.g., returning a success message to the client)
            } catch (error) {
                console.error('Error creating direct order:', error.message);
                throw new Error('Failed to create direct order.'); // Optionally, rethrow the error for further handling
            }
        }
        else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid order type' 
            });
        }

        if (!MaPhieuDat) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to create order' 
            });
        }
    
        // Insert order details (menu items)
        for (const item of menu) {
            const detailQuery = `
                INSERT INTO ChiTietPhieuDat (MaPhieuDat, MaMonAn, SoLuong)
                VALUES (${MaPhieuDat}, ${item.MaMonAn}, ${item.qty})
            `;
            await pool.request().query(detailQuery);
        }

    
        const totalResult = await pool.request().query(`
            SELECT SUM(ct.SoLuong * ma.GiaHienTai) AS TongTien
            FROM ChiTietPhieuDat ct
            JOIN MonAn ma ON ct.MaMonAn = ma.MaMonAn
            WHERE ct.MaPhieuDat = ${MaPhieuDat}
        `);
        const TongTien = totalResult.recordset[0]?.TongTien || 0;

        const discountResult = await pool.request().query(`
            SELECT lt.GiamGia
            FROM TheKhachHang tkh
            JOIN LoaiThe lt ON tkh.LoaiThe = lt.MaThe
            WHERE tkh.MaTheKhachHang = ${userId}
        `);
        const TienGiam = (discountResult.recordset[0]?.GiamGia || 0) * TongTien / 100;

        console.log('userId:', userId);
        const currentDate = new Date();
        const result = await pool.request().query(`
            INSERT INTO HoaDon (MaKhachHang, TongTien, NgayLap, MaPhieuDat, TienGiam, NhanVienLap)
            VALUES (${userId}, ${TongTien}, '${currentDate.toISOString().slice(0, 10)}' , ${MaPhieuDat}, ${TienGiam}, ${employeeId})
        `);
        
        console.log('result:', result);
        console.log('Order processed successfully:', MaPhieuDat);

        if (orderType !== "G") {
            updateTableStatusInDB(branchId, tableNumber, 'Không trống');
        }
        
        res.status(200).json({
            success: true,
            message: `Order processed successfully.`,
            data: {
                MaPhieuDat,
                TongTien,
                TienGiam,
                ThanhTien: TongTien - TienGiam,
            },
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

// write a function to update table status
const updateTableStatusInDB = async (branchId, tableNumber, status) => {
    try {
        const pool = await dbService.connect();

        const updateTableQuery = `
            UPDATE BanAn
            SET TrangThai = N'${status}'
            WHERE MaChiNhanh = ${branchId} AND STT = ${tableNumber}
        `;
        console.log('Update BanAn Query:', updateTableQuery); // Debugging
        const result = await pool.request().query(updateTableQuery);
        console.log('Update Table Result:', result); // Debugging

        return true;
    } catch (error) {
        console.error('Database query error:', error);
        return false;
    }
};

// Post home/updateTableStatus
const updateTableStatus = async (req, res) => {
    try {
        const { tableNumber, branchId, status } = req.body;
        const pool = await dbService.connect();

        const updateTableQuery = `
            UPDATE BanAn
            SET TrangThai = N'${status}'
            WHERE MaChiNhanh = ${branchId} AND STT = ${tableNumber}
        `;
        console.log('Update BanAn Query:', updateTableQuery); // Debugging
        const result = await pool.request().query(updateTableQuery);
        console.log('Update Table Result:', result); // Debugging

        res.status(200).json({
            success: true,
            message: 'Table status updated successfully',
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update table status',
            error: error.message,
        });
    }
};



module.exports = {
    homePage,
    processOrder,
    updateTableStatus,
};