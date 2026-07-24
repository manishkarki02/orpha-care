import { Router } from "express";
import adoptionRoutes from "@/features/adoption/adoption.route";
import authRoutes from "@/features/auth/auth.route";
import donationRoutes from "@/features/donation/donation.route";
import kidsRoutes from "@/features/kids/kids.route";
import reportRoutes from "@/features/report/reports.route";
import volunteerRoutes from "@/features/volunteer/volunteer.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/reports", reportRoutes);
router.use("/donations", donationRoutes);
router.use("/adoptions", adoptionRoutes);
router.use("/volunteers", volunteerRoutes);
router.use("/kids", kidsRoutes);

export default router;
