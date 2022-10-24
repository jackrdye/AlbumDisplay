// submit login
const form = document.getElementById("user-login")
console.log(form)

document.getElementById("submitLogin").addEventListener('submit', (event) => {
    event.preventDefault()
    // validate
    console.log("yay")
    alert("hey there")
    // fetch()
    // .then(response => response.json())
    // .then(response => {
        
    // }) 

})

export const submitLogin = (event) => {
    console.log("hey")
    event.preventDefault();
    console.log("yay");
    alert("hey there");
}