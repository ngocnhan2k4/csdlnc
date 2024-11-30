const express = require('express');
const route = require("./src/routes/index.js");
const handlebars = require("express-handlebars");
const dotenv = require("dotenv");
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app= express();


app.use(express.static("./src/public.js"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
    })
);
app.set("view engine", "hbs");
app.set("views", "./src/views");

route(app);


app.listen(process.env.port, () => {
    console.log(`Server is running on port ${process.env.port}`);
});