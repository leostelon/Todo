const $descriptionInput=document.getElementById("myText")
const $todoWrapper=document.getElementById("todo-wrapper")
const $addButton=document.getElementById("add-btn")
const $clearAll=document.getElementById("clear-all")
const $logout=document.getElementById("logout")
const $devices=document.getElementById("devices")
const $deviceList=document.getElementById("device-list")
const $bottomMenu=document.getElementById('navbar')
const $modal=document.querySelector("#myModal")
//Templates
/********** */
const $todoTemplate=document.getElementById("new-todo").innerHTML
const $devicesTemplate=document.getElementById("devices-list").innerHTML
const $changepassTemplate=document.getElementById("changepassword")//not added in scripts category in html file
//Functions
/********** */
//Get Description
const description=()=>{
    const input=$descriptionInput.value
    if(!input){
        throw new Error(console.log("please fill something to add to todo"))
    }
    $descriptionInput.value=""
    return input
}

//Getting cookies for Auth
var cookies =document.cookie.split(';').reduce((cookies, cookie) =>{
    const [name, val] = cookie.split( 
        '=').map(c => c.trim());                       
    cookies[name] = val; 
    return cookies; 
},{});

//Getting Todo's from DB
const getTodo=async ()=>{
    const list=await fetch("/tasks",{
        method:"get",
        headers:{
          Authorization:`Bearer ${cookies.Authorization}`
        }
    })
    .then(result=>{
        return result.json()
    }).then(result=>{
        return result
    })
    .catch(error=>{
        alert("Please Login!")
        location.href="/index.html"
        return error
    })
    return list
}

//Task Render Function
function render(){
    $todoWrapper.innerHTML=''
    getTodo().then(result=>{
    result.forEach(element => {
        const html=Mustache.render($todoTemplate,{
            description:element.task,
            id:element._id
        })
        $todoWrapper.insertAdjacentHTML("beforeend",html)
    });
})
}

//Loading ToDo's when page start's up
window.onload=function(){
    render()
}

//Add Botton
$addButton.addEventListener('click',async(event)=>{
    event.preventDefault()
    //Getting values from form
    const input=description()

    //Uploading to mongoDB
    fetch(`/tasks`,{
        method:"post",
        headers:{
            'Content-Type': 'application/json',
            Authorization:`Bearer ${cookies.Authorization}`
        },
        body:JSON.stringify({
            "task":input,
            "completed":false
        })
    }).then(result=>{
        if(result.status===401){
            console.log("error 401")
        }
        return result.json()
    }).then(result=>{
        //Rendering it
        render()  
        console.log("New ToDo is added!!")
    }).catch(error=>{
        console.log(error)
    })
    
})

//Remove Button
$todoWrapper.addEventListener("click",async(event)=>{
    if(event.target.matches(".removeBtn")){
        const id=event.path[1].childNodes[3].attributes[2].value
        try{
            fetch(`/task/${id}`,{
                method:"delete",
                headers:{
                    Authorization:`Bearer ${cookies.Authorization}`
                }
            }).then(result=>{
                console.log("removed")
                render()
            })
        }catch(error){
            console.log(error)
        }
    }
})

// window.addEventListener('load',async()=>{
//     await fetch("/user/me",{
//         headers:{
//             Authorization:`Bearer ${cookies.Authorization}`
//         },
//         method:"PATCH",
//         body:{
//             "password":"newpose"
//         }
//     })
// })

$bottomMenu.addEventListener("click",(event)=>{
    //Forgot Password
    if(event.target.matches("p#forgotpassword")){
        $changepassTemplate.style.display="block";
        $changepassTemplate.addEventListener('click',async (event)=>{
            if(event.target.matches('button#join')){
                console.log("login")
                const newpassword=event.path[1].children[1].value
                try{
                    await fetch("/user/me",{
                        method:"PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization:`Bearer ${cookies.Authorization}`
                          },
                        body: JSON.stringify({
                            password:newpassword
                        })
                    }).then(result=>{
                        if(result.status!==200){
                            return console.log("Something went wrong!")
                        }
                        alert("Password has successfuly changed!")
                        location.href="/index.html"
                    })
                }catch(error){
                    console.log(error)
                }
            }
        })
    }
})

//Clear All
$clearAll.addEventListener("click",async()=>{
    try{
        const clearAll=fetch("/task",{
            method:"delete",
            headers:{
                Authorization:`Bearer ${cookies.Authorization}`
            }
        })
        clearAll.then(result=>{
            render()
        })
        console.log("Cleared all Tasks!")
    }catch(error){
        console.log(error)
    }
})

//Logout
$logout.addEventListener("click",()=>{
    try{
        fetch("/user/logout",{
            method:"post",
            headers:{
                Authorization:`Bearer ${cookies.Authorization}`
            }
        })
        console.log("Logged out!")
    }catch(error){
        console.log(error)
    }
    location.href="/index.html"
})

//Modal
$modal.addEventListener("click",(event)=>{

    // //Logout All
    if(event.target.matches("p#logoutall")){
    try{
        fetch("/user/logoutall",{
            method:"post",
            headers:{
                Authorization:`Bearer ${cookies.Authorization}`
            }
        })
        console.log("Logged out in all devices!")
    }catch(error){
        console.log(error)
    }
    location.href="/index.html"
    }

    //Logout Particular
    if(event.target.matches("p#device-name")){
        const devicename=event.target.innerText
        try{
            fetch(`/user/logout/particular/${devicename}`,{
                method:"post",
                headers:{
                    Authorization:`Bearer ${cookies.Authorization}`
                }
            })
            location.reload()
        }catch(error){
            console.log(error)
        }
    }
})

//Devices List
$devices.addEventListener("click",async()=>{
    $deviceList.innerHTML=""
    await fetch("/devices",{
        method:"get",
        headers:{
            Authorization:`Bearer ${cookies.Authorization}`
        }
    }).then(result=>{
        return result.json()
    }).then(result=>{
        result.forEach(element=>{
            const html=Mustache.render($devicesTemplate,{
                deviceName:element
            })
            $deviceList.insertAdjacentHTML("beforeend",html)
        })
    }).catch(error=>{
        console.log(error)
    })
})


// Get the Devices
var modal = document.getElementById("myModal");
var devices = document.getElementById("devices");
var span = document.getElementsByClassName("close")[0];
devices.onclick = function() {
  modal.style.display = "block";
  span.style.cursor="pointer";
  span.style.border="1px solid black";
  span.style.borderRadius="2px"; 
}
span.onclick = function() {
  modal.style.display = "none";
  window.document.body.style.backgroundColor=""
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}