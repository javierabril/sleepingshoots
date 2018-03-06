module.exports = {

    Conectar: function (callback) {

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
                console.log("Conectado a BD");
                //Si no hay error devolvemos la conexion al callback
                return callback("null", connection);
            }
        });

    },

    Desconectar: function (connection) {

        connection.close();

    },

    EjecutaSelect: function (conexion, textoSelect, cbFunc) {

        var Request = require('tedious').Request;
        var TYPES = require('tedious').TYPES;
        var resultado = [];

        var request = new Request(textoSelect, function (error) {

            if (error) {
                console.log(error);
                return cbFunc(error);
            }
            cbFunc(null, resultado);
        });

        request.on("row", function (rowObject) {
            // populate the results array
            resultado.push(rowObject);
        });

        request.on('requestCompleted', function () {

            conexion.close();

        });

        conexion.execSql(request);

    },

    InsertaUser: function (user, cbFunc) {

        var Request = require('tedious').Request
        var TYPES = require('tedious').TYPES;
        var resultado;

        this.Conectar(function (error, conexion) {

            //var request = new Request("INSERT Users (nombre, email, password, fecha) OUTPUT INSERTED.id VALUES (@nombre, @email, @password, CURRENT_TIMESTAMP);", function (err) {
            var request = new Request("INSERT into Users (nombre, email, password, fecha) OUTPUT INSERTED.id VALUES ('javi', 'javi@ono', '123', CURRENT_TIMESTAMP);", function (err) {
                if (err) {
                    console.log(err);
                    cbFunc(error);
                }
            });

/*            console.log(user);

            request.addParameter('nombre', TYPES.VarChar, user.nombre);
            request.addParameter('email', TYPES.VarChar, user.email);
            request.addParameter('password', TYPES.Varchar, user.password);
*/
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("El id del user insertado es: " + column.value);
                        resultado = column.value;
                    }
                });
                //Devolvemos id del user en el callback
                cbFunc(null, resultado);
            });

            request.on('requestCompleted', function () {

                conexion.close();

            });

            conexion.execSql(request);

        });
    },

    BuscaUser: function (userName, cbFunc) {

        var self = this;

        //Usamos siempre el callback
        var connection = this.Conectar(function (error, conexion) {

            //Cuando responda la conexion ejecutamos el select
            self.EjecutaSelect(conexion, "SELECT * FROM Users Where nombre like '" + userName + "';", function (error, resultado) {
                if (error) {
                    console.log(error);
                    cbFunc(error);
                }
                else {

                    if (resultado.length > 0)
                        //Si existe devolvemos el id
                        return cbFunc(null, resultado[0]);
                    else
                        return cbFunc(null, -1);
                }
            });

        });

    }

}