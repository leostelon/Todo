const $formwrapper=document.querySelector(".centered-form__box")
const $email=document.getElementById("email-field")
const $password=document.getElementById("password-field")

//Rendering error
const error = document.createElement("p")

document.getElementById("join").addEventListener("click",async (event)=>{
    event.preventDefault()

    error.innerText=""

    
    const email=$email.value
    const password=$password.value
    
    try{
        
        const login=await fetch('/user/me',{
            method:"post",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        })

        
        if(login.status!==200){
            error.innerText="Check your username and password and try again."
            $formwrapper.insertAdjacentElement("beforeend",error)
            throw new Error("cant login!")             
        }
        location.href="/todo.html"
    }catch(error){
        console.log(error.message)
    }
})
