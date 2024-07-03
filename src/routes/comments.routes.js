import express from 'express';
import {
    createCommentByPatient,
    getAllCommentsforAPatient,
    getAllCommentsforADoctor,
    updateComment,
    deleteComment
} from '../controllers/comments.controller.js'; // Update this path to your actual controller file
import { verifyJWT_patient } from '../middlewares/auth.middleware.js'; // Update this path to your middleware file
import { verifyJWT_doctor } from '../middlewares/auth.middleware.js'; // Update this path to your middleware file

const router = express.Router();

// Route to create a comment by a patient
router.post('/patient', verifyJWT_patient, createCommentByPatient);


// Route to get all comments for a specific patient (accessible by both patients and staff)
router.get('/doneby/patient', verifyJWT_patient, getAllCommentsforAPatient); // For patients,from the request body by jwt
router.post('/patient/staff', verifyJWT_doctor, getAllCommentsforAPatient); // For staff ,in the body the id of patient is required



// Route to get all comments for a specific doctor (accessible by doctors and staff)
router.get('/getallcomments/doctor', verifyJWT_doctor, getAllCommentsforADoctor); // For doctors

router.post('/getall/doctor/seebypatient', getAllCommentsforADoctor); // For staff,not needed,doctorid in the body



// Route to update a comment
router.put('/update/:id', verifyJWT_patient, updateComment); // Assuming only patients can update their own comments

// Route to delete a comment
router.delete('/delete/:id', verifyJWT_patient, deleteComment); // Assuming only patients can delete their own comments

export default router;
