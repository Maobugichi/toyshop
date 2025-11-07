import { Router } from "express";
import passport from "passport";
import { signupLocal , loginLocal } from "../auth/local.js";
import { sendWelcomeEmail } from "../controllers/autoMail.js";
import jwt  from "jsonwebtoken";

const authRouter = Router();

authRouter.post("/signup" , async (req,res) => {
    try {
        const { email , username ,password } = req.body
       
        const { user , token , cartId } = await signupLocal(email,username,password);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,           
            sameSite: "none",     
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        })
        const text = "Thanks for signing up. We're excited to have you on board"
        await sendWelcomeEmail(user.email, user.name , text );
        return res.json({ 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name 
            },
            cartId,
            token
        });
    } catch(err) {
        res.status(400).json(err);
    }
});

authRouter.post("/login", async (req,res) => {
    try {
        const { email , password } = req.body;
        console.log(req.body)
        const { user, token , cartId } = await loginLocal(email,password);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,           
            sameSite: "none",     
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        })


        return res.json({ 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name 
            },
            cartId,
            token
        });
    } catch(err) {
        console.log(err)
        res.status(400).json(err)
    }
})

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,           
       sameSite: "none",       
    })
    return res.json({ message: "Logged out successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to log out" })
  }
})


authRouter.get("/google" , passport.authenticate("google" , {scope:['profile' , 'email']}));

authRouter.get("/google/callback", 
    passport.authenticate("google", { 
        failureRedirect: "/login",
        session: false 
    }),
    async (req, res) => {
        try {
          
            const token = jwt.sign(
                { userId: req.user.id }, 
                 process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/"
            });
            
           console.log(req.user)
            //res.redirect("https://thetoyshop.net.ng/");
        } catch (err) {
            console.error(err);
            res.redirect("https://thetoyshop.net.ng/login");
        }
    }
);
export default authRouter