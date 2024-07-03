import mongoose from "mongoose";

// Define the sub-schema for changesby
const changeSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    quantityChanged: {
        type: Number,
        required: true
    }
}, { _id: false });

// Define the main medicine schema
const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true ,unique:true},
    manufacturer: { type: String, required: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    reorderLevel: { type: Number },
    price: { type: Number, required: true },
    dosageperday: { type: Number, required: true },
    changesby: [changeSchema]
}, { timestamps: true });

export const Medicine = mongoose.model('Medicine', medicineSchema);

