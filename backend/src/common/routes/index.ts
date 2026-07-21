import { Router } from "express";
import adoptionRoutes from "@/features/adoption/adoption.route";
import authRoutes from "@/features/auth/auth.route";
import donationRoutes from "@/features/donation/donation.route";
import reportRoutes from "@/features/report/reports.route";
import volunteerRoutes from "@/features/volunteer/volunteer.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/reports", reportRoutes);
router.use("/donation", donationRoutes);
router.use("/adoptions", adoptionRoutes);
router.use("/volunteers", volunteerRoutes);

export default router;
