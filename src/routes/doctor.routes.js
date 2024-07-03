import { registerdoctor,
    logindoctor,
    logoutdoctor,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentdoctor,
    updateAccountDetails,
    updatedoctorAvatar,
    updateUserCoverImage,
    getAllDoctor,
    getdoctorById} from "../controllers/doctor.controller.js";
    import { Router } from "express";
    import {upload} from "../middlewares/multer.middleware.js"
    import { verifyJWT_doctor } from "../middlewares/auth.middleware.js";

    
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
    registerdoctor
    )///

router.route("/login").post(logindoctor)///

//secured routes
router.route("/logout").post(verifyJWT_doctor,  logoutdoctor)///

router.route("/refresh-token").post(refreshAccessToken)///

router.route("/change-password").post(verifyJWT_doctor, changeCurrentPassword)///

router.route("/current-doctor").get(verifyJWT_doctor, getCurrentdoctor)///
router.route("/getbyid/:id").get( getdoctorById)///
router.route("/update-account").patch(verifyJWT_doctor, updateAccountDetails)///

router.route("/avatar").patch(verifyJWT_doctor, upload.single("avatar"), updatedoctorAvatar)///
router.route("/cover-image").patch( upload.single("coverImage"), updateUserCoverImage)///
router.route("/alldoctor").get(
    getAllDoctor
)
// router.route("/c/:username").get(verifyJWT_doctor, getUserChannelProfile)
// router.route("/history").get(verifyJWT_doctor, getWatchHistory)

export default router