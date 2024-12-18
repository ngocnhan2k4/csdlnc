const dbService = require("../../sevices/dbService.js");
const { removeVietnameseAccents } = require("../../../utils/stringVN.js");

const dishController = {
  getDishFromBranch: async (req, res) => {
    const pool = await dbService.connect();
    const branchID = req.params.branchID;
    const areaID = req.query.areaID;
    const page = parseInt(req.query.page) || 1;
    //const index = removeVietnameseAccents(req.query.index) || 'Hotpot';
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const result = await pool.request().query(`
                SELECT ma.MaMonAn, ma.TenMonAn, ma.Muc, ma.MoTa, ma.HinhAnh, ma.GiaHienTai 
                FROM MonAn_KhuVuc makv 
                JOIN ChiNhanh cn ON makv.MaKhuVuc = cn.KhuVuc 
                JOIN MonAn ma ON makv.MaMon = ma.MaMonAn
                WHERE cn.MaChiNhanh = ${branchID}
                ORDER BY ma.MaMonAn 
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);

    const nameArea = await pool.request().query(
      `
                    SELECT kv.TenKhuVuc 
                    FROM KhuVuc kv
                    WHERE kv.MaKhuVuc = ${areaID}
                    `
    );
    const nameBranch = await pool.request().query(
      `
                SELECT TenChiNhanh
                FROM ChiNhanh
                WHERE MaChiNhanh = ${branchID}
                `
    );

    const totalResult = await pool.request().query(`
                   SELECT COUNT(*) AS total
                    FROM MonAn_KhuVuc makv 
                    JOIN ChiNhanh cn ON makv.MaKhuVuc = cn.KhuVuc 
                    JOIN MonAn ma ON makv.MaMon = ma.MaMonAn
                    WHERE cn.MaChiNhanh = ${branchID}

                `);

    const totalItems = totalResult.recordset[0].total;
    console.log("all item: ", totalItems);
    const totalPages = Math.ceil(totalItems / limit);
    console.log("all page: ", totalPages);

    // const type = await pool.request()
    //     .query(`
    //         SELECT distinct b.Muc
    //         FROM MonAn_KhuVuc a join MonAn b on a.MaMon = b.MaMonAn
    //         where a.MaKhuVuc = ${areaID}

    //     `);

    const branchOfArea = await pool.request().query(`
                SELECT cn.TenChiNhanh, cn.MaChiNhanh, cn.KhuVuc
                FROM ChiNhanh cn 
                WHERE cn.KhuVuc = ${areaID}
            `);

    res.render("dishOfBranch", {
      layout: "main",
      title: "Food of Area",
      customHead: `
                <link rel="stylesheet" href="/CT/manageFood/manageFoodArea.css">
                <script defer src="/CT/manageFood/manageFoodArea.js"></script>
            `,
      dishes: result.recordset,
      nameArea: nameArea.recordset[0]?.TenKhuVuc || "Unknown",
      nameBranch: nameBranch.recordset[0]?.TenChiNhanh || "Unknown",
      currentPage: page,
      totalPages: totalPages,
      areaID: areaID,
      // MaChiNhanh: branchID,
      // type: type.recordset,
      // currentIndex: index,
      branchs: branchOfArea.recordset,
    });

    // const pool = await dbService.connect();
    // const branchID = req.params.branchID;
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const offset = (page - 1) * limit;
    // const result = await pool.request()
    //     .query(`
    //         SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai
    //         From MonAn_KhuVuc makv, ChiNhanh cn, MonAn ma
    //         where makv.MaKhuVuc= cn.KhuVuc and makv.MaMon = ma.MaMonAn and cn.MaChiNhanh=${branchID}
    //         order by ma.MaMonAn
    //         OFFSET ${offset} ROWS
    //         FETCH NEXT ${limit} ROWS ONLY;
    //     `);

    // res.status(200).json(result.recordset);
  },

  getDishFromArea: async (req, res) => {
    const pool = await dbService.connect();
    const areaID = req.params.areaID;
    const page = parseInt(req.query.page) || 1;
    const index = removeVietnameseAccents(req.query.index) || "Hotpot";
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const result = await pool.request().query(`
                SELECT ma.MaMonAn, ma.TenMonAn,ma.Muc,ma.MoTa,ma.HinhAnh,ma.GiaHienTai 
                From MonAn_KhuVuc makv join MonAn ma on makv.MaMon = ma.MaMonAn
                where makv.MaKhuVuc=${areaID} and ma.Muc COLLATE Latin1_General_CI_AI = '${index}'
                order by ma.MaMonAn
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `);

    const totalResult = await pool.request().query(`
                    SELECT COUNT(*) AS total
                    FROM MonAn_KhuVuc makv join MonAn ma on makv.MaMon = ma.MaMonAn
                    WHERE makv.MaKhuVuc=${areaID} and ma.Muc COLLATE Latin1_General_CI_AI = '${index}'
                `);

    const totalItems = totalResult.recordset[0].total;
    console.log("Tông so trang", totalItems);

    const totalPages = Math.ceil(totalItems / limit);

    console.log("totalpage: ", totalPages);

    const nameArea = await pool.request().query(`
                SELECT kv.TenKhuVuc
                FROM KhuVuc kv
                where kv.MaKhuVuc = ${areaID}
            `);

    const type = await pool.request().query(`
                SELECT distinct b.Muc, a.MaKhuVuc
                FROM MonAn_KhuVuc a join MonAn b on a.MaMon = b.MaMonAn
                where a.MaKhuVuc = ${areaID}

            `);

    const branchOfArea = await pool.request().query(`
                SELECT cn.TenChiNhanh, cn.MaChiNhanh, cn.KhuVuc
                FROM ChiNhanh cn 
                WHERE cn.KhuVuc = ${areaID}
            `);

    res.render("manageFoodArea", {
      layout: "main",
      title: "Food of Area",
      customHead: `
                <link rel="stylesheet" href="/CT/manageFood/manageFoodArea.css">
                <script defer src="/CT/manageFood/manageFoodArea.js"></script>
            `,
      dishes: result.recordset,
      nameArea: nameArea.recordset[0]?.TenKhuVuc || "Unknown",
      currentPage: page,
      totalPages: totalPages,
      type: type.recordset,
      areaID: areaID,
      currentIndex: index,
      branchs: branchOfArea.recordset,
    });
  },

  searchDish: async (req, res) => {
    const pool = await dbService.connect();
    const { TuKhoa } = req.query;
    const result = await pool.request().query(`
            SELECT ma.MaMonAn, ma.TenMonAn, ma.Muc, ma.MoTa, ma.HinhAnh, ma.GiaHienTai
            FROM MonAn ma
            WHERE ma.TenMonAn LIKE N'%${TuKhoa}%'
        `);

    res.status(200).json(result.recordset);
  },

  createDish: async (req, res) => {
    try {
      const pool = await dbService.connect();
      const { TenMonAn, Muc, MoTa, HinhAnh, GiaHienTai } = req.body;

      const result = await pool.request().query(`
                    EXEC sp_AddDish @TenMonAn = N'${TenMonAn}', @GiaHienTai = ${GiaHienTai}, @Muc = N'${Muc}', @MoTa = N'${MoTa}', @HinhAnh = N'${HinhAnh}'
                `);

      res.status(200).json({
        success: true,
        message: "Dish added successfully",
        data: result.recordset,
      });
    } catch (error) {
      console.error("Error adding dish:", error);
      res.status(500).json({
        success: false,
        message: "Server error, please try again later",
      });
    }
  },

  deleteDish: async (req, res) => {
    const pool = await dbService.connect();
    const { MaMonAn } = req.body; // Đọc tham số từ body khi dùng DELETE
    try {
      const result = await pool.request().query(`
          EXEC sp_DeleteDish @MaMonAn = ${MaMonAn}
      `);
      // Kiểm tra kết quả để xác nhận xóa thành công
      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: 'Xóa món ăn thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy món ăn để xóa' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Có lỗi xảy ra', error: error.message });
    }
  },
  

  updateDish: async (req, res) => {
    try {
        console.log('Kết nối máy chủ thành công');
        const pool = await dbService.connect();

        const { MaMonAn, TenMon, Muc, MoTa, HinhAnh, GiaHienTai } = req.body;
        console.log('Dữ liệu gửi tới máy chủ:', req.body);

        // Thực thi stored procedure
        const result = await pool.request().query(`
            EXEC sp_UpdateDish 
                @MaMonAn = ${MaMonAn}, 
                @TenMon = N'${TenMon}', 
                @GiaHienTai = ${GiaHienTai}, 
                @Muc = N'${Muc}', 
                @MoTa = N'${MoTa}', 
                @HinhAnh = N'${HinhAnh}'
        `);

        // Kiểm tra rowsAffected để xác nhận cập nhật thành công
        if (result.rowsAffected[0] > 0) {
            return res.status(200).json({
                success: true,
                message: 'Cập nhật món ăn thành công!',
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy món ăn để cập nhật!',
            });
        }
    } catch (error) {
        console.error('Lỗi trong quá trình cập nhật món ăn:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi trong quá trình cập nhật!',
            error: error.message
        });
    }
},

};
module.exports = dishController;
