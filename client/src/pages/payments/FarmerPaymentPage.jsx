import React, { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import { orderService } from '../../services/apiService.js';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import paymentService from '../../services/paymentService.js';

const FarmerPaymentPage = () => {
  const { language } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  // Payout methods state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutTab, setPayoutTab] = useState('methods'); // 'methods' | 'add'
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [newMethod, setNewMethod] = useState({ type: 'bank', details: {} });
  const [verifyModal, setVerifyModal] = useState({ open: false, id: null, code: '' });
  const [providers, setProviders] = useState({ banks: [], mobileProviders: [] });

  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => { 
    if (language !== currentLanguage) setCurrentLanguage(language); 
  }, [language]);

  useEffect(() => { load(true); }, []);
  useEffect(() => { if (showPayoutModal) { loadPayoutMethods(); loadProviders(); } }, [showPayoutModal]);

  const load = async (reset = false) => {
    try {
      setLoading(true);
      // Fetch farmer orders and map payments from completed orders
      const res = await orderService.getFarmerOrders({ status: 'completed', page: reset ? 1 : page, limit: 10 });
      const items = Array.isArray(res) ? res : (res.orders || []);
      const mapped = items.map(o => ({
        id: o.id,
        amount: Number(o.totalPrice || o.total || 0),
        createdAt: o.createdAt || o.created_at,
        buyerName: o.buyerName,
        reference: `ORD-${o.id}`,
        method: o.paymentMethod || 'Cash',
        status: 'received'
      }));
      setPayments(reset ? mapped : [...payments, ...mapped]);
      setHasMore(res?.pagination?.hasNext || false);
      if (reset) setPage(1);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
    return { count: payments.length, total };
  }, [payments]);

  // Payout methods helpers
  const loadPayoutMethods = async () => {
    try {
      setLoadingPayouts(true);
      const userId = localStorage.getItem('userId') || 'me';
      const res = await paymentService.getPaymentMethods(userId);
      const list = res?.data || res?.methods || res || [];
      setPayoutMethods(Array.isArray(list) ? list : []);
    } catch (_) {
      setPayoutMethods([]);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const addPayoutMethod = async () => {
    try {
      setLoadingPayouts(true);
      const userId = localStorage.getItem('userId') || 'me';
      await paymentService.addPaymentMethod(userId, newMethod);
      setNewMethod({ type: 'bank', details: {} });
      setPayoutTab('methods');
      await loadPayoutMethods();
    } catch (_) {
      alert(currentLanguage === 'am' ? 'መክፈያ ዘዴ መጨመር አልተሳካም' : 'Failed to add payout method');
    } finally {
      setLoadingPayouts(false);
    }
  };

  const removePayoutMethod = async (id) => {
    try {
      setLoadingPayouts(true);
      await paymentService.removePaymentMethod(id);
      await loadPayoutMethods();
    } catch (_) {
    } finally {
      setLoadingPayouts(false);
    }
  };

  const loadProviders = async () => {
    try {
      const { default: apiClient } = await import('../../services/apiService.js');
      const resp = await apiClient.get('/payments/providers');
      if (resp?.data?.data) setProviders(resp.data.data);
    } catch (_) {}
  };

  const openVerify = (id) => setVerifyModal({ open: true, id, code: '' });
  const submitVerify = async () => {
    try {
      setLoadingPayouts(true);
      await paymentService.verifyPaymentMethod(verifyModal.id, verifyModal.code || '123456');
      setVerifyModal({ open: false, id: null, code: '' });
      await loadPayoutMethods();
    } catch (_) {
      alert(currentLanguage === 'am' ? 'ማረጋገጫ አልተሳካም' : 'Verification failed');
    } finally {
      setLoadingPayouts(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            {currentLanguage === 'am' ? 'የተቀበሉ ክፍያዎች' : 'Payments Received'}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" iconName="Wallet" onClick={() => setShowPayoutModal(true)}>
              {currentLanguage === 'am' ? 'የክፍያ መቀበያዎች' : 'Payout Methods'}
            </Button>
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => load(true)}>
              {currentLanguage === 'am' ? 'አድስ' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="CreditCard" size={16} className="text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">ETB {totals.total.toFixed(2)}</div>
              <div className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'ጠቅላላ የተቀበሉ' : 'Total Received'}
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Hash" size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{totals.count}</div>
              <div className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'ክፍያዎች' : 'Payments'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'የክፍያ ታሪክ' : 'Payment History'}
            </h2>
          </div>
          <div className="divide-y">
            {loading && payments.length === 0 && (
              <div className="p-6 text-center text-text-secondary">
                {currentLanguage === 'am' ? 'ክፍያዎች በመጫን ላይ...' : 'Loading payments...'}
              </div>
            )}
            {error && (
              <div className="p-4 text-error">{error}</div>
            )}
            {payments.length === 0 && !loading && (
              <div className="p-6 text-center text-text-secondary">
                {currentLanguage === 'am' ? 'ምንም ክፍያ አልተገኘም' : 'No payments found'}
              </div>
            )}
            {payments.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">{p.reference}</div>
                  <div className="text-sm text-text-secondary">
                    {new Date(p.createdAt).toLocaleString()} • {p.method}
                  </div>
                  {p.buyerName && (
                    <div className="text-sm text-text-secondary">
                      {currentLanguage === 'am' ? 'ከ' : 'From'}: {p.buyerName}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-text-primary">ETB {p.amount.toFixed(2)}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                    {currentLanguage === 'am' ? 'ተቀብሏል' : 'Received'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-4 border-t">
              <Button variant="outline" onClick={() => { setPage(p => p + 1); load(false); }}>
                {currentLanguage === 'am' ? 'ተጨማሪ ጫን' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Payout Methods Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">{currentLanguage === 'am' ? 'የክፍያ መቀበያዎች' : 'Payout Methods'}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPayoutModal(false)}><Icon name="X" /></Button>
              </div>
              <div className="flex gap-2 mb-4">
                <Button variant={payoutTab === 'methods' ? 'default' : 'outline'} size="sm" onClick={() => setPayoutTab('methods')}>
                  {currentLanguage === 'am' ? 'ዝርዝር' : 'Methods'}
                </Button>
                <Button variant={payoutTab === 'add' ? 'default' : 'outline'} size="sm" onClick={() => setPayoutTab('add')}>
                  {currentLanguage === 'am' ? 'አዲስ መጨመር' : 'Add New'}
                </Button>
              </div>

              {payoutTab === 'methods' && (
                <div className="space-y-3">
                  {loadingPayouts && <div className="text-sm text-text-secondary">{currentLanguage === 'am' ? 'በመጫን ላይ...' : 'Loading...'}</div>}
                  {(!loadingPayouts && payoutMethods.length === 0) && (
                    <div className="text-sm text-text-secondary">{currentLanguage === 'am' ? 'መቀበያ አልተገኘም' : 'No payout methods found'}</div>
                  )}
                  {payoutMethods.map((m) => (
                    <div key={m.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon name={m.type === 'mobile' ? 'Smartphone' : 'Building2'} />
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">{m.type === 'mobile' ? 'Mobile Money' : 'Bank'}</div>
                          <div className="text-sm text-text-secondary">{m.details?.accountNumber || m.details?.phoneNumber || ''}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${m.is_verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {m.is_verified ? (currentLanguage === 'am' ? 'ማረጋገጫ ተሳክቷል' : 'Verified') : (currentLanguage === 'am' ? 'ማረጋገጫ አልተሳካም' : 'Unverified')}
                        </span>
                        {!m.is_verified && (
                          <Button variant="outline" size="sm" onClick={() => openVerify(m.id)}>
                            {currentLanguage === 'am' ? 'አረጋግጥ' : 'Verify'}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => removePayoutMethod(m.id)}>
                          {currentLanguage === 'am' ? 'አስወግድ' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {payoutTab === 'add' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{currentLanguage === 'am' ? 'አይነት' : 'Type'}</label>
                    <select value={newMethod.type} onChange={(e) => setNewMethod({ type: e.target.value, details: {} })} className="w-full p-3 border border-border rounded-lg">
                      <option value="bank">{currentLanguage === 'am' ? 'ባንክ' : 'Bank'}</option>
                      <option value="mobile">{currentLanguage === 'am' ? 'ሞባይል ገንዘብ' : 'Mobile Money'}</option>
                    </select>
                  </div>

                  {newMethod.type === 'bank' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">{currentLanguage === 'am' ? 'የባንክ ስም' : 'Bank Name'}</label>
                        <input className="w-full p-3 border border-border rounded-lg" value={newMethod.details.bankName || ''} onChange={(e) => setNewMethod(prev => ({ ...prev, details: { ...prev.details, bankName: e.target.value } }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">{currentLanguage === 'am' ? 'የመለያ ቁጥር' : 'Account Number'}</label>
                        <input className="w-full p-3 border border-border rounded-lg" value={newMethod.details.accountNumber || ''} onChange={(e) => setNewMethod(prev => ({ ...prev, details: { ...prev.details, accountNumber: e.target.value } }))} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-primary mb-2">{currentLanguage === 'am' ? 'የተቀባዩ ስም' : 'Account Holder Name'}</label>
                        <input className="w-full p-3 border border-border rounded-lg" value={newMethod.details.accountHolderName || ''} onChange={(e) => setNewMethod(prev => ({ ...prev, details: { ...prev.details, accountHolderName: e.target.value } }))} />
                      </div>
                    </div>
                  )}

                  {newMethod.type === 'mobile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">{currentLanguage === 'am' ? 'አቅራቢ' : 'Provider'}</label>
                        <select className="w-full p-3 border border-border rounded-lg" value={newMethod.details.provider || ''} onChange={(e) => setNewMethod(prev => ({ ...prev, details: { ...prev.details, provider: e.target.value } }))}>
                          <option value="">{currentLanguage === 'am' ? 'ይምረጡ' : 'Select'}</option>
                          {(providers.mobileProviders || []).map(p => (
                            <option key={p.code} value={p.provider || p.code}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">{currentLanguage === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}</label>
                        <input className="w-full p-3 border border-border rounded-lg" value={newMethod.details.phoneNumber || ''} onChange={(e) => setNewMethod(prev => ({ ...prev, details: { ...prev.details, phoneNumber: e.target.value } }))} placeholder="+251 9XX XXX XXX" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPayoutTab('methods')}>{currentLanguage === 'am' ? 'ይሰርዙ' : 'Cancel'}</Button>
                    <Button onClick={addPayoutMethod} disabled={loadingPayouts}>{currentLanguage === 'am' ? 'አክል' : 'Add'}</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{currentLanguage === 'am' ? 'መክፈያ ዘዴ ያረጋግጡ' : 'Verify Payout Method'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setVerifyModal({ open: false, id: null, code: '' })}><Icon name="X" /></Button>
            </div>
            <p className="text-sm text-text-secondary mb-3">{currentLanguage === 'am' ? 'የማረጋገጫ ኮድ ያስገቡ (ለሙከራ 123456)' : 'Enter verification code (use 123456 for demo)'}</p>
            <input className="w-full p-3 border border-border rounded-lg mb-4" value={verifyModal.code} onChange={(e) => setVerifyModal(v => ({ ...v, code: e.target.value }))} placeholder="123456" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVerifyModal({ open: false, id: null, code: '' })}>{currentLanguage === 'am' ? 'ይሰርዙ' : 'Cancel'}</Button>
              <Button onClick={submitVerify} disabled={loadingPayouts}>{currentLanguage === 'am' ? 'አረጋግጥ' : 'Verify'}</Button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default FarmerPaymentPage;


