import pool from "../configs/db.js"

export const insertCategory = async ({ name, slug, description, is_active }) => {
    const query = `
        INSERT INTO categories(name, slug, description, is_active) 
        VALUES($1, $2, $3, $4)
        RETURNING *
    `;
    
    const values = [name, slug, description, is_active];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};