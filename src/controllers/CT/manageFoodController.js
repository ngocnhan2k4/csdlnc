const dbService = require("../../sevices/dbService.js");

const controller = {};
controller.renderArea = async (req, res) => {
  res.render("manageFood", {
    layout: "main",
    title: "ManageFood",
    customHead: `
      <link rel="stylesheet" href="/CT/manageFood/manageFood.css">
      <script defer src="/CT/manageFood/manageFood.js"></script>
  `,
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

controller.renderManageFoodArea = async (req, res) => {
  res.render("manageFoodArea", {
    layout: "main",
    title: "Food of Area",
    customHead: `
      <link rel="stylesheet" href="/CT/manageFood/manageFoodArea.css">
      <script defer src="/CT/manageFood/manageFoodArea.js"></script>
  `,
  });
};

module.exports = controller;
