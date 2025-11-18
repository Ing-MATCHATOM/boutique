import {
  createVente,
  addVenteDetail,
  addPaiement,
  getVenteById,
  getVenteDetails,
  getPaiements
} from "../models/venteModel.js";

import { getAllProduits, getProduitById, updateStock } from "../models/produitModel.js";
import { getAllClients } from "../models/clientModel.js";

/* ------------------------------------------------------------
   PAGE : FORMULAIRE DE VENTE
------------------------------------------------------------ */
export async function pageVente(req, res) {
  try {
    const produits = await getAllProduits();
    const clients = await getAllClients();

    res.render("vente", {
      produits,
      clients
    });
  } catch (err) {
    console.error("Erreur pageVente:", err);
    res.status(500).send("Erreur chargement page de vente");
  }
}

/* ------------------------------------------------------------
   TRAITER UNE VENTE
------------------------------------------------------------ */
export async function traiterVente(req, res) {
  try {
    let { client_id, date_vente, produits, montant_paye, tax } = req.body;

    // Validation
    if (!client_id || !produits || produits.length === 0) {
      return res.status(400).send("Client et produits obligatoires !");
    }

    // Définitions par défaut
    montant_paye = parseFloat(montant_paye) || 0;
    date_vente = date_vente || new Date().toISOString().slice(0,16);
    tax = parseFloat(tax) || 0;

    let total_ht = 0;
    let total_marge = 0;

    // Calcul totals
    for (const p of produits) {
      const produit = await getProduitById(p.produit_id);
      if (!produit) continue;

      const qty = Number(p.quantite) || 0;
      const prixVente = Number(p.prix_vente) || 0;
      const prixAchat = Number(produit.prix_achat) || 0;

      const subtotal = qty * prixVente;
      const marge = (prixVente - prixAchat) * qty;

      total_ht += subtotal;
      total_marge += marge;
    }

    // Si tax non fourni, 18% TVA
    if (tax === 0) tax = total_ht * 0.18;

    const total_ttc = total_ht + tax;
    const reste = total_ttc - montant_paye;

    // 1️⃣ Créer la vente
    const vente_id = await createVente({
      client_id: client_id || null,
      date_vente,
      total_ht,
      tax,
      total_ttc,
      montant_paye,
      reste
    });

    // 2️⃣ Ajouter les produits à la vente
    for (const p of produits) {
      const produit = await getProduitById(p.produit_id);
      if (!produit) continue;

      const qty = Number(p.quantite) || 0;
      const prixVente = Number(p.prix_vente) || 0;
      const prixAchat = Number(produit.prix_achat) || 0;

      const subtotal = qty * prixVente;
      const marge = (prixVente - prixAchat) * qty;

      await addVenteDetail({
        vente_id,
        produit_id: p.produit_id,
        quantite: qty,
        prix_vente: prixVente,
        prix_achat: prixAchat,
        subtotal,
        marge
      });

      // Décrémenter le stock
      const newStock = produit.quantite_stock - qty;
      await updateStock(p.produit_id, newStock);
    }

    // 3️⃣ Paiement initial
    if (montant_paye > 0) {
      await addPaiement({
        vente_id,
        montant: montant_paye,
        mode: req.body.mode_paiement || "cash"
      });
    }

    res.render("successVente", {
      message: `Vente enregistrée avec succès ! Code : ${vente_id}`
    });

  } catch (err) {
    console.error("Erreur traiterVente:", err);
    res.status(500).send("Erreur lors de l'enregistrement de la vente");
  }
}

/* ------------------------------------------------------------
   PAGE : DÉTAILS D’UNE VENTE
------------------------------------------------------------ */
export async function detailsVente(req, res) {
  try {
    const id = req.params.id;

    const vente = await getVenteById(id);
    const details = await getVenteDetails(id);
    const paiements = await getPaiements(id);

    if (!vente) return res.status(404).send("Vente non trouvée");

    res.render("detailsVente", {
      vente,
      details,
      paiements
    });

  } catch (err) {
    console.error("Erreur detailsVente:", err);
    res.status(500).send("Erreur récupération détails vente");
  }
}

/* ------------------------------------------------------------
   AJOUTER UN PAIEMENT PARTIEL
------------------------------------------------------------ */
export async function ajouterPaiement(req, res) {
  try {
    const { vente_id } = req.params;
    const { montant, mode } = req.body;

    if (!montant || isNaN(montant)) return res.status(400).send("Montant invalide");

    await addPaiement({
      vente_id,
      montant: Number(montant),
      mode: mode || "cash"
    });

    res.redirect(`/ventes/${vente_id}`);

  } catch (err) {
    console.error("Erreur ajouterPaiement:", err);
    res.status(500).send("Erreur ajout paiement");
  }
}
