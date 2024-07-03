import { Timestamp } from "mongodb";
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const diagnosisSchema = new Schema(
    {
        diagnosis: {
            type : String,
            required : true,
           
        },
       appointmentID: {
               type:Schema.Types.ObjectId,
                ref:'Appointment',
                unique:true
       },
        medicines :[
            {
                type:Schema.Types.ObjectId,
                ref:'Medicine'
            }
        ],
        diagnosisfee: {
            type: Number,
            required: [true,'fee byy doctor is required'],
        },
      
    },
    {
        timestamps: true
    }
)


export const Diagnosis = mongoose.model('Diagnosis',diagnosisSchema)
