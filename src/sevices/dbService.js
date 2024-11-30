const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();
const config = {
    server:process.env.DB_SERVER,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    options: {
        trustedConnection: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    },
    requestTimeout: 30000, // 30 giây
    connectionTimeout: 30000, // 30 giây
};


module.exports ={
    connect: () => sql.connect(config),
    sql,
}