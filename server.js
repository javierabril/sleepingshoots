let debug = require('debug');
let express = require('express');
let bodyParser = require('body-parser');
let sha = require('sha256');
let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let morgan = require('morgan');
let fs = require('fs');



mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/book-service',
    { useMongoClient: true });


const secretWord = "miclave";

let app = express();

app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));


//Assign our created models
let Comments = require('./app/models/Comments');
let Users = require('./app/models/Users');
let Books = require('./app/models/Books');


let generateToken = user => {

    let token = jwt.sign({ id: user._id, name: user.name }, secretWord,
        { expiresIn: "2 years" });
    return token;
};

let validateToken = token => {
    try {
        let result = jwt.verify(token, secretWord);
        return result;
    } catch (e) {
        console.log("Error validating token");
    }
};



app.post('/login', (req, res) => {
    // Get user credentials from the request
    let userClient = {
        name: req.body.name,
        //Encripted password sha
        password: sha(req.body.password)
    };


    // Look for user in the User collection
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


app.post('/register', (req, res) => {
    // Get user credentials from the request
    let user = {
        name: req.body.name,
        //Encripted password sha
        password: sha(req.body.password)
    };
    let newUser = new Users({
        name: user.name,
        password: user.password
    });


    newUser.save().then(data => {
        let result = { ok: true};
        res.send(result);
    }).catch(error => {
        let result = {
            ok: false,
            error: "User couldn't be registered"
        };
        res.send(result);
    });
});

app.get('/books', function (req, res) {
    let token = req.headers['authorization'];
    let result = validateToken(token);
    
    if (result) {
        Books.find({}).then(booksData => {
            if (booksData.length > 0) {
                let result = {
                    ok: true,
                    books: booksData
                };
                res.send(result);
            }
            else {
                let result = {
                    ok: true,
                    books: "No books found"
                };
                res.send(result);
            }

        });
    }
    else {
        res.sendStatus(401);
    }

});   

app.post('/books', function (req, res) {
    let token = req.headers['authorization'];
    console.log(token);
    let result = validateToken(token);
    if (result) {
        let book = {
            author: req.body.author,
            title: req.body.title,
            price: req.body.price,
            published: req.body.published,
            image: req.body.image,
            creator: result.id //we get the userid from decrypted token
        };

        let nameImage = Date.now();
        let urlImg = "img/" + nameImage + ".jpg";

        //Saving img in base 64 to file
        fs.writeFile(urlImg, book.image, 'base64', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        }); 

        let newBook = new Books({
            author: book.author,
            title: book.title,
            price: book.price,
            published: book.published,
            image: urlImg,
            creator: book.creator
        });

        newBook.save().then(data => {
            let result = {
                ok: true,
                book: data
            };
            res.send(result);
        }).catch(error => {
            let result = {
                ok: false,
                error: "Error adding a new book"
            };
            res.send(result);
        });
    }
    else {
        res.sendStatus(401);
    }

});   

app.put('/books/:id', (req, res) => {
    let token = req.headers['authorization'];
    let result = validateToken(token);
    if (result) {

        Books.findById(req.params.id).then(book => {
            if (book) {
                //compare id from token with creator from book
                if (result.id == book.creator) {
                    // Edit information and overwrite the image file if it’s present
                    book.author = req.body.author;
                    book.title = req.body.title;
                    book.price = req.body.price;
                    book.published = req.body.published;
                    //Save image from post on same file
                    fs.writeFile(book.image, req.body.image, 'base64', function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log("The file was overwritten!");
                    });

                    book.save().then(book => {
                        console.log("Book updated");
                        let result = {
                            ok: true,
                            book: book
                        };
                        res.send(result);
                    }).catch(error => {
                        let result = {
                            ok: false,
                            error: "Error updating book"
                        };
                        res.send(result);
                    });

                }
                else //creator is different
                {
                    res.sendStatus(403);
                }
            }
            else
            {
                let result = {
                    ok: false,
                    error: "Error. Book id not found on DB"
                };
                res.send(result);
            }
        }).catch(error => {
            let result = {
                ok: false,
                error: "Error finding book. Check book id"
            };
            res.send(result);
        });

    }
    else { //token is invalid
        res.sendStatus(401);
    }

});   

app.delete('/books/:id', (req, res) => {

    let token = req.headers['authorization'];
    let result = validateToken(token);
    if (result) {

        Books.findById(req.params.id).then(book => {
            if (book) {
                if (result.id == book.creator) {

                    Comments.remove({ book: req.params.id }).then(() => {
                        // Remove the book here
                        Books.remove({ _id: req.params.id }).then(() => {
                            let result = {
                                ok: true
                            };
                            res.send(result);
                        }).catch(error => {
                            let result = {
                                ok: false,
                                error: "Error deleting book " + req.params.id
                            };
                            res.send(result);
                        });

                        //remove image from fs
                        fs.unlink(book.image, function (err) {
                            if (err) {
                                return console.log(err);
                            }

                            console.log("The file was deleted!");
                        });

                    }).catch(error => {
                        let result = {
                            ok: false,
                            error: "Error deleting comments from book " + req.params.id
                        };
                        res.send(result);
                    });
                }
                else //creator is different
                {
                    res.sendStatus(403);
                }
            }
            else
            {
                let result = {
                    ok: false,
                    error: "Error. Book id not found on DB"
                };
                res.send(result);
            }

            }).catch(error => {
                let result = {
                    ok: false,
                    error: "Error finding book, check book id"
                };
                res.send(result);
            });

    }
    else { //token is invalid
        res.sendStatus(401);
    }
}); 

app.get('/comments/:bookId', (req, res) => {

    let token = req.headers['authorization'];
    let result = validateToken(token);
    if (result) {

        Comments.find({
            book: req.params.bookId
        }).populate('user').then(data => {
            //If finds any comment
            if (data.length > 0) {
                let result = { ok: true, comments: data };
                res.send(result);
            }
            else
            {
                let result = {
                    ok: false,
                    error: "Error getting comments for book: " + req.params.bookId
                };
                res.send(result);
            }

        }).catch(error => {
                let result = {
                    ok: false,
                    error: "Error getting comments for book: " + req.params.bookId
                };
                res.send(result);
        });

    }
    else { //token is invalid
        res.sendStatus(401);
    }

}); 

app.post('/comments/:bookId', (req, res) => {

    let token = req.headers['authorization'];
    let result = validateToken(token);
    if (result) {
        
        Books.findById(req.params.bookId).then(bookfound => {

            if (bookfound) {

                let newComment = new Comments({
                    score: req.body.score,
                    book: req.params.bookId,
                    user: result.id,
                    text: req.body.text
                });

                newComment.save().then(comment => {
                    let result = {
                        ok: true,
                        comment: comment
                    };
                    res.send(result);
                }).catch(error => {
                    let result = {
                        ok: false,
                        error: "Error adding a comment for book: " + req.params.bookId
                    };
                    res.send(result);
                });
            }
            else
            {
                let result = {
                    ok: false,
                    error: "Error adding comment. Book id " + req.params.bookId + " not found on DB"
                };
                res.send(result);
            }
        }).catch(error => {
            let result = {
                ok: false,
                error: "Error adding a comment for book: " + req.params.bookId
            };
            res.send(result);
        });
    }
    else { //token is invalid
        res.sendStatus(401);
    }

}); 


app.listen(8080);
