var Connection = require('tedious').Connection;  
    var config = {  
        userName: 'portalsanviweb',  
        password: 'SYadmin-11',  
        server: 'sleepingshoots.database.windows.net',  
        // If you are on Microsoft Azure, you need this:  
        options: {encrypt: true, database: 'ssdb'}  
    };  
    var connection = new Connection(config);  
    connection.on('connect', function(err) {  
    // If no error, then good to proceed.  
        console.log("Connected");  
    });  