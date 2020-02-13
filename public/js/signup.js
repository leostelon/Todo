//DOM selectors
const $centeredForm=document.querySelector(".centered-form__box")
const $errorList=document.getElementById("error-wrap")

//template
const $errorTemplate=document.getElementById("error-message").innerHTML

$centeredForm.addEventListener("click",async (event)=>{
    event.preventDefault()
    console.log(event)
    if(event.target.matches("button#join")){
        //User Credentials
        const email=event.srcElement.parentNode.elements[0].value
        const username=event.srcElement.parentNode.elements[1].value
        const password=event.srcElement.parentNode.elements[2].value
        
        //Creating User
        try{
            await fetch("/user",{
                method:"post",
                headers:{
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    email,
                    username,
                    password
                })
            }).then(async (result)=>{
                const message=await result.json()
                if(result.status===500){
                    $errorList.innerText=""
                    const validationErrors=[]
                    for(prop in message.errors){
                        validationErrors.push(prop)
                    }
                    validationErrors.forEach(element=>{
                        const html=Mustache.render($errorTemplate,{
                            message:element
                        })
                        $errorList.insertAdjacentHTML("afterbegin",html)
                    })
                    throw new Error("Couldn't create an account!") 
                }
                location.href="/todo.html"  
            })  
            }catch(error){
                console.log(error.message)
            }
    }

    //login link
    if(event.target.matches("a#loginlink")){
        location.href='/index.html'
    }
})