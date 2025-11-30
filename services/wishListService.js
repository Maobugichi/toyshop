import pool from "../configs/db.js"

export const getUserWishLists = async (userId) => {
    const check = await pool.query(
    `SELECT id FROM watchlists WHERE user_id = $1`,
    [userId]
    );

    if (check.rows.length === 0) {
        await pool.query(
            `INSERT INTO watchlists (user_id, name) VALUES ($1, 'Default')`,
         [userId]
        );
    }

     const result = await pool.query(
      `SELECT id, name, created_at 
       FROM watchlists 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows
}

export const createWishList = async (userId , name) => {
     const result = await pool.query(
        `INSERT INTO watchlists (user_id, name) 
        VALUES ($1, $2) 
        RETURNING *`,
        [userId, name || "Default"]
      );

    return result.rows[0]
}

export const deleteWishList = async (wishListId,userId) => {
     await pool.query(
      `DELETE FROM watchlists 
       WHERE id = $1 AND user_id = $2`,
      [wishListId, userId]
    );
}

export const getWishlistItems = async (wishListId , userId) => {
   const result = await pool.query(
      `SELECT wi.id, wi.product_id, p.name, p.price, 
              p.images->>'primary' as image_url,
              wi.added_at
      FROM watchlist_items wi
      JOIN products p ON wi.product_id = p.id
      JOIN watchlists w ON wi.watchlist_id = w.id
      WHERE wi.watchlist_id = $1 AND w.user_id = $2
      ORDER BY wi.added_at DESC`,
      [wishListId, userId]
    );

    return result.rows
}

export const addItemToWishlist = async (wishlistId, productId, userId) => {
    const check = await pool.query(
    `SELECT id FROM watchlists WHERE id = $1 AND user_id = $2`,
    [wishlistId, userId]
  );

  if (check.rows.length === 0) {
    return { authorized: false };
  }


  const result = await pool.query(
    `INSERT INTO watchlist_items (watchlist_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (watchlist_id, product_id) DO NOTHING
     RETURNING *`,
    [wishlistId, productId]
  );

  if (result.rows.length === 0) {
    return { authorized: true, alreadyExists: true };
  }

  return { authorized: true, alreadyExists: false, item: result.rows[0] };
}


export const removeItemFromWishlist = async (wishlistId, productId, userId) => {

  const check = await pool.query(
    `SELECT id FROM watchlists WHERE id = $1 AND user_id = $2`,
    [wishlistId, userId]
  );

  if (check.rows.length === 0) {
    return false;
  }

  
  await pool.query(
    `DELETE FROM watchlist_items WHERE watchlist_id = $1 AND product_id = $2`,
    [wishlistId, productId]
  );

  return true;
};