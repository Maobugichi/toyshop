import { insertCategory } from "../services/upload-category.service.js";

export const createCategory = async (req, res) => {
    const { name, slug, description, is_active } = req.body;
   
    try {
        await insertCategory({ name, slug, description, is_active });
        res.status(201).json({ 
            message: 'Category created successfully' 
        });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ 
            error: 'Failed to create category',
            message: err.message 
        });
    }
};