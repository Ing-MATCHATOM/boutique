// routes/clients.js
import express from "express";
import { inscriptionClient, listeClients } from "../controllers/clientController.js";

const router = express.Router();

// Formulaire inscription
router.get("/inscription", (req, res) => {
  res.render("inscription");
});

// Traitement inscription
router.post("/inscription", inscriptionClient);

// Liste des clients
router.get("/", listeClients);

export default router;
