import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import ordersRouter from "./orders";
import dealerRouter from "./dealer";
import distributorRouter from "./distributor";
import adminRouter from "./admin";
import bannersRouter from "./banners";
import addressesRouter from "./addresses";
import siteContentRouter from "./siteContent";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(ordersRouter);
router.use(dealerRouter);
router.use(distributorRouter);
router.use(adminRouter);
router.use(bannersRouter);
router.use(addressesRouter);
router.use(siteContentRouter);
router.use(storageRouter);

export default router;
