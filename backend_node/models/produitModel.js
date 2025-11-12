// models/produitModel.js
import pool from "../config/db.js";

// Créer un produit
export async function createProduit(produitData) {
  const { nom, description, prix_achat, prix_vente, quantite_stock, seuil_alerte, fournisseur_id } = produitData;
  
  try {
    const [result] = await pool.execute(
      `INSERT INTO produit 
       (nom, description, prix_achat, prix_vente, quantite_stock, seuil_alerte, fournisseur_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nom, description || '', prix_achat, prix_vente, quantite_stock || 0, seuil_alerte || 5, fournisseur_id || null]
    );
    
    console.log("Produit créé en base de données, ID:", result.insertId);
    return result.insertId;
  } catch (error) {
    console.error("Erreur création produit:", error);
    throw error;
  }
}

// Récupérer tous les produits
export async function getAllProduits() {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, f.nom as fournisseur_nom 
       FROM produit p 
       LEFT JOIN fournisseur f ON p.fournisseur_id = f.id_fournisseur 
       ORDER BY p.nom`
    );
    return rows;
  } catch (error) {
    console.error("❌ Erreur récupération produits:", error);
    return [];
  }
}

// Récupérer un produit par ID
export async function getProduitById(id) {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, f.nom as fournisseur_nom 
       FROM produit p 
       LEFT JOIN fournisseur f ON p.fournisseur_id = f.id_fournisseur 
       WHERE p.id_produit = ?`,
      [id]
    );
    return rows[0];
  } catch (error) {
    console.error("❌ Erreur récupération produit:", error);
    return null;
  }
}

// Modifier un produit
export async function updateProduit(id, produitData) {
  const { nom, description, prix_achat, prix_vente, quantite_stock, seuil_alerte, fournisseur_id } = produitData;
  
  try {
    await pool.execute(
      `UPDATE produit 
       SET nom = ?, description = ?, prix_achat = ?, prix_vente = ?, 
           quantite_stock = ?, seuil_alerte = ?, fournisseur_id = ? 
       WHERE id_produit = ?`,
      [nom, description, prix_achat, prix_vente, quantite_stock, seuil_alerte, fournisseur_id, id]
    );
    console.log("✏️ Produit mis à jour, ID:", id);
  } catch (error) {
    console.error("❌ Erreur modification produit:", error);
    throw error;
  }
}

// Supprimer un produit
export async function deleteProduit(id) {
  try {
    await pool.execute(
      "DELETE FROM produit WHERE id_produit = ?",
      [id]
    );
    console.log("🗑️ Produit supprimé, ID:", id);
  } catch (error) {
    console.error("❌ Erreur suppression produit:", error);
    throw error;
  }
}

// Produits en alerte (stock faible)
export async function getProduitsAlerte() {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, f.nom as fournisseur_nom 
       FROM produit p 
       LEFT JOIN fournisseur f ON p.fournisseur_id = f.id_fournisseur 
       WHERE p.quantite_stock <= p.seuil_alerte 
       ORDER BY p.quantite_stock ASC`
    );
    return rows;
  } catch (error) {
    console.error("❌ Erreur récupération alertes:", error);
    return [];
  }
}

// Mettre à jour le stock
export async function updateStock(id, nouvelleQuantite) {
  try {
    await pool.execute(
      "UPDATE produit SET quantite_stock = ? WHERE id_produit = ?",
      [nouvelleQuantite, id]
    );
    console.log("📊 Stock mis à jour, Produit ID:", id, "Nouveau stock:", nouvelleQuantite);
  } catch (error) {
    console.error("❌ Erreur mise à jour stock:", error);
    throw error;
  }
}

// Gestion des mouvements de stock avec MySQL
export async function createMouvementStock(mouvementData) {
  const { produit_id, type, quantite, fournisseur_nom, raison, notes, prix_achat } = mouvementData;
  
  try {
    const [result] = await pool.execute(
      `INSERT INTO mouvement_stock 
       (produit_id, type, quantite, fournisseur_nom, raison, notes, prix_achat) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [produit_id, type, quantite, fournisseur_nom, raison || '', notes || '', prix_achat || null]
    );
    
    console.log("📦 Mouvement créé en base de données, ID:", result.insertId);
    return result.insertId;
  } catch (error) {
    console.error("❌ Erreur création mouvement:", error);
    throw error;
  }
}

// Récupérer l'historique des mouvements
export async function getMouvementsStock() {
  try {
    const [rows] = await pool.execute(
      `SELECT m.*, p.nom as produit_nom 
       FROM mouvement_stock m 
       LEFT JOIN produit p ON m.produit_id = p.id_produit 
       ORDER BY m.date_mouvement DESC`
    );
    return rows;
  } catch (error) {
    console.error("❌ Erreur récupération mouvements:", error);
    return [];
  }
}

// Récupérer les mouvements par produit
export async function getMouvementsByProduit(produitId) {
  try {
    const [rows] = await pool.execute(
      `SELECT m.*, p.nom as produit_nom 
       FROM mouvement_stock m 
       LEFT JOIN produit p ON m.produit_id = p.id_produit 
       WHERE m.produit_id = ? 
       ORDER BY m.date_mouvement DESC`,
      [produitId]
    );
    return rows;
  } catch (error) {
    console.error("❌ Erreur récupération mouvements produit:", error);
    return [];
  }
}