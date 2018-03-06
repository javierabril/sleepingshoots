module.exports = function (app) {

    var db = require('./dbazure');

    app.post('/register', function (req, res) {

        var sha = require('sha256');

        // Get user credentials from the request
        var user = {
            name: req.body.name,
            //Encripted password sha
            password: sha(req.body.password)
        };

        var userEncontrado = db.BuscaUser(req.body.name);

        var result = {
            ok: true,
            numFilas: userEncontrado
        };

        res.send(result);

    });

}