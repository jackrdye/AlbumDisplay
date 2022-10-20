const express = require('express');
const morgan = require('morgan')

const app = express();
const port = 3000;

app.use(morgan("combined"))
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))

app.listen(port, (error) => {
    if(!error) {
        console.log("Server is Successfully Running, and App is listening on port " + port)
        console.log("Open at http://localhost:3000")
    } else {
        console.log("Error occured, server can't statrt", error)
    }
})

app.get("/", (req, res) => {
    res.status(200);
    res.sendFile(__dirname + "/public/albums.html")
});

app.get("/hello", (req, res) => {
    res.set("Content-Type", 'text/html');
    res.status(200).send("<h1>Hello Jackkkk!</h1>")
});


app.post("/", (req, res) => {
    const {name} = req.body;
    // console.log(name)
    // console.log(req.body)
    res.set("Content-Type", "text/plain")
    res.send(`Welcome ${name}`)
})




