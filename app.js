const express = require('express');
const route = require("./src/routes/index.js");
const expressHandlebars = require('express-handlebars');
const dotenv = require("dotenv");
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); 
const session = require('express-session');

dotenv.config();
const app = express();

// Configure session middleware
app.use(session({
    secret: 'your_secret_key', // Use a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set true for HTTPS
}));

app.use(express.static("./src/public.js"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', expressHandlebars.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/src/views/layouts',
    partialsDir: __dirname + '/src/views/partials/',
    helpers: {
        eq: (a, b) => a === b,
        neq: (a, b) => a !== b,
        gt: (a, b) => a > b,

        dec: (a) => a - 1,
        inc: (a) => a + 1,

        lt: (a, b) => a < b, 
        
        subtract: (a, b) => a - b,
        add: (a, b) => a + b,
        sub: (a, b) => a - b,
        range_minh: (start, end) => {
            let result = [];
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
            return result;
        },

        addOne: (value) => value + 1,

        range: (from, to, options) => {
            let result = '';
            // Chắc chắn rằng options.fn được gọi đúng
            for (let i = from; i <= to; i++) {
                result += options.fn({ number: i });  // Truyền đúng đối tượng vào
            }
            return result;
        },
        paginationRange: (currentPage, totalPages, maxVisiblePages, options) => {
            const range = [];
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
            // Điều chỉnh lại startPage và endPage khi gần rìa
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        
            for (let i = startPage; i <= endPage; i++) {
                range.push(i);
            }
        
            // Đảm bảo options.fn được gọi đúng
            let result = '';
            range.forEach((page) => {
                result += options.fn({ number: page });
            });
        
            return result;
        },

        increment: (index) => index + 1, // Helper mới

        checkRole: (userRole) => {
            // Kiểm tra xem userRole có thuộc một trong ba vai trò không
            return userRole === 'admin' || userRole === 'branch' || userRole === 'customer';
        },

        ifEquals: (arg1, arg2, options) => {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        },
    }
}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/src/views');

// sesion lưu thông tin người dùng
app.use(session({
    secret: 'authentication', // Thay bằng khóa bí mật riêng
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Đặt `secure: true` nếu dùng HTTPS
}));

app.use((req, res, next) => {
    res.locals.userRoleAll = req.session.userRole;  // Truyền userRole vào res.locals
    res.locals.userNameAll = req.session.userName;  // Truyền userName vào res.locals
    next();
});

route(app);


app.listen(process.env.port, () => {
    console.log(`Server is running at http://localhost:${process.env.port}`);
});