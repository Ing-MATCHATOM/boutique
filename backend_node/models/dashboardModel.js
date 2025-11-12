// models/dashboardModel.js
import pool from "../config/db.js";

// Statistiques générales
export async function getDashboardStats() {
  try {
    // Compter les produits
    const [produitsRows] = await pool.execute("SELECT COUNT(*) as total FROM produit");
    const [produitsAlerteRows] = await pool.execute("SELECT COUNT(*) as alertes FROM produit WHERE quantite_stock <= seuil_alerte");
    
    // Compter les clients
    const [clientsRows] = await pool.execute("SELECT COUNT(*) as total FROM client");
    
    // Compter les fournisseurs
    const [fournisseursRows] = await pool.execute("SELECT COUNT(*) as total FROM fournisseur");
    
    // Derniers mouvements de stock
    const [mouvementsRows] = await pool.execute(
      `SELECT m.*, p.nom as produit_nom 
       FROM mouvement_stock m 
       LEFT JOIN produit p ON m.produit_id = p.id_produit 
       ORDER BY m.date_mouvement DESC 
       LIMIT 5`
    );
    
    // Produits les plus vendus (approximation via sorties)
    const [produitsPopulairesRows] = await pool.execute(
      `SELECT p.nom, SUM(m.quantite) as total_vendu
       FROM mouvement_stock m
       LEFT JOIN produit p ON m.produit_id = p.id_produit
       WHERE m.type = 'sortie'
       GROUP BY p.id_produit, p.nom
       ORDER BY total_vendu DESC
       LIMIT 5`
    );

    return {
      produits: {
        total: produitsRows[0].total,
        alertes: produitsAlerteRows[0].alertes
      },
      clients: clientsRows[0].total,
      fournisseurs: fournisseursRows[0].total,
      derniersMouvements: mouvementsRows,
      produitsPopulaires: produitsPopulairesRows
    };
  } catch (error) {
    console.error("Erreur récupération stats dashboard:", error);
    return {
      produits: { total: 0, alertes: 0 },
      clients: 0,
      fournisseurs: 0,
      derniersMouvements: [],
      produitsPopulaires: []
    };
  }
}

// Statistiques mensuelles pour graphiques
export async function getMonthlyStats() {
  try {
    const [ventesMensuelles] = await pool.execute(
      `SELECT 
        DATE_FORMAT(date_mouvement, '%Y-%m') as mois,
        SUM(quantite) as total_ventes
       FROM mouvement_stock 
       WHERE type = 'sortie' 
       GROUP BY mois 
       ORDER BY mois DESC 
       LIMIT 6`
    );

    const [entreesMensuelles] = await pool.execute(
      `SELECT 
        DATE_FORMAT(date_mouvement, '%Y-%m') as mois,
        SUM(quantite) as total_entrees
       FROM mouvement_stock 
       WHERE type = 'entree' 
       GROUP BY mois 
       ORDER BY mois DESC 
       LIMIT 6`
    );

    return {
      ventes: ventesMensuelles.reverse(), // Du plus ancien au plus récent
      entrees: entreesMensuelles.reverse()
    };
  } catch (error) {
    console.error("Erreur récupération stats mensuelles:", error);
    return { ventes: [], entrees: [] };
  }
}