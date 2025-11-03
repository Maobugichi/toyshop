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
import checkoutRouter from "./router/checkoutRouter.js";
import { checkAuth } from "./check-auth.js";
import nowRouter from "./router/nowpayment.js";
import reviewRouter from "./router/review.js";
import wishRouter from "./router/watchlistRouter.js";
import newsletterRouter from "./router/newsletterRouter.js";

dotenv.config();


const app = express();
const port = process.env.PORT;
const origins = ["http://localhost:5173","https://maobugichi.github.io","https://thetoyshop.net.ng"];
const server = http.createServer(app);

app.use(cors({
    origin:origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-requires-auth",
  ],
}));


app.use(express.json());
app.use(cookieParser());
app.use(session({ secret:process.env.JWT_SECRET, resave: false, saveUninitialized: false}))
app.use(passport.initialize());
app.use(passport.session());


app.get("/health", (req, res) => {
  console.log("Received keep-alive ping 🟢");
  res.status(200).send("OK");
});


app.use("/auth", authRouter);
app.use('/api/products', uploadProductRouter);
app.use('/api/products',productRouter)
app.use('/api/products', uploadCategoryRouter);
app.use('/api/checkout', checkoutRouter)
app.use('/api/cart', cartRouter);
app.use('/api/cart', mergeRouter);
app.use('/api/payments' , checkAuth , nowRouter);
app.use('/api/reviews', reviewRouter);
app.use("/api/newsletter", newsletterRouter);
app.use('/api/watchlist' ,  wishRouter)


server.listen(port,() => {
    console.log(`server started on port ${port}`);
})