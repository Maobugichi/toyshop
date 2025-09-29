import { Router } from "express";
import passport from "passport";
import { signupLocal , loginLocal } from "../auth/local.js";

const authRouter = Router();

authRouter.post("/signup" , async (req,res) => {
    try {
        const { email , username ,password } = req.body
       
        const { user , token , cartId } = await signupLocal(email,username,password);
         res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

         return res.json({ user: { id: user.id, email: user.email, name: user.name } , cartId });

    } catch(err) {
        res.status(400).json(err);
    }
});

authRouter.post("/login", async (req,res) => {
    try {
        const { email , password } = req.body;
        const { user, token , cartId } = await loginLocal(email,password);

         res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ user: { id: user.id, email: user.email, name: user.name } , cartId });

    } catch(err) {
        console.log(err)
        res.status(400).json(err)
    }
})

authRouter.get("/google" , passport.authenticate("google" , {scope:['profile' , 'email']}));

authRouter.get("/google/callback" , passport.authenticate("google", {failureRedirect: "/login"}),
 (req, res) => {
    // here you could issue a JWT and redirect to frontend with it
    res.redirect("/");
  }
);

export default authRouter