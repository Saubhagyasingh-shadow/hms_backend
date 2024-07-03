import { Timestamp } from "mongodb";
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const doctorSchema = new Schema(
    {
        doctorname: {
            type : String,
            required : true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email :{
            type : String,
            required : true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName: {
            type : String,
            required : true,
            trim:true,
            index:true           
        },
        department: { type: String, required: true },
        avatar: {
            type: String,
            required: true,
        },
        coverImage : {
            type:String,
        },
        password: {
            type: String,
            required: [true,'password is required'],
        },
        refreshToken: {
            type: String
        },
        role:{
            type:String,
            enum:['doctor','admin','compounder','receptionist','nurse'],
            default:'nurse'
        },
        totalLeaveinaYear: {
         type: Number,
         required:true}
    },
    {
        timestamps: true
    }
)


//lets pre hook bcrypt to save the data encrypted before saving 
doctorSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()//this is to make sure it does not run when the user changes his/her id
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

//lets make a method and insert it in the schema 
doctorSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

doctorSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            doctorname: this.doctorname,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
doctorSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Doctor = mongoose.model('Doctor',doctorSchema)
