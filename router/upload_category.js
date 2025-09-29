import { Router } from "express";
import pool from "../db.js";

const uploadCategoryRouter = Router();

uploadCategoryRouter.post('/categories' , async (req,res) => {
    const { name , slug , description , is_active } = req.body;
   
    try {
       await pool.query('INSERT INTO categories(name , slug , description , is_active) VALUES($1,$2,$3,$4)', [name, slug , description, is_active]);

       res.status(200).json({message:'success'})
    } catch(err) {
        res.status(500).json(err)
    }
   
});

export default uploadCategoryRouter