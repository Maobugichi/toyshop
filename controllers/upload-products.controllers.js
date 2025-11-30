import * as uploadProductService from "../services/upload-products.service.js"


export const getAllProducts = async (req,res) => {
    try {
        const finalProd = await uploadProductService.getProducts()
         res.status(200).json(finalProd);
    } catch (err) {
        res.status(500).json({
            error: 'Failed to fetch products',
            message: err.message
        });
    }
}


export const createProduct = async (req,res) => {
    try {
        const { name , base_name , price , compare_at_price , description , material , short_description, size , sku , stock_quantity , tags , color } = req.body;
        await uploadProductService.uploadProduct({name , base_name , price , compare_at_price , description , material , short_description, size , sku , stock_quantity , tags , color})
        res.status(201).json({ 
            message: 'Product created successfully' 
        });
    } catch(err) {
      res.status(500).json({
            error: 'Failed to create product',
            message: err.message
        });
    }
   


}