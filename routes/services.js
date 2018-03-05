module.exports = function (app) {

    var db = require('../dbazure');

    app.post('/register', function (req, res) {

        var sha = require('sha256');

        // Get user credentials from the request
        var user = {
            name: req.body.name,
            //Encripted password sha
            password: sha(req.body.password)
        };

        var userEncontrado = buscaUser();

        var result = {
            ok: true,
            numFilas: userEncontrado
        };
        res.send(user);

    });


    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function buscaUser(userName) {
        request = new Request("SELECT * FROM Users Where nombre like " + userName + ";", function (err) {
            if (err) {
                console.log(err);
            }
        });
        var result = "";
        request.on('row', function (columns) {
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    result += column.value + " ";
                }
            });
            console.log(result);
            result = "";
        });

        var numFilas;       

        request.on('done', function (rowCount, more) {
            console.log(rowCount + ' rows returned');
            numFilas = rowCount;
        });

        db.connection.execSql(request);

        return numFilas;
    }  
}