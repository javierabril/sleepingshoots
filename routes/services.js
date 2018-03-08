module.exports = function (app) {

    const secretWord = "miclave";

    function generateToken(user) {       

        var token = jwt.sign({ id: user._id, name: user.name }, secretWord,
            { expiresIn: "2 years" });
        return token;
    }

    function validateToken(token) {

        try {
            var result = jwt.verify(token, secretWord);
            return result;
        } catch (e) {
            console.log("Error validating token");
        }

    }
    
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

        db.BuscaUser(req.body.name, function (error, encontrado) {
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


    app.post('/login', function (req, res) {

        var db = require('./dbazure');
        var sha = require('sha256');

        // Get user credentials from the request
        var userClient = {
            nombre: req.body.name,
            //Encripted password sha
            password: sha(req.body.password)
        };


        db.Login(userClient, function (error, loginId) {

            var result;

            if (error) {
                result = {
                    ok: false,
                    idUsuario: loginId
                };

                res.send(result);
            }
            else {
                //Si es correcto devolvemos true y el id
                if (loginId > 0) {
                    result = {
                        ok: true,
                        idUsuario: loginId
                    };

                    res.send(result);
                }
                //Sino devolvemos false y -1
                else {
                    result = {
                        ok: false,
                        idUsuario: loginId
                    };

                    res.send(result);
                }
            }

        });
    });

    app.post('/insertaRecord', function (req, res) {

        var db = require('./dbazure');

        var record = {
            userid: req.body.userid,
            puntos: req.body.puntos
        };


        db.InsertaRecord(record, function (error, correcto) {

            var result;

            if (error) {
                result = {
                    ok: false,
                    error: error.message
                };

                res.send(result);
            }
            else {

                result = {
                    ok: true
                };

                res.send(result);

            }

        });
    });

    app.post('/getRecords', function (req, res) {

        var db = require('./dbazure');


        db.GetRecords(req.body.userid, function (error, records) {

            var result;

            if (error) {
                result = {
                    ok: false,
                    error: error.message
                };

                res.send(result);
            }
            else {

                result = {
                    ok: true,
                    records: records
                };

                res.send(result);

            }

        });
    });


};