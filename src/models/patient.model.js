import { Timestamp } from "mongodb";
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const patientSchema = new Schema(
    {
        patientname: {
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
        avatar: {
            type: String,
            required: true,
        },
        coverImage : {
            type:String,
        },
        medicalHistory :[
            {
                type:Schema.Types.ObjectId,
                ref:'diagnosis'
            }
        ],
        password: {
            type: String,
            required: [true,'password is required'],
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)


//lets pre hook bcrypt to save the data encrypted before saving 
patientSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()//this is to make sure it does not run when the user changes his/her id
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

//lets make a method and insert it in the schema 
patientSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

patientSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            patientname: this.patientname,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
patientSchema.methods.generateRefreshToken = function(){
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

export const Patient = mongoose.model('Patient',patientSchema)
