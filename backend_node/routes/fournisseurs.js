// routes/fournisseurRoutes.js
import express from "express";
import {
  inscriptionFournisseur,
  listeFournisseurs,
  detailsFournisseur,
  modifierFournisseur,
  supprimerFournisseur
} from "../controllers/fournisseurController.js";

const router = express.Router();

// Routes pour les fournisseurs
router.get("/", listeFournisseurs); // Devient: GET /fournisseurs
router.get("/inscription", (req, res) => { // Devient: GET /fournisseurs/inscription
  res.render("inscriptionFournisseur");
});
router.post("/inscription", inscriptionFournisseur); // Devient: POST /fournisseurs/inscription
router.get("/:id", detailsFournisseur); // Devient: GET /fournisseurs/:id
router.put("/:id", modifierFournisseur); // Devient: PUT /fournisseurs/:id
router.delete("/:id", supprimerFournisseur); // Devient: DELETE /fournisseurs/:id

export default router;