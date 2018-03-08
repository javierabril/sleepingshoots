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

            //Declaramos fila como un objeto json vacio
            var fila = {};

            rowObject.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    //Cogemos el nombre de la fila y el vamos
                    //para crear un objeto fila con los nombres de campos de la db
                    fila[column.metadata.colName] = column.value;
                }
            });

            resultado.push(fila);
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

            var request = new Request("INSERT into Users (nombre, email, password, fecha) OUTPUT INSERTED.id VALUES ('" + user.nombre + "', '" + user.email + "','" + user.password + "', CURRENT_TIMESTAMP);", function (err) {
                if (err) {
                    console.log(err);
                    cbFunc(error);
                }
            });


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
                        return cbFunc(null, resultado.id);
                    else
                        return cbFunc(null, -1);
                }
            });

        });

    },

    Login: function (user, cbFunc) {

        var self = this;

        //Usamos siempre el callback
        var connection = this.Conectar(function (error, conexion) {

            //Cuando responda la conexion ejecutamos el select
            self.EjecutaSelect(conexion, "SELECT id,nombre,password FROM Users Where nombre like '" + user.nombre + "';", function (error, resultado) {
                if (error) {
                    console.log(error);
                    cbFunc(error);
                }
                else {
                    if (resultado.length > 0) {

                        //Si coincide el nombre y pass sha devolvemos true
                        if (resultado[0].nombre == user.nombre && resultado[0].password == user.password) {
                            //Si es ok devolvemos el id
                            return cbFunc(null, resultado[0].id);
                        }
                        //sino coincide devolvemos -1
                        else {
                            return cbFunc(null, -1);
                        }
                    }
                    else //sino devuelve nada el select es que no existe el user
                        return cbFunc(null, -1);
                }
            });

        });

    },


    GetRecords: function (userId, cbFunc) {

        var self = this;

        //Usamos siempre el callback
        var connection = this.Conectar(function (error, conexion) {

            //Cuando responda la conexion ejecutamos el select
            self.EjecutaSelect(conexion, "SELECT * FROM Records Where idUser = " + userId + " ORDER BY fecha Desc;", function (error, resultado) {
                if (error) {
                    console.log(error);
                    cbFunc(error);
                }
                else {

                    if (resultado.length > 0)
                        //Si hay records los devolvemos
                        return cbFunc(null, resultado);
                    else
                        return cbFunc(null, []);
                }
            });

        });

    },


    InsertaRecord: function (record, cbFunc) {

        var Request = require('tedious').Request
        var TYPES = require('tedious').TYPES;
        var resultado;

        this.Conectar(function (error, conexion) {

            var request = new Request("INSERT into Records (idUser, puntos, fecha) VALUES ('" + record.userid + "', '" + record.puntos + "', CURRENT_TIMESTAMP);", function (err) {
                if (err) {
                    console.log(err);
                    cbFunc(err);
                }
            });

            /*
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
            */
            request.on('requestCompleted', function () {

                //Devolvemos un true
                cbFunc(null, true);

                conexion.close();
                
            });

            conexion.execSql(request);

        });

    }



}