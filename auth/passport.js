import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../db.js";

passport.use(new GoogleStrategy(
    {
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"/auth/google/callback",
    },

    async (accessToken, refreshToken,profile,done) => {
        try {
           const  email = profile.emails?.[0]?.value || null;
           const name = profile.displayName;
           const avatar = profile.photos?.[0]?.value || null;

           const providerRes = await pool.query("SELECT user_id FROM auth_providers WHERE provider = 'google' AND provider_id = $1",
            [profile.id]
           );

           let user;

           if (providerRes.rows.length > 0) {
             const userRes = await pool.query("SELECT * FROM users WHERE id = $1",[providerRes.rows[0].user_id]);
             user = userRes.rows[0]
           } else {
            const existingUser = await pool.query("SELECT * FROM users WHERE email = $1",[email]);

            if(existingUser.rows.length > 0) {
                user = existingUser.rows[0];

                await pool.query(
                    "INSERT INTO auth_providers(user_id, provider,provider_id VALUES ($1, 'google', $2)",
                     [user.id, profile.id]
                )
            } else {
               const userRes = await pool.query(
                 "INSERT INTO users (email, name, avatar_url) VALUES ($1, $2, $3) RETURNING *",
                 [email,name,avatar]
               );
               user = userRes.rows[0];

                await pool.query(
                "INSERT INTO auth_providers (user_id, provider, provider_id) VALUES ($1, 'google', $2)",
                [user.id, profile.id]
                );
            }
           }
           return done(null,user)
        } catch(err) {
            console.log(err)
          return done(err, null);
        }
    }
))