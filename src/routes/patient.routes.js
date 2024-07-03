import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT_patient } from "../middlewares/auth.middleware.js";
import {
    registerPatient,
    loginpatient,
    logoutPatient,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentPatient,
    updateAccountDetails,
    updatePatientAvatar,
    updateUserCoverImage,
    authenticateUser,
    getPatientById,
    getAllPatient,
    // getUserChannelProfile,
    // getWatchHistory
} from '../controllers/patient.controller.js';

    
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerPatient
    )///

router.route("/login").post(loginpatient)///

//secured routes
router.route("/logout").post(verifyJWT_patient,  logoutPatient)///
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT_patient, changeCurrentPassword)///

router.route("/current-user").get(verifyJWT_patient, getCurrentPatient)///
router.route("/update-account").patch(verifyJWT_patient, updateAccountDetails)///

router.route("/avatar").patch(verifyJWT_patient, upload.single("avatar"), updatePatientAvatar)///
router.route("/cover-image").patch(verifyJWT_patient, upload.single("coverImage"), updateUserCoverImage)///

router.route("/getbyid/:id").get( getPatientById)///
router.route("/allpatient").get(
    getAllPatient
)
router.route("/authenticate").get(verifyJWT_patient,authenticateUser);

// router.route("/c/:username").get(verifyJWT_doctor, getUserChannelProfile)
// router.route("/history").get(verifyJWT_doctor, getWatchHistory)

export default router