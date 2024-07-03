import { Timestamp } from "mongodb";
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique:true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
}, { timestamps: true });

export const Department = mongoose.model('Department', departmentSchema);
