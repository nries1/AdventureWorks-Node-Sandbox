var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
const express = require('express');
const app = express();
const formidable = require('formidable');
const fs = require('fs');
app.use(express.json())
const port = process.env.PORT || 3000;
var connection;

//serve home html
app.get('/', (req,res) => {
    res.sendFile(__dirname+'/public/views.html', err=> {
        err ? res.send(err) : console.log("request "+req.url+" fulfilled");
    });
});
app.get('/query', (req,res) => {
    res.sendFile(__dirname+'/public/query-staging.html', err=> {
        err ? res.send(err) : console.log("request "+req.url+" fulfilled");
    });
});

//handle sign in
app.post('/signin',(req,res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err,fields,files) => {
        err ? res.send(err) : console.log(fields);
        config.authentication.options.userName=fields.username;
        config.authentication.options.password=fields.password;
        config.server=fields.servername;
        config.options.database=fields.database;
        initConnect(config,res);
    });
});

//handle query submits
app.post('/submit-query',(req,res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err,fields,files) => {
        err ? res.send(err) : console.log(fields);
        queryDatabase(fields.query,res);
    });
});

// Create connection to database
var config =
{
    authentication: {
        options: {
            userName: '', // update me
            password: '' // update me
        },
        type: 'default'
    },
    server: '', // update me
    options:
    {
        database: 'upl-poc', //update me
        encrypt: true
    }
}

//Attempt connection with no query
const initConnect = (configObj,response) => {
    connection = new Connection(configObj);
    connection.on('connect', err => err ? response.send(err) : response.sendFile(__dirname+'/public/query-staging.html', err=> {
        err ? response.send(err) : console.log("Connected to SQL server.");
    }));
}

// Attempt to connect and execute queries if connection goes through
/*connection.on('connect', function(err)
    {
        if (err)
        {
            console.log(err)
        }
        else
        {
            queryDatabase()
        }
    }
);*/

function queryDatabase(req,res) {
    var queryResult = [];
    console.log('Reading rows from the Table...');
    // Read all rows from table
    var request = new Request(req,
        function(err, rowCount, rows) {
            console.log("request cb fired");
            if (err) {console.log(err)}
            console.log(rows);
            console.log(rowCount + ' row(s) returned');
            //process.exit();
            res.send(queryResult.join("\n"));
        }
    );

    request.on('row', function(columns) {
        columns.forEach(function(column) {
            queryResult.push(column.value);
            console.log("%s\t%s", column.metadata.colName, column.value);
        });
    });
    connection.execSql(request);
}

app.listen(port);
console.log("listening at "+port)


//default request         "SELECT TOP 20 pc.Name as CategoryName, p.name as ProductName FROM [SalesLT].[ProductCategory] pc "
//            + "JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid"
//SELECT Name FROM [SalesLT].[ProductCategory]
//