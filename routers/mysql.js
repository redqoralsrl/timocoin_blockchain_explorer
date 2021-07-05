const mysql = require('mysql2');

const client = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'explorer',
    port: '3307',
    multipleStatements: true,   // 한번에 여러 쿼리 사용 가능
},(err)=>{
    console.log('error');
});

module.exports = client;