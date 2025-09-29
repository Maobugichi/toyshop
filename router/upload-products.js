import { Router } from "express";
import pool from "../db.js";

const uploadProductRouter = Router();

uploadProductRouter.get('/', async (req,res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json(err)
    }
})

uploadProductRouter.post('/upload-product' , async (req,res) => {
  
    try {
       const { name , base_name , price , compare_at_price , description , material , short_description, size , sku , stock_quantity , tags , color } = req.body;
       await pool.query('INSERT INTO products(name , base_name , price , compare_at_price , description, material , short_description, size , sku ,stock_quantity , tags , color ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
        [ name , base_name , price , compare_at_price , description , material , short_description, size , sku , stock_quantity , tags, color]);
        res.status(200).json({message:'success'});
    } catch(err) {
      res.status(500).json(err)
    }
});

export default uploadProductRouter
