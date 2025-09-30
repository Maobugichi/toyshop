import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import productRouter from "./router/upload-image.js";
import uploadCategoryRouter from "./router/upload_category.js";
import http from "http";
import uploadProductRouter from "./router/upload-products.js";
import session from "express-session";
import authRouter from "./router/authRoutes.js";
import passport from "passport";
import cartRouter from "./router/cartRouter.js";
import mergeRouter from "./router/merge.js";

dotenv.config();


const app = express();
const port = process.env.PORT;
const origins = ["http://localhost:5173","https://maobugichi.github.io"];
const server = http.createServer(app);

app.use(cors({
    origin:origins,
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));


app.use(express.json());
app.use(cookieParser());
app.use(session({ secret:process.env.JWT_SECRET, resave: false, saveUninitialized: false}))
app.use(passport.initialize());
app.use(passport.session());



app.use("/auth", authRouter);
app.use('/api/products', uploadProductRouter);
app.use('/api/products',productRouter)
app.use('/api/products', uploadCategoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/cart', mergeRouter);
server.listen(port,() => {
    console.log(`server started on port ${port}`);
})