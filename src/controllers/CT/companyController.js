const dbService = require("../../sevices/dbService.js");

const controller = {};

controller.homeCompany = async (req, res) => {
  const pool = await dbService.connect();
  const result = await pool.request().query(
    `
      SELECT kv.TenKhuVuc, kv.MaKhuVuc 
      FROM KhuVuc kv
      ORDER BY kv.MaKhuVuc 
    `
  );
  
  res.render("companyManage", {
    layout: "main",
    title: "Company",
    customHead: 
    `
      <link rel="stylesheet" href="/CT/manageFood/company.css">
      <script defer src="/CT/manageFood/company.js"></script>
    `,
    areas:result.recordset
  });
};

controller.getArea = async (req, res) => {
  const pool = await dbService.connect();
  const result = await pool.request().query(`
      SELECT kv.TenKhuVuc 
      FROM KhuVuc kv
      ORDER BY kv.MaKhuVuc;
`);
  res.status(200).json(result.recordset);
};

module.exports = controller;
