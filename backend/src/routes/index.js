import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import weddingRoutes from "../modules/weddings/wedding.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/weddings", weddingRoutes);

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is healthy", data: { uptime: process.uptime() } });
});

export default router;
