const express=require("express")
const Task=require("../models/task")
const auth=require("../auth/auth")
const router=new express.Router()

//Creating Task
router.post("/tasks",auth,async (req,res)=>{
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(error){
        res.status(400).send(error)
    }
})

//Reading Task
router.get("/tasks",auth,async(req,res)=>{
    try{
        await req.user.populate({
            path:"tasks",
        }).execPopulate()
        res.status(200).send(req.user.tasks)  
    }catch(error){
        console.log(error)
    }
})

//Updating Task
router.patch("/task/:id",auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=["completed","task"]
    const isMatch=updates.every(element=>allowedUpdates.includes(element))
    
    if(!isMatch){
        return res.send({
            message:"Not Updated!"
        })
    }
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach(update=>task[update]=req.body[update])
        await task.save()
        res.send(task)
    }catch(error){
        res.status(400).send({
            error:error.message
        })
    }
})

//Deleting Task
router.delete("/task/:id",auth,async(req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findOneAndDelete({_id})
        res.send(task)
    }catch(error){
        res.send({
            message:error.message
        })
    }
})


//Delete All
router.delete("/task",auth,async (req,res)=>{
    try{
        await req.user.populate({
            path:"tasks"
        }).execPopulate()
        await Task.deleteMany({owner:req.user._id})        
        res.status(200).send(req.user.tasks)
    }catch(error){
        res.status(500).send(error)
    }
})
module.exports=router
