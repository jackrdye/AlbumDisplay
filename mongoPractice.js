const express = require('express');
const morgan = require('morgan')
const cookieParser = require("cookie-parser")
const monk = require("monk")
const db = monk("172.26.64.1:27017/assignment1")

db.then(()=> {
    console.log("connected to server")
})

const app = express();
const port = 8081;

app.use(morgan("combined"))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))

app.use((req, res, next) => {
    req.db = db;
    console.log(db)
    next();
})

app.listen(port, (error) => {
    if(!error) {
        console.log("Server is Successfully Running, and App is listening on port " + port)
        console.log("Open at http://localhost:8081")
    } else {
        console.log("Error occured, server can't statrt", error)
    }
})

// db.userList.insert({'username': 'Jack', 'password': '123456', 'friends':['Kevin', 'Blake', 'Tom']})



