import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CertificationManagement = ({ currentLanguage }) => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    certification_type: '',
    certification_body: '',
    issue_date: '',
    expiry_date: '',
    certification_document: null
  });

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        
        const { data } = await axios.get(`${API_BASE}/farmer-profile/certifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCertifications(data);
      }
    } catch (error) {
      console.error('Failed to load certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadForm(prev => ({
      ...prev,
      certification_document: file
    }));
  };

  const handleUpload = async () => {
    if (!uploadForm.certification_document) {
      alert(getLabel('Please select a document to upload', 'እባክዎ ለመላክ ሰነድ ይምረጡ'));
      return;
    }

    setUploading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        
        const formData = new FormData();
        formData.append('certification_document', uploadForm.certification_document);
        formData.append('certification_type', uploadForm.certification_type);
        formData.append('certification_body', uploadForm.certification_body);
        formData.append('issue_date', uploadForm.issue_date);
        formData.append('expiry_date', uploadForm.expiry_date);
        
        await axios.post(`${API_BASE}/farmer-profile/certifications`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Reset form and reload certifications
        setUploadForm({
          certification_type: '',
          certification_body: '',
          issue_date: '',
          expiry_date: '',
          certification_document: null
        });
        setShowUploadForm(false);
        loadCertifications();
        
        alert(getLabel('Certification uploaded successfully!', 'ማረጋገጫ በተሳካ ሁኔታ ተላከ!'));
      }
    } catch (error) {
      console.error('Failed to upload certification:', error);
      alert(getLabel('Failed to upload certification. Please try again.', 'ማረጋገጫ መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'));
    } finally {
      setUploading(false);
    }
  };

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-success bg-success/10';
      case 'rejected': return 'text-error bg-error/10';
      case 'pending': return 'text-warning bg-warning/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'CheckCircle';
      case 'rejected': return 'XCircle';
      case 'pending': return 'Clock';
      default: return 'HelpCircle';
    }
  };

  const certificationTypeOptions = [
    { value: 'organic', label: 'Organic Certification', labelAm: 'ኦርጋኒክ ማረጋገጫ' },
    { value: 'fair-trade', label: 'Fair Trade Certification', labelAm: 'ፌር ትሬድ ማረጋገጫ' },
    { value: 'gmp', label: 'Good Manufacturing Practice', labelAm: 'ጥሩ የምርት ልምድ' },
    { value: 'haccp', label: 'HACCP Certification', labelAm: 'HACCP ማረጋገጫ' },
    { value: 'iso', label: 'ISO Certification', labelAm: 'ISO ማረጋገጫ' },
    { value: 'other', label: 'Other', labelAm: 'ሌላ' }
  ];

  const certificationBodyOptions = [
    { value: 'ethiopian-organic', label: 'Ethiopian Organic Certification', labelAm: 'ኢትዮጵያ ኦርጋኒክ ማረጋገጫ' },
    { value: 'fair-trade-ethiopia', label: 'Fair Trade Ethiopia', labelAm: 'ፌር ትሬድ ኢትዮጵያ' },
    { value: 'international-organic', label: 'International Organic', labelAm: 'ዓለም አቀፍ ኦርጋኒክ' },
    { value: 'local-authority', label: 'Local Authority', labelAm: 'የአካባቢ ባለስልጣን' },
    { value: 'other', label: 'Other', labelAm: 'ሌላ' }
  ];

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {getLabel('Certification Management', 'ማረጋገጫ አስተዳደር')}
          </h3>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowUploadForm(!showUploadForm)}
            iconName="Plus"
            iconPosition="left"
          >
            {getLabel('Add Certification', 'ማረጋገጫ ጨምር')}
          </Button>
        </div>
        
        <p className="text-sm text-text-secondary">
          {getLabel(
            'Upload and manage your farm certifications to build trust with buyers and increase your marketability.',
            'ከገዢዎች ጋር የመተማመን ግንኙነት ለመገንባት እና የገበያ ችሎታዎን ለማሳደግ የእርሻ ማረጋገጫዎችዎን ይላኩ እና ያስተዳድሩ።'
          )}
        </p>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
          <h4 className="text-md font-semibold text-text-primary mb-4">
            {getLabel('Upload New Certification', 'አዲስ ማረጋገጫ ይላኩ')}
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select
              label={getLabel('Certification Type', 'የማረጋገጫ አይነት')}
              options={certificationTypeOptions.map(type => ({
                value: type.value,
                label: getLabel(type.label, type.labelAm)
              }))}
              value={uploadForm.certification_type}
              onChange={(value) => setUploadForm(prev => ({ ...prev, certification_type: value }))}
            />
            
            <Select
              label={getLabel('Certification Body', 'የማረጋገጫ አካል')}
              options={certificationBodyOptions.map(body => ({
                value: body.value,
                label: getLabel(body.label, body.labelAm)
              }))}
              value={uploadForm.certification_body}
              onChange={(value) => setUploadForm(prev => ({ ...prev, certification_body: value }))}
            />
            
            <Input
              label={getLabel('Issue Date', 'የተሰጠበት ቀን')}
              type="date"
              value={uploadForm.issue_date}
              onChange={(e) => setUploadForm(prev => ({ ...prev, issue_date: e.target.value }))}
            />
            
            <Input
              label={getLabel('Expiry Date', 'የሚያልቅበት ቀን')}
              type="date"
              value={uploadForm.expiry_date}
              onChange={(e) => setUploadForm(prev => ({ ...prev, expiry_date: e.target.value }))}
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              {getLabel('Certification Document', 'የማረጋገጫ ሰነድ')}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="w-full p-3 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-text-secondary mt-1">
              {getLabel('Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)', 'የሚደገፉ ቅርጸቶች: PDF, JPG, PNG, DOC, DOCX (ከፍተኛ 10MB)')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-6">
            <Button
              variant="default"
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              iconName="Upload"
              iconPosition="left"
            >
              {uploading ? getLabel('Uploading...', 'በመላክ ላይ...') : getLabel('Upload', 'ላክ')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadForm(false)}
            >
              {getLabel('Cancel', 'ሰርዝ')}
            </Button>
          </div>
        </div>
      )}

      {/* Certifications List */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <h4 className="text-md font-semibold text-text-primary mb-4">
          {getLabel('Your Certifications', 'የእርስዎ ማረጋገጫዎች')}
        </h4>
        
        {certifications.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted" />
            <p className="text-text-secondary mb-2">
              {getLabel('No certifications uploaded yet', 'እስካሁን ማረጋገጫ አልተላከም')}
            </p>
            <p className="text-sm text-text-secondary">
              {getLabel('Upload your first certification to get started', 'ለመጀመር የመጀመሪያ ማረጋገጫዎን ይላኩ')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-medium text-text-primary">
                        {getLabel(cert.certification_type.replace('-', ' '), cert.certification_type)}
                      </h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                        <Icon name={getStatusIcon(cert.status)} size={12} className="inline mr-1" />
                        {getLabel(cert.status, cert.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">
                          {getLabel('Issued by:', 'የተሰጠው በ:')}
                        </span>
                        <p className="font-medium text-text-primary">
                          {getLabel(cert.certification_body.replace('-', ' '), cert.certification_body)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-text-secondary">
                          {getLabel('Issue Date:', 'የተሰጠበት ቀን:')}
                        </span>
                        <p className="font-medium text-text-primary">
                          {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-text-secondary">
                          {getLabel('Expiry Date:', 'የሚያልቅበት ቀን:')}
                        </span>
                        <p className="font-medium text-text-primary">
                          {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-text-secondary">
                          {getLabel('Uploaded:', 'የተላከው:')}
                        </span>
                        <p className="font-medium text-text-primary">
                          {new Date(cert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <a
                      href={cert.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title={getLabel('View Document', 'ሰነድ ይመልከቱ')}
                    >
                      <Icon name="ExternalLink" size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationManagement;
