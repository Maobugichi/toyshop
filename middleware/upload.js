import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../configs/cloudinary.js';


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '/products', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => {
      const productSlug = req.body.productSlug || 'product';
      const timestamp = Date.now();
      return `${productSlug}-${timestamp}`;
    }
  },
});

 const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export { upload }