import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import businessProfilesRouter from "./business-profiles";
import cardsRouter from "./cards";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";
import supportRouter from "./support";
import subscriptionsRouter from "./subscriptions";
import publicRouter from "./public";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(businessProfilesRouter);
router.use(cardsRouter);
router.use(analyticsRouter);
router.use(aiRouter);
router.use(supportRouter);
router.use(subscriptionsRouter);
router.use(publicRouter);
router.use(adminRouter);

export default router;
