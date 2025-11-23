import { Router } from "express";
import healthRouter from "./health.route";
import gameRouter from "./game.route";
import authRouter from "./auth.route";
import cartRouter from "./cart.route";
import orderRouter from "./order.routes";
import uploadRouter from "./upload.routes";
import marketingRouter from "./marketing.route";
import homeRouter from "./home.route";
import userRouter from "./user.route";
import priceAlertRouter from "./priceAlert.route";
import notificationRouter from "./notification.route";
import bannerRouter from "./banner.route";
import couponRouter from "./coupon.route";
import reviewRouter from "./review.route";
import analyticsRouter from "./analytics.route";
import profileRouter from "./profile.route";

import categoryRouter from "./category.route";
import gameRequestRouter from "./game-request.route";

import telegramRouter from "./telegram.route";
import homepageSettingsRouter from "./homepageSettings.routes";
import shippingMethodRouter from "./shipping-method.route";

const router = Router();

router.use("/health", healthRouter);
router.use("/games", gameRouter);
router.use("/auth", authRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);
router.use("/upload", uploadRouter);
router.use("/marketing", marketingRouter);
router.use("/home", homeRouter);
router.use("/users", userRouter);
router.use("/price-alerts", priceAlertRouter);
router.use("/notifications", notificationRouter);
router.use("/banners", bannerRouter);
router.use("/coupons", couponRouter);
router.use("/reviews", reviewRouter);
router.use("/analytics", analyticsRouter);
router.use("/profile", profileRouter);
router.use("/categories", categoryRouter);
router.use("/game-requests", gameRequestRouter);

router.use("/telegram", telegramRouter);
router.use("/homepage-settings", homepageSettingsRouter);
router.use("/shipping-methods", shippingMethodRouter);

export default router;
