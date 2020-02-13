require("../db/mongoose")
const mongoose=require('mongoose')

const DeviceSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    tokens:[
        {
            token:{
                type:String,
                ref:"User",
            },
            owner:{
                type:String,
                ref:"User"
            }
        }
    ]}
)

DeviceSchema.methods.detectDevice=async function(owner,name,token){
    const device=this  
    const deviceExist=await Device.findOne({"name":name})
    if(deviceExist){
        deviceExist.tokens=deviceExist.tokens.concat(token)
        await deviceExist.save()
    }else{
        device.tokens=device.tokens.concat(token)
        await device.save()
    }
}
    
const Device=new mongoose.model("Device",DeviceSchema)

module.exports=Device