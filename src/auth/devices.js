const DeviceDetector=require("device-detector-js")
const detectDevice=async function(req,res,next){
    try{
        const deviceDetector=new DeviceDetector()
        const userAgent=req.get('User-Agent');
        const device=deviceDetector.parse(userAgent)
        if(device.os===null){
            req.device={
                name:"Browser"
            }
        }
        req.device={
            name:device.os.name
        }
        next()
    }catch(error){
        next()
    }
}

module.exports=detectDevice