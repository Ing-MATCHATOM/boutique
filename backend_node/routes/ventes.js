import express from "express";
import {
  pageVente,
  traiterVente,
  detailsVente,
  ajouterPaiement
} from "../controllers/ventesController.js";

const router = express.Router();

router.get("/", pageVente);
router.post('/traiter', traiterVente);
router.get("/:id", detailsVente);
router.post("/:id/paiement", ajouterPaiement);

export default router;
