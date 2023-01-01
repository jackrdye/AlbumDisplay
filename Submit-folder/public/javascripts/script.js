const loginFormHTML = `
    <form  id="login-form" class="container top-panel-right">
        <div class="input-group">
            <label>username</label>
            <input type="text" name="username" id="username"/>
        </div>
        <div class="input-group">
            <label>password</label>
            <input type="password" name="password" id="password"/>
        </div>
        <button type="submit" id="submitLogin">Log In</button>
    </form>`

const loggedInHTML = (username) => `
    <div class="container top-panel-right">
        <h4>Hello ${username}!</h4>
        <button id="logout-button" onclick="logoutFunction(event)">Logout</button>
    </div>`

const friendAlbumLeftPanelDisplay = (name) => `
    <div class="list-album" name="${name}" id="${name}" onclick="loadAlbum(event, 0)">
        <h3>${name}'s Album</h3>
    </div>`

const myAlbumLeftPanelDisplay = (name) => `
    <div class="list-album" name="${name}" id="${name}" onclick="loadAlbum(event, 0)">
        <h3>My Album</h3>
    </div>`


const displayMediaItem = (mediaTag, likedbyTag, url) => `
    <div id="${url}" class="media-item-container" onclick=loadMediaItem(event)>
        ${mediaTag}
        ${likedbyTag}
    </div>
    `
const generateLikedbyTag = (likedby, mediaType, currentUser) => {
    // console.log(likedby)
    if (likedby.length === 0) {
        return `<p><button class="like-button">Liked</button></p>`
    } else if (likedby.includes(currentUser)){
        return `<p>${likedby.join(", ")} liked the ${mediaType}<button class="like-button">Liked</button></p>`
    } else {
        return `<p>${likedby.join(", ")} liked the ${mediaType}<button class="like-button" onclick=handleLike(event)>Like</button></p>`
    }
}

const handleLike = (event) => {
    event.preventDefault();
    fetch("/postlike", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({photovideoid: event.target.parentElement.parentElement.id})
    })
    .then(updatedMediaDoc => updatedMediaDoc.json())
    .then((updatedMediaDoc) => {
        console.log(updatedMediaDoc)
        const parentDiv = event.target.parentElement.parentElement
        let mediaType;
        if (parentDiv.children[0].tagName === "IMG"){
            mediaType = "photo"
        } else if (parentDiv.children[0].tagName === "VIDEO") {
            mediaType = "video"
        }
        const currentUser = localStorage.getItem("username")
        
        parentDiv.removeChild(parentDiv.lastElementChild)
        parentDiv.insertAdjacentHTML("beforeend", generateLikedbyTag(updatedMediaDoc.likedby, mediaType, currentUser))
    })
    
}

const loadMediaItem = (event) => {
    event.preventDefault()
    const divElement = event.currentTarget
    // const mediaItem = event.currentTarget.children[0]
    const mediaType = divElement.children[0].tagName
    console.log(mediaType, divElement)
    if (mediaType === "VIDEO") {
        return displayVideo(divElement) // pass url 
    } else if (mediaType === "IMG") {
        return displayPhoto(divElement) //pass url
    }
}
// when user clicks on a particular div - enlarge to only that div
const displayPhoto = (divElement) => {
    // remove all other grid items 
    const mediaPage = document.getElementById("media-page")
    while(mediaPage.childElementCount > 1) { // perform removes until only the element the user clicks remains
        Array.from(mediaPage.children).forEach((child) => {
            if (child !== divElement) {
                mediaPage.removeChild(child)
            }
        })
    }    

}
const displayVideo = (divElement) => {
    const mediaPage = document.getElementById("media-page")
    while(mediaPage.childElementCount > 1) { // perform removes until only the element the user clicks remains
        Array.from(mediaPage.children).forEach((child) => {
            if (child !== divElement) {
                mediaPage.removeChild(child)
            }
        })
    }    
}


