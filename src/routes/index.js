const historyRouter = require("./KH/historyRoute.js");
const profileRouter = require("./KH/profileRoute.js");
const orderRouter = require("./KH/orderRoute.js");
//const authRouter = require("./KH/authRoute.js");
const authBranchRouter = require("./CN/authRoute.js");
const dishRouter = require("./CN/dishRoute.js");
const orderBranchRouter = require("./CN/orderRoute.js")
const employeeRouter = require("./CN/employeeRoute.js")
const revenueRouter = require("./CN/revenueRoute.js")
const revenueCompanyRouter = require("./CT/revenueRoute.js")
const orderCompanyRouter = require("./CT/orderRoute.js")
const dishCompanyRouter = require("./CT/dishRoute.js")
const employeeCompanyRouter = require("./CT/employeeRoute.js")

const manageFoodRouter = require("./CT/manageFoodRouter.js")

const authRouter = require("./Auth/authRoute.js");

const homeRouter = require("./homeRouter.js");

const midd = require("../middleware/role.js"); // import middleware phân quyền người dùng

function route(app) {
    //Auth
    app.use("/auth", authRouter);
    
    // Redirect '/' to '/home'
    app.use('/', (req, res, next) => {
        if (req.path === '/') {
            return res.redirect('/home');
        }
        next();
    });
    
    app.use("/home", homeRouter);


    //KH
    app.use("/customer/history", historyRouter);
    app.use("/customer/profile", profileRouter);
    app.use("/customer/order", orderRouter);
    //app.use("/customer/auth", authRouter);

    //CN
    app.use("/branch/auth", authBranchRouter);
    app.use("/branch/dish", dishRouter);
    app.use("/branch/order", orderBranchRouter);
    app.use("/branch/employee", employeeRouter);
    app.use("/branch/revenue", revenueRouter);

    //CT
    app.use("/company/revenue", revenueCompanyRouter);
    app.use("/company/order",midd.checkRole('admin'), orderCompanyRouter);
    app.use("/company/dish",midd.checkRole('admin'), dishCompanyRouter); // chỉ admin với được vào đường dẫn này
    app.use("/company/employee", employeeCompanyRouter);

    app.use("/company",  manageFoodRouter);
}


module.exports = route;
