require("../db/mongoose")
const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")
var uniqueValidator = require('mongoose-unique-validator');

const jsw=require("jsonwebtoken")

const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    tokens:[
        {
            token:{
                type:String
            }
        }
    ],
    avatar:{
        data:Buffer,
        contentType:String
    }
},
    {
        timestamps:true
})

UserSchema.virtual("tasks",{
    ref:"Tasks",
    localField:"_id",
    foreignField:"owner"
})

UserSchema.virtual("device",{
    ref:"Device",
    localField:"_id",
    foreignField:"owner"
})

UserSchema.pre("save",function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password=bcrypt.hashSync(this.password,8)
    next()
})

UserSchema.methods.comparePassword=function(password,callback){
    const match=bcrypt.compareSync(password,this.password)
    if(!match){
        callback()
    }
    next()
}

UserSchema.statics.findUserByData=async (email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error("No user found by the given Email!")
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Sorry wrong password!")
    }
    return user
}

UserSchema.methods.generateAuthToken=async function (){
    const user=this
    const token=jsw.sign({_id:user._id},"bvrcorp")
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

UserSchema.plugin(uniqueValidator);

const User=new mongoose.model("User",UserSchema)

module.exports=User
