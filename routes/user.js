module.exports = function User(data) {

    var username = data.username;
    var pass = data.pass; 
    var existeUser = false;

    function privateFunc() {

    }

    return {
        login: function (cb) {
            db.doStuff(username, pass, cb);
        }
    };
};