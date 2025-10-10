import jwt  from "jsonwebtoken";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { getOrCreateCart } from "../cart/cartService.js"

export async function signupLocal(email,name,password) {
    try {
    const existing = await pool.query(
        "SELECT u.id FROM users u JOIN auth_providers ap ON u.id = ap.user_id WHERE u.email = $1 AND ap.provider = 'local'",
        [email]
    );

    if (existing.rows.length > 0) {
        throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password,10);

    const userRes = await pool.query(
        "INSERT INTO users (email,name) VALUES ($1 , $2) RETURNING *",
        [email,name]
    );

    const user = userRes.rows[0];

    await pool.query(
     "INSERT INTO auth_providers (user_id , provider, provider_id, password_hash) VALUES ($1, $2, $3,$4)",
     [user.id,'local', email, passwordHash]
    );

     await pool.query(
      `INSERT INTO watchlists (user_id, name) 
       VALUES ($1, 'Default')`,
      [user.id]
    );
    
    const cartId = await getOrCreateCart(user.id);
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    return {user, token , cartId} 
    } catch(err) {
        console.log(err)
        return err
    }
}

export async function loginLocal(email,password) {
   
    try {
    const providerRes = await pool.query(
    `SELECT u.*, ap.password_hash 
    FROM users u 
    JOIN auth_providers ap ON u.id = ap.user_id 
    WHERE ap.provider = 'local' AND ap.provider_id = $1`,
    [email]
    );

    if (providerRes.rows.length === 0) throw new Error('Invalid credentials');

    const user = providerRes.rows[0];
  
    const isMatch = await bcrypt.compare(password,user.password_hash);
    if (!isMatch) throw new Error("Invalid credentials");
    const cartId = await getOrCreateCart(user.id);
    const token = jwt.sign(
        {userId:user.id , email:user.email},
        process.env.JWT_SECRET,
        { expiresIn:'7d'}
    );
    return { user , token , cartId }
    } catch(err) {
        throw err
    }
}