import express from 'express';
import {
    createRating,
    ratingsForRoomByIdandalsoaverage,
    ratingsForDoctorByIdAndAlsoAverage,
    ratingsForMedicineByIdAndAlsoAverage,
    deleteRatingById,
    updateRatingById
} from '../controllers/rating.controller.js'; // Update this path to your actual controller file
import { verifyJWT_patient } from '../middlewares/auth.middleware.js'; // Update this path to your middleware file

const router = express.Router();

// Route to create a new rating
router.post('/create', verifyJWT_patient, createRating);
//need the id of the room,doctor,medicine and the rating_type in the body



// Route to get ratings for a room by ID along with the average rating
//in the params go the roomid
router.get('/room/:id', ratingsForRoomByIdandalsoaverage);


// Route to get ratings for a doctor by ID along with the average rating
//in the params go the doctorid
router.get('/doctor/:id', ratingsForDoctorByIdAndAlsoAverage);

// Route to get ratings for a medicine by ID along with the average rating
//in the params go the medicineid
router.get('/medicine/:id', ratingsForMedicineByIdAndAlsoAverage);


// Route to delete a rating by ID
router.delete('/delete/:id', verifyJWT_patient, deleteRatingById);

router.put('/update/:id', verifyJWT_patient,updateRatingById );

export default router;
