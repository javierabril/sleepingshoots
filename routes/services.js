
module.exports = function (app) {

    app.post('/register', function (req, res) {
        // Get user credentials from the request
        var user = {
            name: req.body.name,
            //Encripted password sha
            password: sha(req.body.password)
        };
        /*let newUser = new Users({
            name: user.name,
            password: user.password
        });
        */
        /*
        newUser.save().then(data => {
            let result = { ok: true};
            res.send(result);
        }).catch(error => {
            let result = {
                ok: false,
                error: "User couldn't be registered"
            };
            res.send(result);
        });*/

        var result = { ok: true };
        res.send(user);

    });

}