// get an instance of mongoose and mongoose.Schema
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('users', new Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        match: /^[a-zA-Z0-9]+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 4
    }
}));