const path=require("path")
const express=require("express")
const http=require("http")
const User=require("./routers/user")
const Task=require("./routers/task")

// const reload=require("reload")

const app=express()

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath));


app.use(express.json())
app.use(User)
app.use(Task)

const port=process.env.PORT || 3000

const server=http.createServer(app)

server.listen(port,(req,res)=> {
    console.log("Server is up on "+port)
})

reload(app)