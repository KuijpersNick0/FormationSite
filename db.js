var mysql = require("mysql");
var connection = mysql.createConnection({
    host    :'localhost',
    user    :'root',
    password:'Efuxi98233?',
    database:'itacademy'
});
connection.connect(function(error) {if(error) console.log(error);});

module.exports = connection;