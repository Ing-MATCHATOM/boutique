import pool from "../config/db.js";

/* --------------------------- VENTE --------------------------- */

// Créer une vente
export async function createVente(data) {
  const { client_id, date_vente, total_ht, tax, total_ttc, montant_paye, reste } = data;

  const [result] = await pool.execute(
    `INSERT INTO vente (client_id, date_vente, total_ht, tax, total_ttc, montant_paye, reste)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [client_id, date_vente, total_ht, tax, total_ttc, montant_paye, reste]
  );

  return result.insertId;
}

/* ------------------------ DETAILS VENTE ----------------------- */

// Ajouter un produit à la vente
export async function addVenteDetail(detail) {
  const { vente_id, produit_id, quantite, prix_vente, prix_achat, subtotal, marge } = detail;

  await pool.execute(
    `INSERT INTO vente_details (vente_id, produit_id, quantite, prix_vente, prix_achat, subtotal, marge)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [vente_id, produit_id, quantite, prix_vente, prix_achat, subtotal, marge]
  );
}

/* --------------------------- PAIEMENT -------------------------- */

// Ajouter un paiement partiel
export async function addPaiement(paiement) {
  const { vente_id, montant, mode } = paiement;

  await pool.execute(
    `INSERT INTO paiement (vente_id, montant, mode) VALUES (?, ?, ?)`,
    [vente_id, montant, mode]
  );
}

/* --------------------------- GETTERS --------------------------- */

// Obtenir une vente
export async function getVenteById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM vente WHERE id_vente = ?",
    [id]
  );
  return rows[0];
}

// Obtenir les produits vendus
export async function getVenteDetails(id) {
  const [rows] = await pool.execute(
    `SELECT vd.*, p.nom 
     FROM vente_details vd
     JOIN produit p ON p.id_produit = vd.produit_id
     WHERE vente_id = ?`,
    [id]
  );
  return rows;
}

// Obtenir les paiements
export async function getPaiements(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM paiement WHERE vente_id = ? ORDER BY date_paiement ASC",
    [id]
  );
  return rows;
}
