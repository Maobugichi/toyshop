import pool from "../db.js";

export const getProducts = async () => {
     const result = await pool.query('SELECT * FROM products');
     return result.rows
}


export const uploadProduct = async ({ name , base_name , price , compare_at_price , description , material , short_description, size , sku , stock_quantity , tags , color }) => {
    try {
     await pool.query('INSERT INTO products(name , base_name , price , compare_at_price , description, material , short_description, size , sku ,stock_quantity , tags , color ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
     [ name , base_name , price , compare_at_price , description , material , short_description, size , sku , stock_quantity , tags, color]);

     return { success:true }
    } catch(error) {
        throw new Error(`error occured: ${error}`)
    }
}