import { Router } from "express";
import { upload , cloudinary } from "../cloudinary.js";
import pool from "../db.js";

/*const generateCloudinaryUrls = (publicId) => {
  const baseUrl = cloudinary.url(publicId, { secure: true });
  return {
    original: baseUrl,
    thumbnail: cloudinary.url(publicId, {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),
    medium: cloudinary.url(publicId, {
      width: 600,
      height: 600,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),
    large: cloudinary.url(publicId, {
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    })
  };
};*/

const productRouter = Router();

productRouter.post('/:productId/images', upload.array('images', 10), async (req, res) => {
  try {
    const { productId } = req.params;
    const files =   req.files
    const imageData = files.map((file, index) => {
      //const urls = generateCloudinaryUrls(file.filename);
      return {
        public_id: file.filename,
        //urls: urls,
        sort_order: index,
        is_primary: index === 0
      };
    });

    await pool.query('BEGIN');

    // Update the products table with new images
    const existingProduct = await pool.query(
      'SELECT images FROM products WHERE id = $1',
      [productId]
    );

    let updatedImages;
   

    if (existingProduct.rows[0]?.images) {
      // Merge with existing images
        const existing = existingProduct.rows[0].images;
        for (const file of files) {
         const url = file.path;
          updatedImages = {
          primary: url,
          gallery: [...(existing.gallery || []), ...imageData.map(img => ({
            public_id: img.public_id,
            ...img.urls
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
          public_id: img.public_id,
          ...img.urls
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
        updatedImages.primary?.medium || updatedImages.primary?.original,
        productId
      ]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      images: updatedImages,
      uploaded_count: req.files.length
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Image upload error:', error);
    
    if (req.files) {
      req.files.forEach(file => {
        cloudinary.uploader.destroy(file.filename).catch(console.error);
      });
    }
    
    res.status(500).json(error);
  } 
});

export default productRouter