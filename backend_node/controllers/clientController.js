// controllers/clientController.js
import { createClient, getAllClients } from "../models/clientModel.js";

// Inscription
export async function inscriptionClient(req, res) {
  try {
    const { nom, telephone, email, adresse } = req.body;
    if (!nom || !telephone) {
      return res.status(400).send("Nom et téléphone obligatoires !");
    }

    const clientId = await createClient({ nom, telephone, email, adresse });
    res.render("success", { message: `Client inscrit avec succès ! ID: ${clientId}` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'inscription du client");
  }
}

// Liste des clients
export async function listeClients(req, res) {
  try {
    const clients = await getAllClients();
    res.render("clients", { clients });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la récupération des clients");
  }
}
