require("../db/mongoose")
const mongoose=require("mongoose")

const TaskSchema=new mongoose.Schema({
    task:{
        type:String,
        required:true
    },
    completed:{
        type:Boolean,
        required:true
    },
    owner:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"User"
    }},
    {
        timestamps:true
    }
)

const Task=new mongoose.model("Tasks",TaskSchema)

module.exports=Task
