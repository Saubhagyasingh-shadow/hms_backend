import { Timestamp } from "mongodb";
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const billsSchema = new Schema(
    {
      
       diagnosisID: {
               type:Schema.Types.ObjectId,
                ref:'Appointment',
                unique:true
       },
       patientId: {
        type:Schema.Types.ObjectId,
         ref:'Patient',
    },
    deadline:{
        type:Number,
        required:true}, 
    address:{
            type:String,
            required:true
        },
        paid:{
            type:Boolean,
            default:false
        }

    },{
        timestamps: true
    }
)


export const Bill2 = mongoose.model('Bill2',billsSchema)