const controller = {};
controller.renderManageFood = async (req, res) => {
  res.render("manageFood", {
    layout: "main",
    title: "ManageFood",
    customHead: `
      <link rel="stylesheet" href="/CT/manageFood/manageFood.css">
      <script defer src="/CT/manageFood/manageFood.js"></script>
  `,
  });
};

module.exports = controller;
