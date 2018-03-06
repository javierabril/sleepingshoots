module.exports = {    

    Conectar: function() {

        var Connection = require('tedious').Connection,
        var config = {
            userName: 'portalsanviweb',
            password: 'SYadmin-11',
            server: 'sleepingshoots.database.windows.net',
            // If you are on Microsoft Azure, you need this:  
            options: { encrypt: true, database: 'ssdb' }
        };
        var connection = new Connection(config);

        connection.on('connect', function (err) {
            // If no error, then good to proceed.  
            console.log("Conectado a BD");

        });
    },

    Desconectar: function() {

        connection.close();

    },

    BuscaUser: function (userName) {

        Conectar();

        var Request = require('tedious').Request;
        var TYPES = require('tedious').TYPES;

        request = new Request("SELECT * FROM Users Where nombre like '" + userName + "';", function (err) {
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

        request.on('doneInProc', function (rowCount, more, rows) {
            console.log(rowCount + ' rows returned');
            numFilas = rowCount;
        });

        db.connection.execSql(request);

        Desconectar();

        return numFilas;
    }
}