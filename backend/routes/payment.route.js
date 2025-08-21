import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.contoller.js"

const router = express.Router()
router.post("/create-checkout-session",protectRoute,createCheckoutSession)

router.post("/checkout-success",protectRoute,checkoutSuccess)

export default router