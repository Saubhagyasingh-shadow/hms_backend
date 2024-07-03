import { Timestamp } from "mongodb";
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    type: { type: String, enum: ['General', 'ICU', 'Private'], required: true, default: 'General' },
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], required: true, default: 'Available' },
    assignedPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    roomImage : {
        type:String,
        required:true
    },
    patientEmail:{
        type:String
    }
}, { timestamps:
     true });

export const Room = mongoose.model('Room', roomSchema);
