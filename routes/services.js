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

        var userEncontrado = db.BuscaUser(req.body.name);

        var result = {
            ok: true,
            encontrado: userEncontrado
        };

        res.send(result);

    });

};