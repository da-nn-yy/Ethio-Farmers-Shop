import React, { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import { orderService } from '../../services/apiService.js';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const statusPills = {
  pending: { labelEn: 'Pending', labelAm: 'በመጠባበቅ ላይ', badge: 'bg-warning/10 text-warning' },
  confirmed: { labelEn: 'Confirmed', labelAm: 'ተረጋግጧል', badge: 'bg-primary/10 text-primary' },
  shipped: { labelEn: 'Shipped', labelAm: 'ተላክ', badge: 'bg-info/10 text-info' },
  completed: { labelEn: 'Completed', labelAm: 'ተጠናቅቋል', badge: 'bg-success/10 text-success' },
  cancelled: { labelEn: 'Cancelled', labelAm: 'ተሰርዟል', badge: 'bg-error/10 text-error' }
};

const FarmerOrders = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => { fetchOrders(true); }, [status]);

  const fetchOrders = async (reset = false) => {
    try {
      setLoading(true);
      const params = { page: reset ? 1 : page, limit: 20 };
      if (status !== 'all') params.status = status;
      const res = await orderService.getFarmerOrders(params);
      const newOrders = (res.orders || res || []).map(o => ({
        id: o.id,
        createdAt: o.created_at || o.createdAt,
        status: o.status,
        notes: o.notes,
        buyerName: o.buyer_name,
        buyerPhone: o.buyer_phone,
        buyerLocation: [o.buyer_region, o.buyer_woreda].filter(Boolean).join(', '),
        total: Number(o.subtotal || o.total || 0),
        items: Array.isArray(o.items) ? o.items : []
      }));
      setOrders(reset ? newOrders : [...orders, ...newOrders]);
      setHasMore(res?.pagination?.hasNext || false);
      if (reset) setPage(1);
    } catch (e) {
      console.error('Failed to load farmer orders', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter(o =>
      String(o.id).includes(s) ||
      (o.buyerName || '').toLowerCase().includes(s) ||
      (o.buyerLocation || '').toLowerCase().includes(s)
    );
  }, [orders, search]);

  const updateStatus = async (id, next) => {
    try {
      if (next === 'cancelled') {
        await orderService.cancelOrder(id);
      } else {
        await orderService.updateOrderStatus(id, next);
      }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
    } catch (e) {
      console.error('Failed to update order', e);
    }
  };

  const StatusBadge = ({ st }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusPills[st]?.badge || 'bg-muted text-text-secondary'}`}>
      {language === 'am' ? statusPills[st]?.labelAm : statusPills[st]?.labelEn}
    </span>
  );

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-start py-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg bg-input px-2">
              <Icon name="Search" size={16} className="text-text-secondary" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'am' ? 'ፈልግ...' : 'Search...'}
                className="bg-transparent px-2 py-1 text-sm outline-none"
              />
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              {['all','pending','confirmed','shipped','completed','cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1 text-sm ${status===st ? 'bg-primary text-white' : 'text-text-secondary hover:bg-muted'}`}
                >
                  {language==='am' ? (statusPills[st]?.labelAm || 'ሁሉ') : (statusPills[st]?.labelEn || 'All')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading && orders.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-secondary">
              {language === 'am' ? 'ትዕዛዞች በመጫን ላይ...' : 'Loading orders...'}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-2">📭</div>
              <p className="text-text-secondary">{language === 'am' ? 'ምንም ትዕዛዞች የሉም' : 'No orders found'}</p>
            </div>
          )}

          {filtered.map(o => (
            <div key={o.id} className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-text-primary">#{o.id}</h3>
                    <StatusBadge st={o.status} />
                  </div>
                  <p className="text-sm text-text-secondary">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-secondary">{language==='am' ? 'ጠቅላላ' : 'Total'}</div>
                  <div className="text-lg font-bold text-text-primary">ETB {o.total?.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded p-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="User" size={14} className="text-text-secondary" />
                  <span className="text-text-primary">{o.buyerName}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon name="Phone" size={14} className="text-text-secondary" />
                  <a href={`tel:${o.buyerPhone}`} className="text-primary hover:underline">{o.buyerPhone}</a>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon name="MapPin" size={14} className="text-text-secondary" />
                  <span className="text-text-secondary">{o.buyerLocation}</span>
                </div>
              </div>

              {o.items?.length > 0 && (
                <div className="divide-y border rounded-lg">
                  {o.items.map(it => (
                    <div key={it.id} className="p-3 flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium text-text-primary">{it.listing_title || it.name}</div>
                        <div className="text-text-secondary">{it.quantity} × ETB {Number(it.price_per_unit || it.pricePerUnit || 0).toFixed(2)}</div>
                      </div>
                      <div className="text-sm font-semibold text-text-primary">ETB {Number((it.price_per_unit||it.pricePerUnit||0) * (it.quantity||0)).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {o.status === 'pending' && (
                  <>
                    <Button onClick={() => updateStatus(o.id, 'confirmed')} iconName="Check" iconPosition="left" className="">{language==='am' ? 'ተቀበል' : 'Accept'}</Button>
                    <Button variant="outline" onClick={() => updateStatus(o.id, 'cancelled')} iconName="X" iconPosition="left">{language==='am' ? 'ውድቅ' : 'Decline'}</Button>
                  </>
                )}
                {o.status === 'confirmed' && (
                  <>
                    <Button onClick={() => updateStatus(o.id, 'shipped')} iconName="Truck" iconPosition="left">{language==='am' ? 'ላክ' : 'Mark Shipped'}</Button>
                  </>
                )}
                {o.status === 'shipped' && (
                  <>
                    <Button onClick={() => updateStatus(o.id, 'completed')} iconName="CheckCircle2" iconPosition="left">{language==='am' ? 'ያበቃ' : 'Mark Completed'}</Button>
                  </>
                )}
                {(o.status === 'completed' || o.status === 'cancelled') && (
                  <Button variant="ghost"><Icon name="Eye" size={14} className="mr-2" />{language==='am' ? 'ዝርዝር' : 'Details'}</Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center py-6">
            <Button variant="outline" onClick={() => { setPage(p => p+1); fetchOrders(false); }}>{language==='am' ? 'ተጨማሪ ይጫኑ' : 'Load More'}</Button>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default FarmerOrders;


