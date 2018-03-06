module.exports = function (app) {


    app.post('/register', function (req, res) {

        var db = require('./dbazure');
        var sha = require('sha256');

        // Get user credentials from the request
        var user = {
            nombre: req.body.name,
            email: req.body.email,
            //Encripted password sha
            password: sha(req.body.password)
        };
        
        db.BuscaUser(req.body.name, function(error, encontrado) {
            var result;

            if (error) {
                console.log(error);

                result = {
                    ok: false,
                    error: error
                };

                res.send(result);

            }
            else {

                //Si no existe lo insertamos
                if (encontrado == -1) {

                    db.InsertaUser(user, function (error, resultado) {

                        if (error) {
                            console.log(error);

                            result = {
                                ok: false,
                                error: error
                            };

                            res.send(result);

                        }
                        else {
                            result = {
                                ok: true,
                                idUsuario: resultado
                            };

                            res.send(result);
                        }

                    });

                }
                else {
                    result = {
                        ok: false,
                        error: "El usuario ya existe"
                    };

                    res.send(result);
                }
            }
        });
       

    });

};