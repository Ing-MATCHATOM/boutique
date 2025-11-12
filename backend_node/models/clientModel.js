// models/clientModel.js
import pool from "../config/db.js";

// --- Inscription d’un client ---
export async function createClient(clientData) {
  const { nom, telephone, email, adresse } = clientData;
  const [result] = await pool.execute(
    "INSERT INTO client (nom, telephone, email, adresse) VALUES (?, ?, ?, ?)",
    [nom, telephone, email, adresse]
  );
  return result.insertId;
}

// --- Récupération de tous les clients ---
export async function getAllClients() {
  const [rows] = await pool.execute("SELECT * FROM client ORDER BY id_client DESC");
  return rows;
}
