import express from "express";
import userRoutes from "./user/user.route";
import documentRoutes from "./document/document.route";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/documents", documentRoutes);
// router.use("/subscription/webhook", express.raw({ type: "application/json" }));


export default router;
