import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import Button from '../../components/ui/Button';
import { ListingsApi } from '../../utils/api';
import { useToast } from '../../components/ui/Toast';

const EditListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [form, setForm] = useState({ title: '', crop: '', variety: '', quantity: '', unit: 'kg', pricePerUnit: '', region: '', woreda: '', status: 'active' });
  const { show } = useToast() || { show: ()=>{} };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const found = await ListingsApi.get(id);
        if (found) {
          setForm({
            title: found.title || '', crop: found.crop || '', variety: found.variety || '', quantity: found.quantity || '', unit: found.unit || 'kg', pricePerUnit: found.price_per_unit || '', region: found.region || '', woreda: found.woreda || '', status: found.status || 'active'
          });
        }
      } catch (_) {}
    };
    load();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await ListingsApi.update(id, {
        title: form.title,
        crop: form.crop,
        variety: form.variety || null,
        quantity: Number(form.quantity),
        unit: form.unit,
        pricePerUnit: Number(form.pricePerUnit),
        region: form.region || null,
        woreda: form.woreda || null,
        status: form.status
      });
      show && show(currentLanguage==='am' ? 'ተመዝግቧል' : 'Saved', 'success');
      navigate('/farmer/listings');
    } catch (e) {
      show && show(currentLanguage==='am' ? 'ማስቀመጥ አልተሳካም' : 'Save failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader userRole="farmer" isAuthenticated={true} currentLanguage={currentLanguage} onLanguageChange={(l)=>{setCurrentLanguage(l); localStorage.setItem('farmconnect_language', l);}} />
      <TabNavigation userRole="farmer" />
      <main className="pt-32 lg:pt-36 pb-8 px-4 lg:px-6">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-6">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{currentLanguage==='am'?'ዝርዝር አርትዕ':'Edit Listing'}</h1>
          <form onSubmit={handleSave} className="space-y-3">
            <input className="w-full border border-border rounded-md p-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <input className="w-full border border-border rounded-md p-2" placeholder="Crop" value={form.crop} onChange={e=>setForm({...form,crop:e.target.value})} />
            <input className="w-full border border-border rounded-md p-2" placeholder="Variety" value={form.variety} onChange={e=>setForm({...form,variety:e.target.value})} />
            <input type="number" className="w-full border border-border rounded-md p-2" placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} />
            <select className="w-full border border-border rounded-md p-2" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="crate">crate</option>
              <option value="bag">bag</option>
              <option value="unit">unit</option>
            </select>
            <input type="number" className="w-full border border-border rounded-md p-2" placeholder="Price per unit" value={form.pricePerUnit} onChange={e=>setForm({...form,pricePerUnit:e.target.value})} />
            <input className="w-full border border-border rounded-md p-2" placeholder="Region" value={form.region} onChange={e=>setForm({...form,region:e.target.value})} />
            <input className="w-full border border-border rounded-md p-2" placeholder="Woreda" value={form.woreda} onChange={e=>setForm({...form,woreda:e.target.value})} />
            <select className="w-full border border-border rounded-md p-2" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="sold">sold</option>
              <option value="expired">expired</option>
            </select>
            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary">{currentLanguage==='am'?'አስቀምጥ':'Save'}</Button>
              <Button type="button" variant="outline" onClick={()=>navigate('/farmer/listings')}>{currentLanguage==='am'?'ይቅር':'Cancel'}</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditListingPage;

