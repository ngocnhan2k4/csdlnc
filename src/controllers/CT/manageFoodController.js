
const controller = {};
controller.renderManageFood = async (req, res) => {
    res.render("manageFood", {
      layout: "main",
      title: "ManageFood",
    });
};

module.exports = controller;

