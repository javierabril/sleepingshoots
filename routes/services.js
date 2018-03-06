module.exports = function (app) {

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


    app.post('/login', (req, res) => {
        // Get user credentials from the request
        let userClient = {
            name: req.body.name,
            //Encripted password sha
            password: sha(req.body.password)
        };


        Users.find({
            name: userClient.name,
            password: userClient.password
        })
            .then(data => {
                // User is valid. Generate token
                if (data) {
                    //Only have an user and pass to generate token
                    let token = generateToken(data[0]);
                    let result = { ok: true, token: token };
                    res.send(result);
                    // User not found. Generate error message
                } else {
                    let result = {
                        ok: false,
                        error: "Username or password incorrect"
                    };
                    res.send(result);
                }
            }).catch(error => {
                // Error searching user. Generate error message
                let result = {
                    ok: false,
                    error: "Username or password incorrect"
                };
                res.send(result);
            });
    });

};