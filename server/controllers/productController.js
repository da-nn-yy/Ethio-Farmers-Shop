const db = require('../config/database');

const productController = {
  // Search products with filters
  async searchProducts(req, res) {
    try {
      const {
        query = '',
        category = '',
        minPrice = 0,
        maxPrice = 999999,
        organic = false,
        sortBy = 'newest',
        page = 1,
        limit = 12
      } = req.query;

      let sql = `
        SELECT
          p.*,
          u.displayName as farmerName,
          u.email as farmerEmail,
          AVG(r.rating) as averageRating,
          COUNT(r.id) as reviewCount
        FROM products p
        LEFT JOIN users u ON p.farmerId = u.id
        LEFT JOIN reviews r ON p.id = r.productId
        WHERE p.status = 'available'
      `;

      const params = [];

      // Add search filters
      if (query) {
        sql += ` AND (p.title LIKE ? OR p.description LIKE ? OR u.displayName LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`, `%${query}%`);
      }

      if (category) {
        sql += ` AND p.category = ?`;
        params.push(category);
      }

      if (minPrice > 0) {
        sql += ` AND p.pricePerKg >= ?`;
        params.push(minPrice);
      }

      if (maxPrice < 999999) {
        sql += ` AND p.pricePerKg <= ?`;
        params.push(maxPrice);
      }

      if (organic === 'true') {
        sql += ` AND p.isOrganic = true`;
      }

      sql += ` GROUP BY p.id`;

      // Add sorting
      switch (sortBy) {
        case 'price-low':
          sql += ` ORDER BY p.pricePerKg ASC`;
          break;
        case 'price-high':
          sql += ` ORDER BY p.pricePerKg DESC`;
          break;
        case 'rating':
          sql += ` ORDER BY averageRating DESC`;
          break;
        case 'harvest-recent':
          sql += ` ORDER BY p.harvestDate DESC`;
          break;
        default:
          sql += ` ORDER BY p.createdAt DESC`;
      }

      // Add pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [products] = await db.execute(sql, params);

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        LEFT JOIN users u ON p.farmerId = u.id
        WHERE p.status = 'available'
      `;

      const countParams = [];
      if (query) {
        countSql += ` AND (p.title LIKE ? OR p.description LIKE ? OR u.displayName LIKE ?)`;
        countParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
      }

      if (category) {
        countSql += ` AND p.category = ?`;
        countParams.push(category);
      }

      if (minPrice > 0) {
        countSql += ` AND p.pricePerKg >= ?`;
        countParams.push(minPrice);
      }

      if (maxPrice < 999999) {
        countSql += ` AND p.pricePerKg <= ?`;
        countParams.push(maxPrice);
      }

      if (organic === 'true') {
        countSql += ` AND p.isOrganic = true`;
      }

      const [countResult] = await db.execute(countSql, countParams);
      const total = countResult[0].total;

      res.json({
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  },

  // Get product categories
  async getCategories(req, res) {
    try {
      const [categories] = await db.execute(`
        SELECT DISTINCT category as id,
               CASE
                 WHEN category = 'vegetables' THEN 'Vegetables'
                 WHEN category = 'fruits' THEN 'Fruits'
                 WHEN category = 'tubers' THEN 'Tubers'
                 WHEN category = 'grains' THEN 'Grains'
                 WHEN category = 'herbs' THEN 'Herbs'
                 ELSE category
               END as name
        FROM products
        WHERE status = 'available'
        ORDER BY name
      `);

      res.json(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  },

  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const [products] = await db.execute(`
        SELECT
          p.*,
          u.displayName as farmerName,
          AVG(r.rating) as averageRating
        FROM products p
        LEFT JOIN users u ON p.farmerId = u.id
        LEFT JOIN reviews r ON p.id = r.productId
        WHERE p.status = 'available'
        GROUP BY p.id
        ORDER BY averageRating DESC, p.createdAt DESC
        LIMIT 8
      `);

      res.json(products);
    } catch (error) {
      console.error('Error getting featured products:', error);
      res.status(500).json({ error: 'Failed to get featured products' });
    }
  },

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const [products] = await db.execute(`
        SELECT
          p.*,
          u.displayName as farmerName,
          u.email as farmerEmail,
          AVG(r.rating) as averageRating,
          COUNT(r.id) as reviewCount
        FROM products p
        LEFT JOIN users u ON p.farmerId = u.id
        LEFT JOIN reviews r ON p.id = r.productId
        WHERE p.id = ?
        GROUP BY p.id
      `, [id]);

      if (products.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Get reviews for this product
      const [reviews] = await db.execute(`
        SELECT r.*, u.displayName as reviewerName
        FROM reviews r
        LEFT JOIN users u ON r.userId = u.id
        WHERE r.productId = ?
        ORDER BY r.createdAt DESC
        LIMIT 10
      `, [id]);

      const product = products[0];
      product.reviews = reviews;

      res.json(product);
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  },

  // Create new product (farmer only)
  async createProduct(req, res) {
    try {
      const {
        title,
        description,
        pricePerKg,
        unit,
        availableQuantity,
        category,
        isOrganic = false,
        harvestDate,
        images = []
      } = req.body;

      const farmerId = req.user.id;

      const [result] = await db.execute(`
        INSERT INTO products (
          title, description, pricePerKg, unit, availableQuantity,
          category, isOrganic, harvestDate, images, farmerId, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
      `, [
        title, description, pricePerKg, unit, availableQuantity,
        category, isOrganic, harvestDate, JSON.stringify(images), farmerId
      ]);

      const productId = result.insertId;

      // Get the created product
      const [products] = await db.execute(`
        SELECT * FROM products WHERE id = ?
      `, [productId]);

      res.status(201).json(products[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  // Update product (farmer only)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const farmerId = req.user.id;

      // Check if product belongs to the farmer
      const [existing] = await db.execute(`
        SELECT id FROM products WHERE id = ? AND farmerId = ?
      `, [id, farmerId]);

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Product not found or not authorized' });
      }

      const {
        title,
        description,
        pricePerKg,
        unit,
        availableQuantity,
        category,
        isOrganic,
        harvestDate,
        images,
        status
      } = req.body;

      await db.execute(`
        UPDATE products SET
          title = ?, description = ?, pricePerKg = ?, unit = ?,
          availableQuantity = ?, category = ?, isOrganic = ?,
          harvestDate = ?, images = ?, status = ?, updatedAt = NOW()
        WHERE id = ?
      `, [
        title, description, pricePerKg, unit, availableQuantity,
        category, isOrganic, harvestDate, JSON.stringify(images), status, id
      ]);

      // Get updated product
      const [products] = await db.execute(`
        SELECT * FROM products WHERE id = ?
      `, [id]);

      res.json(products[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  // Delete product (farmer only)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const farmerId = req.user.id;

      // Check if product belongs to the farmer
      const [existing] = await db.execute(`
        SELECT id FROM products WHERE id = ? AND farmerId = ?
      `, [id, farmerId]);

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Product not found or not authorized' });
      }

      await db.execute(`
        DELETE FROM products WHERE id = ?
      `, [id]);

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  // Get farmer's listings
  async getFarmerListings(req, res) {
    try {
      const farmerId = req.user.id;

      const [products] = await db.execute(`
        SELECT
          p.*,
          AVG(r.rating) as averageRating,
          COUNT(r.id) as reviewCount
        FROM products p
        LEFT JOIN reviews r ON p.id = r.productId
        WHERE p.farmerId = ?
        GROUP BY p.id
        ORDER BY p.createdAt DESC
      `, [farmerId]);

      res.json(products);
    } catch (error) {
      console.error('Error getting farmer listings:', error);
      res.status(500).json({ error: 'Failed to get farmer listings' });
    }
  },

  // Get user's favorite products
  async getFavoriteProducts(req, res) {
    try {
      const userId = req.user.id;

      const [favorites] = await db.execute(`
        SELECT
          p.*,
          u.displayName as farmerName,
          AVG(r.rating) as averageRating
        FROM favorites f
        JOIN products p ON f.productId = p.id
        LEFT JOIN users u ON p.farmerId = u.id
        LEFT JOIN reviews r ON p.id = r.productId
        WHERE f.userId = ? AND p.status = 'available'
        GROUP BY p.id
        ORDER BY f.createdAt DESC
      `, [userId]);

      res.json(favorites);
    } catch (error) {
      console.error('Error getting favorites:', error);
      res.status(500).json({ error: 'Failed to get favorites' });
    }
  },

  // Toggle favorite product
  async toggleFavorite(req, res) {
    try {
      const { id: productId } = req.params;
      const userId = req.user.id;

      // Check if already favorited
      const [existing] = await db.execute(`
        SELECT id FROM favorites WHERE userId = ? AND productId = ?
      `, [userId, productId]);

      if (existing.length > 0) {
        // Remove from favorites
        await db.execute(`
          DELETE FROM favorites WHERE userId = ? AND productId = ?
        `, [userId, productId]);
        res.json({ message: 'Removed from favorites' });
      } else {
        // Add to favorites
        await db.execute(`
          INSERT INTO favorites (userId, productId) VALUES (?, ?)
        `, [userId, productId]);
        res.json({ message: 'Added to favorites' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  },

  // Add review to product
  async addReview(req, res) {
    try {
      const { id: productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      // Check if user already reviewed this product
      const [existing] = await db.execute(`
        SELECT id FROM reviews WHERE userId = ? AND productId = ?
      `, [userId, productId]);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'You have already reviewed this product' });
      }

      await db.execute(`
        INSERT INTO reviews (userId, productId, rating, comment)
        VALUES (?, ?, ?, ?)
      `, [userId, productId, rating, comment]);

      res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  }
};

module.exports = productController;
