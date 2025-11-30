import { cloudinary } from "../configs/cloudinary.js";
import { addProductImages } from "../services/upload-image.service.js";

export const uploadProductImages = async (req,res) => {
  try {
    const { productId } = req.params;
    const files =   req.files;


    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    const imageData = files.map((file, index) => ({
      public_id: file.filename,
      path: file.path,
      sort_order: index,
      is_primary: index === 0
    }));

    const result = await addProductImages(productId,imageData,files);

    res.json({
        success:true,
        images:result.updatedImages,
        uploaded_count: req.files.length
    })
   } catch(error) {
    if (req.files) {
      req.files.forEach(file => {
        cloudinary.uploader.destroy(file.filename).catch(console.error);
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload images',
      message: error.message
    });
   } 
}