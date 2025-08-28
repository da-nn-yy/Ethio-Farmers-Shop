import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import Button from '../../components/ui/Button';
import { ListingsApi } from '../../utils/api';
import { useToast } from '../../components/ui/Toast';

const FarmerListingsPage = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', crop: '', variety: '', quantity: '', unit: 'kg', pricePerUnit: '', region: '', woreda: ''
  });
  const { show } = useToast() || { show: ()=>{} };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const data = await ListingsApi.browse({ page: 1, pageSize: 50 });
      setListings((data?.items || []).filter(it => !!it));
    } catch (_) {
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadListings(); }, []);

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('farmconnect_language', lang);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await ListingsApi.create({
        title: form.title,
        crop: form.crop,
        variety: form.variety || null,
        quantity: Number(form.quantity),
        unit: form.unit,
        pricePerUnit: Number(form.pricePerUnit),
        region: form.region || null,
        woreda: form.woreda || null,
      });
      setForm({ title: '', crop: '', variety: '', quantity: '', unit: 'kg', pricePerUnit: '', region: '', woreda: '' });
      await loadListings();
      show && show(currentLanguage==='am' ? 'ዝርዝር ተፈጥሯል' : 'Listing created', 'success');
    } catch (e) {
      console.error(e);
      show && show(currentLanguage==='am' ? 'ስህተት ተፈጥሯል' : 'Failed to create listing', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        userRole="farmer"
        isAuthenticated={true}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      <TabNavigation userRole="farmer" />

      <main className="pt-32 lg:pt-36 pb-8 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
              {currentLanguage === 'am' ? 'ዝርዝሮቼ' : 'My Listings'}
            </h1>
          </div>

          {/* Create Listing */}
          <div className="bg-card border border-border rounded-lg p-4 lg:p-6 mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {currentLanguage === 'am' ? 'አዲስ ዝርዝር ይፍጠሩ' : 'Create New Listing'}
            </h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border border-border rounded-md p-2" placeholder={currentLanguage==='am'?'ርዕስ':'Title'} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
              <input className="border border-border rounded-md p-2" placeholder={currentLanguage==='am'?'እህል/ምርት':'Crop'} value={form.crop} onChange={e=>setForm({...form,crop:e.target.value})} required />
              <input className="border border-border rounded-md p-2" placeholder={currentLanguage==='am'?'ዝርያ':'Variety'} value={form.variety} onChange={e=>setForm({...form,variety:e.target.value})} />
              <input type="number" className="border border-border rounded-md p-2" placeholder={currentLanguage==='am'?'መጠን':'Quantity'} value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required />
              <select className="border border-border rounded-md p-2" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="crate">crate</option>
                <option value="bag">bag</option>
                <option value="unit">unit</option>
              </select>
              <input type="number" className="border border-border rounded-md p-2" placeholder={currentLanguage==='am'?'ዋጋ በኪሎ':'Price per unit'} value={form.pricePerUnit} onChange={e=>setForm({...form,pricePerUnit:e.target.value})} required />
              <input className="border border-border rounded-md p-2" placeholder={currentLanguage==='am'?'ክልል':'Region'} value={form.region} onChange={e=>setForm({...form,region:e.target.value})} />
              <input className="border border-border rounded-md p-2" placeholder={currentLanguage==='am'?'ወረዳ':'Woreda'} value={form.woreda} onChange={e=>setForm({...form,woreda:e.target.value})} />
              <div className="md:col-span-2">
                <Button type="submit" variant="primary" iconName="Plus" iconPosition="left">
                  {currentLanguage === 'am' ? 'ዝርዝር ይፍጠሩ' : 'Create Listing'}
                </Button>
              </div>
            </form>
          </div>

          {/* Listings Table */}
          <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {currentLanguage === 'am' ? 'ንቁ ዝርዝሮች' : 'Active Listings'}
            </h2>
            {isLoading ? (
              <p className="text-text-secondary">{currentLanguage==='am'?'በመጫን ላይ...':'Loading...'}</p>
            ) : listings.length === 0 ? (
              <p className="text-text-secondary">{currentLanguage==='am'?'ምንም ዝርዝር የለም':'No listings yet'}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-secondary">
                      <th className="py-2">ID</th>
                      <th className="py-2">Title</th>
                      <th className="py-2">Crop</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Unit</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="py-2">{l.id}</td>
                        <td className="py-2">{l.title || l.crop}</td>
                        <td className="py-2">{l.crop}</td>
                        <td className="py-2">{l.quantity}</td>
                        <td className="py-2">{l.unit}</td>
                        <td className="py-2">{l.price_per_unit}</td>
                        <td className="py-2">
                          <Button variant="outline" size="sm" className="mr-2" onClick={()=>navigate(`/farmer/listings/edit/${l.id}`)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={async()=>{ try{ await ListingsApi.remove(l.id); show && show('Deleted','success'); await loadListings(); }catch(_){ show && show('Delete failed','error'); } }}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerListingsPage;

