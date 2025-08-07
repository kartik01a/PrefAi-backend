import express from "express";
import userRoutes from "./user/user.route";
import documentRoutes from "./document/document.route";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/documents", documentRoutes);

export default router;
