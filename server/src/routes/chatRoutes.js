import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { listConversations, getConversationMessages, sendMessage } from '../controllers/chatController.js';

const router = Router();

router.use(authGuard);

router.get('/conversations', listConversations);
router.get('/conversations/:otherUserId', getConversationMessages);
router.post('/conversations/:otherUserId', sendMessage);

export default router;


