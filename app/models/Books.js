// get an instance of mongoose and mongoose.Schema
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('books', new Schema({
    author: {
        type: String,
        required: true,
        minlength: 4,
        trim: true
    },
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        max: 5000
    },
    published: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}));