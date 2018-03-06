module.exports = {    

    Conectar: function(callback) {

        var Connection = require('tedious').Connection;
        var config = {
            userName: 'portalsanviweb',
            password: 'SYadmin-11',
            server: 'sleepingshoots.database.windows.net',
            // If you are on Microsoft Azure, you need this:  
            options: { encrypt: true, database: 'ssdb' }
        };

        var connection = new Connection(config);

        connection.on('connect', function (err) {
            if (err) {
                return callback(error);
            } else {
                //If no error, then good to proceed.
                console.log("Conectado a BD");
                return callback("null", connection);
            }
        });

    },

    Desconectar: function(connection) {

        connection.close();

    },

    EjecutaSelect: function (conexion, textoSelect, callback) {

        var Request = require('tedious').Request;
        var TYPES = require('tedious').TYPES;
        var resultado = [];

        var request = new Request(textoSelect, function (error) {

            if (error) {
                console.log(err);
                return callback(error);
            }
            callback(null, resultado);
        });

        request.on("row", function (rowObject) {
            // populate the results array
            resultado.push(rowObject);
        });
        conexion.execSql(request);

    },

    BuscaUser: function (userName, cbFunc) {

        var self = this;

        //Usamos siempre el callback
        var connection = this.Conectar(function (error, conexion) {

            console.log("aqui voy");

            //Cuando responda la conexion ejecutamos el select
            self.EjecutaSelect(conexion, "SELECT * FROM Users Where nombre like '" + userName + "';", function (error, resultado) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(resultado);
                    //cbFunc(resultado);
                    if (resultado.length > 0)
                        return true;
                    else
                        return false;
                }
            });

        });

    }

        
    /*
        
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

        connection.execSql(request);

        this.Desconectar(connection);

        return numFilas;
    }*/
}