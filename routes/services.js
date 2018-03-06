module.exports = function (app) {


    app.post('/register', function (req, res) {

        var db = require('./dbazure');
        var sha = require('sha256');

        // Get user credentials from the request
        var user = {
            name: req.body.name,
            //Encripted password sha
            password: sha(req.body.password)
        };

        db.BuscaUser(req.body.name, function(error, encontrado) {

            if (error) {
                console.log(error);
                var result = {
                    ok: false,
                    error: error
                };

                res.send(result);

            }
            else {
                console.log(encontrado);

                var result = {
                    ok: true,
                    existeUser: encontrado
                };

                res.send(result);
            }
        });
       

    });

};