module.exports = function (app) {

    app.post('/register', function (req, res) {

        var sha = require('sha256');

        // Get user credentials from the request
        var user = {
            name: req.body.name,
            //Encripted password sha
            password: sha(req.body.password)
        };

        var result = { ok: true };
        res.send(user);

    });

}