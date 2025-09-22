import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chatService } from '../../services/apiService.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Icon from '../../components/AppIcon.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';

const ChatPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(() => Number(searchParams.get('u')) || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [convSearch, setConvSearch] = useState('');

  const selectedConversation = useMemo(() => conversations.find(c => c.otherUserId === selectedUserId), [conversations, selectedUserId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedUserId) return;
    loadMessages(selectedUserId);
  }, [isAuthenticated, selectedUserId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data.conversations || []);
      if (!selectedUserId && (data.conversations || []).length > 0) {
        const first = data.conversations[0].otherUserId;
        setSelectedUserId(first);
        setSearchParams({ u: String(first) });
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId) => {
    try {
      setLoadingMessages(true);
      const data = await chatService.getMessages(otherUserId, { limit: 50 });
      setMessages(data.messages || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !selectedUserId) return;
    try {
      setInput('');
      await chatService.sendMessage(selectedUserId, content);
      await loadMessages(selectedUserId);
      await loadConversations();
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to send');
    }
  };

  if (!isAuthenticated) {
    navigate('/authentication-login-register');
    return null;
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-2">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary">Chat</h1>
          <p className="text-text-secondary">Talk directly with farmers and buyers.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversations list */}
          <div className="elevated-card p-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-text-primary flex-1">Conversations</h2>
              <Button variant="ghost" size="sm" onClick={loadConversations} title="Refresh"><Icon name="RefreshCw" size={16} /></Button>
            </div>
            <div className="mb-3">
              <Input type="text" value={convSearch} onChange={(e) => setConvSearch(e.target.value)} placeholder="Search by name or email" />
            </div>
            <div className="divide-y divide-border max-h-[70vh] overflow-y-auto scrollbar-thin">
              {loading && <div className="text-sm text-text-secondary p-2">Loading…</div>}
              {!loading && conversations.filter(c => {
                const q = convSearch.trim().toLowerCase();
                if (!q) return true;
                return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
              }).length === 0 && (
                <div className="text-sm text-text-secondary p-2">No conversations yet.</div>
              )}
              {conversations.filter(c => {
                const q = convSearch.trim().toLowerCase();
                if (!q) return true;
                return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
              }).map(conv => (
                <button
                  key={conv.otherUserId}
                  className={`w-full text-left p-3 hover:bg-muted rounded-md transition ${selectedUserId === conv.otherUserId ? 'bg-muted' : ''}`}
                  onClick={() => { setSelectedUserId(conv.otherUserId); setSearchParams({ u: String(conv.otherUserId) }); }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text-primary">{conv.name || `User #${conv.otherUserId}`}</div>
                      <div className="text-xs text-text-secondary line-clamp-1">{conv.last_message || ''}</div>
                    </div>
                    <div className="text-xs text-text-secondary text-right min-w-[88px]">{conv.last_message_time && new Date(conv.last_message_time).toLocaleString()}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message thread */}
          <div className="elevated-card p-4 lg:col-span-2 flex flex-col min-h-[70vh]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{selectedConversation?.name || (selectedUserId ? `User #${selectedUserId}` : 'Select a conversation')}</h2>
                {error && <p className="text-sm text-error mt-1">{error}</p>}
              </div>
              <div className="text-xs text-text-secondary">
                {selectedConversation?.email && <span>{selectedConversation.email}</span>}
                {selectedConversation?.role && <span className="px-2 py-0.5 bg-muted rounded-full capitalize ml-2">{selectedConversation.role}</span>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
              {loadingMessages ? (
                <div className="text-sm text-text-secondary">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-text-secondary">No messages yet. Say hello!</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] p-3 rounded-lg ${m.sender_id === user?.id ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted text-text-primary'}`}>
                    <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                    <div className="text-[10px] opacity-75 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Type your message…"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <Button onClick={handleSend} disabled={!input.trim() || !selectedUserId}>
                <Icon name="Send" size={16} />
                <span className="ml-2">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ChatPage;


