const express = require('express');
const morgan = require('morgan')
const cookieParser = require("cookie-parser")
const monk = require("monk")
const db = monk("localhost:27017/assignment1")


const app = express();
const port = 8081;

app.use(morgan("combined"))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))

app.use((req, res, next) => {
    req.db = db;
    // console.log(db)
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

app.get("/", (req, res) => {
    res.status(200);
    res.sendFile(__dirname + "/public/albums.html")
});

const findAllFriendsId = (UserList, friends) => { //list of friends usernames
    const friendsInfo = []
    let promiseArr = friends.map((friend) => {
        // Only return the "_id" and "username" of the friend
        return UserList.findOne({"username": friend}, {projection: {"_id": 1, "username": 1}})
        .then(docs => {
            // If friend exists in database then add their id, username to the friends list
            if (docs !== null) {
                friendsInfo.push(docs)
            }
        })
    })
    return Promise.all(promiseArr).then(() => {
        console.log("promise all return: ")
        console.log(friendsInfo)
        return friendsInfo
    })
}

// 1. 
app.get("/load",  (req, res) => {
    // const userId = req.cookies.user_id
    const userId = "63518b01193858d272ad54f7"

    if (userId === undefined) {
        res.send("")
    } else {
        // find username
        const db = req.db;
        const UserList = db.get('userList')
        const friendsInfo = []

        UserList.findOne({"_id": userId})
        .then(async (docs) => {
            findAllFriendsId(UserList, docs.friends)
            .then((friendsInfo) => {
                console.log(friendsInfo)
                res.set("Content-Type", "application/json")
                res.json({friendsInfo: friendsInfo})
            })
        })
        .catch(err => {
            res.send(err)
        })
    }
})

// 2. 
app.post("/login", (req, res) => {
    const {username, password} = req.body
    const UserList = db.get("userList")
    UserList.findOne({username: username, password: password})
    .then(user => {
        if (user === null) {
            res.send("Login failure")
        } else {
            res.cookie("user_id", user._id, {maxAge: 1800000, httpOnly: true})
            const friendsInfo = findAllFriendsId(UserList, user.friends)
            res.json({friends: friendsInfo})
        }
    })
})

// 3. 
app.get("/logout", (req, res) => {
    const user_id = req.cookies.user_id
    if (user_id !== undefined) {
        user_id === undefined
    }
    res.send("")
})

// db.get("mediaList").insert({'url': 'http://localhost:8081/media/1.jpg', 'userid': "63519150193858d272ad54f8", 'likedby':['Kevin','Tom']})
// 4. 
app.get("/getalbum", (req, res) => {
    const db = req.db 
    const MediaList = db.get("mediaList")
    const {userid, pagenum} = req.query
    console.log(userid, pagenum)

    if (userid === "0") {
        userid = req.cookies.user_id
    }

    MediaList.find({"userid": userid}, {limit: 2, projection: {"_id": 1, "url": 1, "likedby": 1}})
    .then(result => console.log(result))
})

// 5.
app.post("/postlike", (req, res) => {
    const db = req.db
    const MediaList = db.get("mediaList")
    const UserList = db.get("userList")
    const username = UserList.findOne({userid: req.cookies.user_id}, {projection: {username: 1}})
    const mediaId = req.body.photovideoid
    
    // update medialist post likes
    MediaList.findOneAndUpdate({_id: mediaId}, {$addToSet: { likedby: username}})
    .then((updatedDoc) => {
        res.set("Content-Type", "application/json")
        res.json(updatedDoc)
    })
})


