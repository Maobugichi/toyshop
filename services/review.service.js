import pool from "../configs/db.js"

export const createReview = async ({ user_id, product_id, username, review, stars }) => {
  
  const existingReview = await pool.query(
    `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2`,
    [user_id, product_id]
  );

  if (existingReview.rows.length > 0) {
    return { alreadyReviewed: true };
  }

  const result = await pool.query(
    `INSERT INTO reviews (user_id, product_id, username, review, stars)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, product_id, username, review, stars]
  );

  return { alreadyReviewed: false, review: result.rows[0] };
};

export const getReviews = async (product_id) => {
  let query;
  let params = [];

  if (product_id) {
   
    query = `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`;
    params = [product_id];
  } else {
   
    query = `SELECT * FROM reviews ORDER BY created_at DESC`;
  }

  const result = await pool.query(query, params);
  return result.rows;
};

export const getProductReviewsWithStats = async (product_id) => {

  const reviewsResult = await pool.query(
    `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
    [product_id]
  );


  const statsResult = await pool.query(
    `SELECT 
      COALESCE(ROUND(AVG(stars)::numeric, 2), 0)::float as avg_rating,
      COUNT(*)::int as review_count
    FROM reviews 
    WHERE product_id = $1`,
    [product_id]
  );

  return {
    reviews: reviewsResult.rows,
    stats: statsResult.rows[0]
  };
};

export const updateReview = async (review_id, user_id, review, stars) => {
 
  const checkResult = await pool.query(
    `SELECT * FROM reviews WHERE id = $1 AND user_id = $2`,
    [review_id, user_id]
  );

  if (checkResult.rows.length === 0) {
    return { found: false };
  }


  const result = await pool.query(
    `UPDATE reviews 
     SET review = $1, stars = $2, created_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [review, stars, review_id, user_id]
  );

  return { found: true, review: result.rows[0] };
};

export const deleteReview = async (review_id, user_id) => {
  const result = await pool.query(
    `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *`,
    [review_id, user_id]
  );

  if (result.rows.length === 0) {
    return { found: false };
  }

  return { found: true };
};

export const checkUserReview = async (user_id, product_id) => {
  const result = await pool.query(
    `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2`,
    [user_id, product_id]
  );

  return result.rows.length > 0;
};