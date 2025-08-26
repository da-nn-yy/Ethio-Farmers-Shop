const db = require('../config/database');

const orderController = {
  // Get user's shopping cart
  async getCart(req, res) {
    try {
      const userId = req.user.id;

      const [cartItems] = await db.execute(`
        SELECT
          c.id as cartItemId,
          c.quantity,
          c.createdAt as addedAt,
          p.id as productId,
          p.title,
          p.description,
          p.pricePerKg,
          p.unit,
          p.availableQuantity,
          p.category,
          p.isOrganic,
          p.images,
          u.displayName as farmerName,
          u.email as farmerEmail
        FROM cart c
        JOIN products p ON c.productId = p.id
        JOIN users u ON p.farmerId = u.id
        WHERE c.userId = ? AND p.status = 'available'
        ORDER BY c.createdAt DESC
      `, [userId]);

      // Calculate totals
      let totalItems = 0;
      let totalAmount = 0;

      cartItems.forEach(item => {
        totalItems += item.quantity;
        totalAmount += item.pricePerKg * item.quantity;
      });

      res.json({
        items: cartItems,
        summary: {
          totalItems,
          totalAmount: parseFloat(totalAmount.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({ error: 'Failed to get cart' });
    }
  },

  // Add item to cart
  async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.user.id;

      // Check if product exists and is available
      const [products] = await db.execute(`
        SELECT id, availableQuantity, pricePerKg FROM products
        WHERE id = ? AND status = 'available'
      `, [productId]);

      if (products.length === 0) {
        return res.status(404).json({ error: 'Product not found or not available' });
      }

      const product = products[0];

      if (quantity > product.availableQuantity) {
        return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
      }

      // Check if item already in cart
      const [existing] = await db.execute(`
        SELECT id, quantity FROM cart WHERE userId = ? AND productId = ?
      `, [userId, productId]);

      if (existing.length > 0) {
        // Update quantity
        const newQuantity = existing[0].quantity + quantity;
        if (newQuantity > product.availableQuantity) {
          return res.status(400).json({ error: 'Total quantity exceeds available stock' });
        }

        await db.execute(`
          UPDATE cart SET quantity = ? WHERE id = ?
        `, [newQuantity, existing[0].id]);

        res.json({ message: 'Cart updated successfully' });
      } else {
        // Add new item
        await db.execute(`
          INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)
        `, [userId, productId, quantity]);

        res.status(201).json({ message: 'Item added to cart' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Failed to add to cart' });
    }
  },

  // Update cart item quantity
  async updateCartItem(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      // Check if cart item belongs to user
      const [cartItems] = await db.execute(`
        SELECT c.id, c.quantity, p.availableQuantity, p.title
        FROM cart c
        JOIN products p ON c.productId = p.id
        WHERE c.id = ? AND c.userId = ?
      `, [itemId, userId]);

      if (cartItems.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      const cartItem = cartItems[0];

      if (quantity > cartItem.availableQuantity) {
        return res.status(400).json({
          error: `Only ${cartItem.availableQuantity} ${cartItem.title} available`
        });
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await db.execute(`DELETE FROM cart WHERE id = ?`, [itemId]);
        res.json({ message: 'Item removed from cart' });
      } else {
        // Update quantity
        await db.execute(`UPDATE cart SET quantity = ? WHERE id = ?`, [quantity, itemId]);
        res.json({ message: 'Cart updated successfully' });
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ error: 'Failed to update cart item' });
    }
  },

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const { itemId } = req.params;
      const userId = req.user.id;

      const [result] = await db.execute(`
        DELETE FROM cart WHERE id = ? AND userId = ?
      `, [itemId, userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ error: 'Failed to remove from cart' });
    }
  },

  // Clear entire cart
  async clearCart(req, res) {
    try {
      const userId = req.user.id;

      await db.execute(`DELETE FROM cart WHERE userId = ?`, [userId]);

      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  },

  // Create order from cart
  async createOrder(req, res) {
    try {
      const {
        shippingAddress,
        phoneNumber,
        paymentMethod = 'cash_on_delivery',
        specialInstructions = ''
      } = req.body;
      const userId = req.user.id;

      // Get cart items
      const [cartItems] = await db.execute(`
        SELECT
          c.id as cartItemId,
          c.quantity,
          p.id as productId,
          p.title,
          p.pricePerKg,
          p.unit,
          p.farmerId
        FROM cart c
        JOIN products p ON c.productId = p.id
        WHERE c.userId = ? AND p.status = 'available'
      `, [userId]);

      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Start transaction
      await db.execute('START TRANSACTION');

      try {
        // Group items by farmer for separate orders
        const ordersByFarmer = {};
        cartItems.forEach(item => {
          if (!ordersByFarmer[item.farmerId]) {
            ordersByFarmer[item.farmerId] = [];
          }
          ordersByFarmer[item.farmerId].push(item);
        });

        const createdOrders = [];

        // Create separate order for each farmer
        for (const [farmerId, items] of Object.entries(ordersByFarmer)) {
          // Calculate order total
          const totalAmount = items.reduce((sum, item) => {
            return sum + (item.pricePerKg * item.quantity);
          }, 0);

          // Create order
          const [orderResult] = await db.execute(`
            INSERT INTO orders (
              buyerId, farmerId, totalAmount, status, shippingAddress,
              phoneNumber, paymentMethod, specialInstructions
            ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
          `, [userId, farmerId, totalAmount, shippingAddress, phoneNumber, paymentMethod, specialInstructions]);

          const orderId = orderResult.insertId;

          // Create order items
          for (const item of items) {
            await db.execute(`
              INSERT INTO order_items (
                orderId, productId, quantity, pricePerKg, totalPrice
              ) VALUES (?, ?, ?, ?, ?)
            `, [orderId, item.productId, item.quantity, item.pricePerKg, item.pricePerKg * item.quantity]);

            // Update product quantity
            await db.execute(`
              UPDATE products
              SET availableQuantity = availableQuantity - ?
              WHERE id = ?
            `, [item.quantity, item.productId]);
          }

          // Get created order with items
          const [orders] = await db.execute(`
            SELECT
              o.*,
              u.displayName as farmerName,
              u.email as farmerEmail
            FROM orders o
            JOIN users u ON o.farmerId = u.id
            WHERE o.id = ?
          `, [orderId]);

          createdOrders.push(orders[0]);
        }

        // Clear cart after successful order creation
        await db.execute(`DELETE FROM cart WHERE userId = ?`, [userId]);

        await db.execute('COMMIT');

        res.status(201).json({
          message: 'Order created successfully',
          orders: createdOrders
        });

      } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;

      const [orders] = await db.execute(`
        SELECT
          o.*,
          u.displayName as farmerName,
          u.email as farmerEmail,
          COUNT(oi.id) as itemCount
        FROM orders o
        JOIN users u ON o.farmerId = u.id
        LEFT JOIN order_items oi ON o.id = oi.orderId
        WHERE o.buyerId = ?
        GROUP BY o.id
        ORDER BY o.createdAt DESC
      `, [userId]);

      res.json(orders);
    } catch (error) {
      console.error('Error getting user orders:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  },

  // Get order by ID with items
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get order details
      const [orders] = await db.execute(`
        SELECT
          o.*,
          u.displayName as farmerName,
          u.email as farmerEmail
        FROM orders o
        JOIN users u ON o.farmerId = u.id
        WHERE o.id = ? AND (o.buyerId = ? OR o.farmerId = ?)
      `, [id, userId, userId]);

      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orders[0];

      // Get order items
      const [items] = await db.execute(`
        SELECT
          oi.*,
          p.title,
          p.description,
          p.unit,
          p.category
        FROM order_items oi
        JOIN products p ON oi.productId = p.id
        WHERE oi.orderId = ?
      `, [id]);

      order.items = items;

      res.json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  },

  // Update order status (buyer can cancel)
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      // Check if user owns this order
      const [orders] = await db.execute(`
        SELECT id, status FROM orders WHERE id = ? AND buyerId = ?
      `, [id, userId]);

      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orders[0];

      // Only allow cancellation if order is pending
      if (status === 'cancelled' && order.status !== 'pending') {
        return res.status(400).json({ error: 'Can only cancel pending orders' });
      }

      await db.execute(`
        UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?
      `, [status, id]);

      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  // Get farmer's orders
  async getFarmerOrders(req, res) {
    try {
      const farmerId = req.user.id;

      const [orders] = await db.execute(`
        SELECT
          o.*,
          u.displayName as buyerName,
          u.email as buyerEmail,
          COUNT(oi.id) as itemCount
        FROM orders o
        JOIN users u ON o.buyerId = u.id
        LEFT JOIN order_items oi ON o.id = oi.orderId
        WHERE o.farmerId = ?
        GROUP BY o.id
        ORDER BY o.createdAt DESC
      `, [farmerId]);

      res.json(orders);
    } catch (error) {
      console.error('Error getting farmer orders:', error);
      res.status(500).json({ error: 'Failed to get farmer orders' });
    }
  },

  // Update farmer order status
  async updateFarmerOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const farmerId = req.user.id;

      // Check if farmer owns this order
      const [orders] = await db.execute(`
        SELECT id, status FROM orders WHERE id = ? AND farmerId = ?
      `, [id, farmerId]);

      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orders[0];

      // Validate status transition
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [],
        'cancelled': []
      };

      if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({
          error: `Cannot change status from ${order.status} to ${status}`
        });
      }

      await db.execute(`
        UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?
      `, [status, id]);

      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Error updating farmer order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
};

module.exports = orderController;
