const express = require('express');
const route = require("./src/routes/index.js");
const expressHandlebars = require('express-handlebars');
const dotenv = require("dotenv");
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); 

dotenv.config();
const app= express();

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
        gt: (a, b) => a > b,
        dec: (a) => a - 1,
        inc: (a) => a + 1,
        lt: (a, b) => a < b, 
    }
}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/src/views');


route(app);


app.listen(process.env.port, () => {
    console.log(`Server is running at http://localhost:${process.env.port}`);
});