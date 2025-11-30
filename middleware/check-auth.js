import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export function checkAuth(req, res, next) {
    let token = null;
    if (req.cookies.token) {
        token = req.cookies.token;
        console.log("Token from cookie");
    }
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); 
        }
    }
    
    if (!token) {
        return res.status(401).json({ 
            message: "User unauthorized",
            reason: "No token provided"
        });
    }
    
 
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch(err) {
        if (req.cookies.token) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/"
            });
        }
        
        return res.status(401).json({ 
            message: "Invalid or expired token",
            error: err.name 
        });
    }
}