const express = require('express');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const path = require('path');

const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const conPool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'data_schema'
});

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/views/index.html'));

});

app.post('/login', (req, res) => {
    console.log(req.body);

    if(req.body.action === 'login'){
        // VULNERABLE TO SQL INJECTION
        conPool.query(`select * from users where username = "${req.body.username}" and password = "${req.body.password}"`, (err, result) => {
            if(err) throw err;
            if(result.length === 0){
                res.send("this user doesn't exist");
                console.log(`${req.body.username} doesn't exist`);
            } else {
                res.send(`Successfull login! Hello, ${result[0].username}`);
                console.log(req.body.username, ' exists!');
            }
        });
    }
    if(req.body.action === "register") {
        conPool.query(`insert into users (username, password, access) values ("${req.body.username}", "${req.body.password}", "0")`, (err, result) => {
            if(err) throw err;
            res.send('SUCCESSFULLY REGISTERED!');
        });
    }

})

app.listen(process.env.PORT || 3000, () => console.log('App Avaliable on http://localhost:3000'));
