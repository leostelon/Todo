require("../db/mongoose")
const mongoose=require('mongoose')

const DeviceSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    devices:[{
        devicename:{
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
        ]
    }]    
})

DeviceSchema.methods.detectDevice=async function(devicename,devicedetails,token){
    const device=this

    //Getting device tokens from given device name
    const deviceTokens=device.devices.find(element=>element.devicename===devicename)
    
    //Adding new device into device list if none is present
    if(!deviceTokens){
        device.devices.push(devicedetails)
        return await device.save()
    }
    
    //Pushing tokens into existing device
    deviceTokens.tokens.push(token)
    await device.save()
}
    
const Device=new mongoose.model("Device",DeviceSchema)

module.exports=Device