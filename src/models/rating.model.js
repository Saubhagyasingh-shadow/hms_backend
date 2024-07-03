// models/Rating.js
import mongoose, { Schema } from "mongoose";

// Define the schema for ratings
const ratingSchema = new Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    rating_type: {
        type: String,
        enum: ['Doctor', 'Room', 'Medicine'],
        required: true
    },
    type_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'rating_type',
        required: true
    },
    rating_value: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, {
    timestamps: true
});

// Create the model from the schema and export it
export const Rating = mongoose.model('Rating', ratingSchema);
