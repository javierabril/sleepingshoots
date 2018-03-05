var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  port: "56034",
  user: "azure",
  password: "6#vWHD_$"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});