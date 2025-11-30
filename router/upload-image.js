import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadProductImages } from "../controllers/upload-image.controller.js";

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

productRouter.post('/:productId/images', upload.array('images', 10), uploadProductImages);

export default productRouter;