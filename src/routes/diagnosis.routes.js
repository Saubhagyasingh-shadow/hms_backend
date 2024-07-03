import express from 'express';
import {
  createDiagnosis,
  deleteAllDiagnosis,
  deleteDiagnosisById,
  getDiagnosisById,
  getalldiagnosis,
  getalldiagnosisforapatient,
  updateDiagnosis
} from '../controllers/diagnosis.controller.js'; // Make sure to update this path to your actual controller file

const router = express.Router();

// Route to create a new diagnosis
router.post('/create/:appointmentID', createDiagnosis);///

// Route to get a diagnosis by ID
router.get('/getbyid/:id', getDiagnosisById);////

// Route to get all diagnoses
router.get('/getall', getalldiagnosis);///
// Route to get all diagnoses for a specific patient,patientid is passed in the URL
router.get('/patient/:id', getalldiagnosisforapatient);//not need it storing all the diagnosises in the array of patient//


// Route to update a diagnosis (with the assumption that face recognition logic is implemented in the controller)id is of diagnosis here 
router.put('/update/addmedicines/:id', updateDiagnosis);

router.delete('/deleteall',deleteAllDiagnosis);///
router.delete('/deletebyid/:id',deleteDiagnosisById);

export default router;
