const homeController = require("../controllers/KH/homeController.js");
const router = require("express").Router();

router.get("/", homeController.homePage);
router.post("/processOrder", homeController.processOrder);

module.exports = router;
