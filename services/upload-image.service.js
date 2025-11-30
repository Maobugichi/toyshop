import pool from "../db.js";

export const addProductImages = async (productId, imageData, files) => {
  try {
    await pool.query('BEGIN');

    
    const existingProduct = await pool.query(
      'SELECT images FROM products WHERE id = $1',
      [productId]
    );

    if (existingProduct.rows.length === 0) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    let updatedImages;

    if (existingProduct.rows[0]?.images) {
    
      const existing = existingProduct.rows[0].images;
      
      for (const file of files) {
        const url = file.path;
        updatedImages = {
          primary: url,
          gallery: [...(existing.gallery || []), ...imageData.map(img => ({
            public_id: img.public_id
          }))]
        };
      }
    } else {
      // First images for this product
      for (const file of files) {
        const url = file.path;
        updatedImages = {
          primary: url,
          gallery: imageData.map(img => ({
            public_id: img.public_id
          }))
        };
      }
    }

  
    await pool.query(
      `UPDATE products 
       SET images = $1, 
           primary_image = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [
        JSON.stringify(updatedImages),
        updatedImages.primary,
        productId
      ]
    );

    await pool.query('COMMIT');

    return { updatedImages };

  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }

}