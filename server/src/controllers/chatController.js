import { pool } from '../config/database.js';

const getUserIdFromReq = async (req) => {
  const uid = req.user?.uid;
  if (uid && uid.startsWith('dev-uid-')) {
    return req.user.id;
  }
  const [rows] = await pool.query('SELECT id FROM users WHERE firebase_uid = ? LIMIT 1', [uid]);
  if (!rows.length) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return rows[0].id;
};

export const listConversations = async (req, res) => {
  try {
    const me = await getUserIdFromReq(req);

    const [rows] = await pool.query(
      `SELECT u.id as otherUserId, u.name, u.email, u.role,
              MAX(m.created_at) as last_message_time,
              SUBSTRING_INDEX(MAX(CONCAT(m.created_at, '|', m.content)), '|', -1) as last_message
       FROM messages m
       JOIN users u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
       WHERE (m.sender_id = ? OR m.receiver_id = ?)
       GROUP BY otherUserId, u.name, u.email, u.role
       ORDER BY last_message_time DESC`,
      [me, me, me]
    );

    res.json({ conversations: rows });
  } catch (error) {
    const status = error.status || 500;
    console.error('Error listing conversations:', error);
    res.status(status).json({ error: 'Failed to list conversations' });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const me = await getUserIdFromReq(req);
    const other = Number(req.params.otherUserId);
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT id, sender_id, receiver_id, content, created_at
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [me, other, other, me, parseInt(limit), offset]
    );

    // Return in ascending order for UI
    const messages = rows.slice().reverse();

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)`,
      [me, other, other, me]
    );
    const totalPages = Math.ceil(total / limit);

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNext: page < totalPages
      }
    });
  } catch (error) {
    const status = error.status || 500;
    console.error('Error getting messages:', error);
    res.status(status).json({ error: 'Failed to load messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const me = await getUserIdFromReq(req);
    const other = Number(req.params.otherUserId);
    const { content } = req.body || {};

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Ensure other user exists
    const [users] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [other]);
    if (!users.length) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const [result] = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)` ,
      [me, other, content]
    );

    res.status(201).json({ id: result.insertId, message: 'Message sent' });
  } catch (error) {
    const status = error.status || 500;
    console.error('Error sending message:', error);
    res.status(status).json({ error: 'Failed to send message' });
  }
};


