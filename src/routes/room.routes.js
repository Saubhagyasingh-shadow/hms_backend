import express from 'express';
import {upload} from "../middlewares/multer.middleware.js"
import {
    createRoom,
    updateRoom,
    updateRoomPic,
    getroombyid,
    getAllRooms,
    getAvailableRooms,
    getPatientbyEmail
} from './../controllers/room.controller.js'; // Update this path to your actual controller file
import { verifyJWT_doctor } from '../middlewares/auth.middleware.js'; // Update this path to your staff JWT middleware file

const router = express.Router();

// Route to create a new room
router.route("/create").post(
    upload.fields([{name: "roomImage",maxCount:1}]) , createRoom);

// Route to update a room by ID
router.put('/update/:id', updateRoom);

// Route to update room picture by ID
router.put('/updatepic/:roomId', upload.single('roomImage'), updateRoomPic);

router.post('/getpatientinroom',getPatientbyEmail)
// Route to get a room by ID
router.get('/get/:id', getroombyid);

// Route to get all rooms
router.get('/getall', getAllRooms);

// Route to get available rooms by status,status in the body
router.post('/available', getAvailableRooms);

export default router;
