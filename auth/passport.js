import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../db.js";
import { getOrCreateCart } from "../cart/cartService.js";

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://toyshop-y88v.onrender.com/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
        try {
           const email = profile.emails?.[0]?.value || null;
           const name = profile.displayName;
           const avatar = profile.photos?.[0]?.value || null;

           const providerRes = await pool.query(
               "SELECT user_id FROM auth_providers WHERE provider = 'google' AND provider_id = $1",
               [profile.id]
           );

           let user;
           let isNewUser = false;

           if (providerRes.rows.length > 0) {
             const userRes = await pool.query(
                 "SELECT * FROM users WHERE id = $1",
                 [providerRes.rows[0].user_id]
             );
             user = userRes.rows[0];
           } else {
            const existingUser = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (existingUser.rows.length > 0) {
                user = existingUser.rows[0];

                await pool.query(
                    "INSERT INTO auth_providers(user_id, provider, provider_id) VALUES ($1, 'google', $2)",
                    [user.id, profile.id]
                );
            } else {
               const userRes = await pool.query(
                 "INSERT INTO users (email, name, avatar_url) VALUES ($1, $2, $3) RETURNING *",
                 [email, name, avatar]
               );
               user = userRes.rows[0];
               isNewUser = true;

                await pool.query(
                    "INSERT INTO auth_providers (user_id, provider, provider_id) VALUES ($1, 'google', $2)",
                    [user.id, profile.id]
                );

                // Create default watchlist for new users
                await pool.query(
                    `INSERT INTO watchlists (user_id, name) 
                     VALUES ($1, 'Default')`,
                    [user.id]
                );
            }
           }

           // Get or create cart for the user
           const cartId = await getOrCreateCart(user.id);
           
           // Attach cartId to user object so it's available in the callback
           user.cartId = cartId;
           user.isNewUser = isNewUser;

           return done(null, user);
        } catch(err) {
            console.log(err);
            return done(err, null);
        }
    }
));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err, null);
    }
});