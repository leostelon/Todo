const express=require("express")
const User=require("../models/user")
const Device=require("../models/device")
const auth=require("../auth/auth")
const detect=require("../auth/devices")
const multer=require("multer")
const cookiesParser=require("cookie-parser")

const router=new express.Router()

const app=express()
app.use(cookiesParser())
app.use(auth)

//Create User
router.post("/user",detect,async(req,res)=>{
    try{
        const user=new User(req.body)
        const token=await user.generateAuthToken()
        const deviceDetails={
            name:req.device.name,
            tokens:{
                token,
                owner:user._id,
            }
        }
        const device=new Device({name:deviceDetails.name})
        await device.detectDevice(user._id,req.device.name,deviceDetails.tokens)
        await user.save()

        res.cookie("Authorization",token)
        res.status(201).send({user,token})
    }catch(error){
        res.status(500).send(error)
    }
})

//Login User 
router.post("/user/me",detect,async (req,res)=>{
    try{
        const user=await User.findUserByData(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        const deviceDetails={
            name:req.device.name,
            tokens:{
                token,
                owner:user.tokens[user.tokens.length-1]._id,
            }
        }
        const device=new Device({name:deviceDetails.name})
        await device.detectDevice(user._id,req.device.name,deviceDetails.tokens)

        res.cookie("Authorization",token)
        res.status(200).send({user,token})

    }catch(error){
        console.log(error)
        res.status(404).send(error.message)
    }
})

//Read User
router.get("/user/me",auth,(req,res)=>{
    res.send(req.user);
})

//Update User
router.patch("/user/me",auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=["username","email","password","avatar"]
    const isValidUpdate=updates.every(element=> allowedUpdates.includes(element))

    if(!isValidUpdate){
        res.status(400).send("Please provide proper updates")
    }

    try{
        updates.forEach(element => {
            req.user[element]=req.body[element]
        });
        if(updates.includes('password')){
            req.user.tokens=[]
        }
        res.send(req.user)
        await req.user.save()
    }catch(error){
        res.status(500).send(error)
        console.log(error)
    }
})

//Logout User
router.post("/user/logout",auth,async(req,res)=>{
    try{
        req.user.tokens.forEach((element,index) => {
            if(element.token===req.token){
                req.user.tokens.splice(index,1)
            }
        })
        res.send({token:req.token,user:req.user})
        await req.user.save()
    }catch(error){
        res.send(error)
    }
})

//Logout All Users
router.post("/user/logoutall",auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        req.user.devices=[]
        await Device.deleteMany({})
        await req.user.save()
        res.send({
            message:"Logged out of all devices!",
        })
    }catch(error){
        res.send({
            message:error
        })
    }
})

//Logout Particular
router.post("/user/logout/particular/:devicename",auth,async(req,res)=>{
    const devicename=req.params.devicename

    //To get Device document based on params
    const deviceTokens=await Device.findOne({"name":devicename})
    //To get tokens based on Device obtained(tokens array inherits array properties)
    const deviceTokenList=deviceTokens.tokens.map(element=>{
        if(element.token){
            return element
        }
    })
    //Checking if device exist's
    if(deviceTokenList){
        //retrieving all tokens from user as tokens array inherits all array properties
        const tokenList=req.user.tokens.map(element=>{
            const test=Boolean(element.token)
            return element.token
        })
        //Removing all tokens from user tokens documnet
        deviceTokenList.forEach(async (element,index)=>{
            req.user.tokens.pull(element.owner)
            })
        await req.user.save()
        await Device.deleteMany({"name":devicename})
        res.send("Removed account from device")
    }else{
        res.send("no device found")
    }
})

//Get Devices
router.get("/devices",auth,async(req,res,next)=>{
    try{
        const deviceData=await Device.find({})
        const deviceNameList=deviceData.map(element=>element.name)
        res.status(200).send(deviceNameList)
    }catch(error){
        res.status(500).send(error)
    }
})

//Delete User
router.delete("/user/delete",auth,async (req,res)=>{
    try{
        const user=await req.user.remove()
        res.send(user)
    }catch(error){
        res.status(500).send(error.message)
    }    
})


//multer
const upload=multer({
    dest:"/uploads",
    storage:multer.memoryStorage()
})


//Uploading Avatar
router.post("/avatar",auth,upload.single("avatar"),async(req,res)=>{
    try{
        req.user.avatar.data=req.file.buffer
        req.user.avatar.contentType="image/png"
        res.status(201).send({message:"Uploaded image!",image:req.user.avatar})
        await req.user.save()
    }catch(error){
        console.log(error)
    }
})


//Reading Avatar
router.get("/avatar",auth,async (req,res)=>{
    try{
        res.contentType(req.user.avatar.contentType);
        res.send(req.user.avatar.data);
    }
    catch(error){
        res.send(error)
    }
})

module.exports=router