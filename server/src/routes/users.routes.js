import { Router } from "express";
import { login, register, createMeeting, validateMeeting, getUserHistory, deleteMeetingHistory } from "../controllers/user.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/new-meeting", authUser, createMeeting);
router.get("/validate-meeting/:meetingCode", authUser, validateMeeting);
router.get("/user-history", authUser, getUserHistory);
router.delete("/delete-meeting/:meetingId", authUser, deleteMeetingHistory);

export default router;