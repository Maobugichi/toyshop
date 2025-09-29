import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


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

export { cloudinary , upload}