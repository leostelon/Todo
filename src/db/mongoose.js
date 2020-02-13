const mongoose=require("mongoose")

mongoose.connect(String(process.env.MONGODB_URL),{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
})