const submitLogin = (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    // Ensure user has inputed both fields
    if (username === "" || password === "") {
        alert("Please enter username and password")
        return false
    }
    // Send login request to backend
    fetch("http://localhost:8081/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => response.text())
    .then(response => {
        if (response === "Login failure") {
            alert("Login failure")
        } 
        // Successful login
        else {
            response = JSON.parse(response)
            localStorage.setItem("username", username)
            // document.getElementById("login-form").remove()
            // document.getElementById("top-panel").insertAdjacentHTML("beforeend", loggedInHTML(username))
            window.location.replace("http://localhost:8081/")
        }
    })
}

const logoutFunction = (event) => {
    fetch("http://localhost:8081/logout")
    // redirect to home page
    .then(window.location.replace("http://localhost:8081/"))
}

const loadAlbum = (event, page) => {
    event.preventDefault();
    // Handle visual select effect
    const albums = document.getElementById("left-panel").children
    for (var i=0; i<albums.length; i++){
        albums[i].classList.remove("selected-album")
    }
    event.currentTarget.classList.add("selected-album")
    
    // Fetch album data
    const selectedAlbumName = event.currentTarget.id
    // console.log(selectedAlbumName)
    const friendInfo = JSON.parse(localStorage.getItem("album_info"))[selectedAlbumName]
    // console.log(friendInfo)
    fetch(`http://localhost:8081/getalbum?userid=${friendInfo._id}&pagenum=${friendInfo.pagenum}`)
    .then((response) => response.json())
    .then((response) => {
        // Clear exisiting right panel album data
        const mediaPage = document.getElementById("media-page")
        while(mediaPage.firstChild) {
            mediaPage.removeChild(mediaPage.lastChild)
        }
        // Populate right panel with album data
        
        // console.log(response)
        for (var i=1; i < response.length; i++) {
            const item = response[i]
            const mediaType = item.url.split(".").slice(-1).pop()
            const mediaPage = document.getElementById("media-page")
            let mediaTag;
            let likedByTag
            const currentUser = localStorage.getItem("username")

            if (mediaType === "jpg") {
                mediaTag = `<img class="media-item" src="${item.url}"></img>`
                likedByTag = generateLikedbyTag(item.likedby, "photo", currentUser)
            } else if (mediaType === "mp4") {
                mediaTag = `<video class="media-item" src="${item.url}"></video>`
                likedByTag = generateLikedbyTag(item.likedby, "video", currentUser)
            }
            console.log(likedByTag)
            mediaPage.insertAdjacentHTML("beforeend", displayMediaItem(mediaTag, likedByTag, item.url))
            
        }
    })
}



const init = () => {
    fetch("http://localhost:8081/load")
    .then(response => response.text())
    .then(response => {
        // If not logged in
        if (response === "") {
            // Add login form to DOM
            document.getElementById("top-panel").insertAdjacentHTML("beforeend", loginFormHTML)
            // Add submit event listener to login form 
            const form = document.getElementById("login-form")
            form.addEventListener('submit', (event) => submitLogin(event))
        } 
        // If logged in 
        else { 
            response = JSON.parse(response)
            // console.log(response)
            document.getElementById("top-panel").insertAdjacentHTML("beforeend", loggedInHTML(response.username))
            
            // Populate left panel with albums 
            const storage = {}
            storage[response.username] = {pagenum:0, "_id": "0"} //set id to 0 since id is retrieved from cookie
            document.getElementById("left-panel").insertAdjacentHTML("beforeend", myAlbumLeftPanelDisplay(response.username))
            response.friendsInfo.forEach((friend) => {
                storage[friend.username] = {pagenum: 0, "_id": friend._id}
                document.getElementById("left-panel").insertAdjacentHTML("beforeend", friendAlbumLeftPanelDisplay(friend.username))
            })
            // document.getElementById("left-panel").insertAdjacentHTML("beforeend", friendAlbumLeftPanelDisplay("Hey"))
            window.localStorage.setItem("album_info", JSON.stringify(storage))
            
            
        }
    })
    
}


// const form = document.getElementById("user-login")
// console.log(form)



