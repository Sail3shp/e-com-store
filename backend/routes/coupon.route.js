import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { getCoupon,validateCoupon } from "../controllers/coupon.contoller.js"

const router = express.Router()
router.get("/",protectRoute,getCoupon)
router.get("/validate",protectRoute,validateCoupon)

export default router 