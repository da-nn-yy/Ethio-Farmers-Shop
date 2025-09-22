import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const VerificationSection = ({ userRole, currentLanguage }) => {
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const verificationDocuments = {
    farmer: [
      {
        id: 'national-id',
        name: 'National ID',
        nameAm: 'መታወቂያ ካርድ',
        status: 'verified',
        uploadDate: '2024-01-15',
        required: true
      },
      {
        id: 'land-certificate',
        name: 'Land Use Certificate',
        nameAm: 'የመሬት ይዞታ ሰርተፊኬት',
        status: 'verified',
        uploadDate: '2024-01-16',
        required: true
      },
      {
        id: 'organic-certificate',
        name: 'Organic Certification',
        nameAm: 'የኦርጋኒክ ሰርተፊኬት',
        status: 'pending',
        uploadDate: '2024-01-20',
        required: false
      },
      {
        id: 'cooperative-membership',
        name: 'Cooperative Membership',
        nameAm: 'የህብረት ስራ አባልነት',
        status: 'not-uploaded',
        uploadDate: null,
        required: false
      }
    ],
    buyer: [
      {
        id: 'national-id',
        name: 'National ID',
        nameAm: 'መታወቂያ ካርድ',
        status: 'verified',
        uploadDate: '2024-02-10',
        required: true
      },
      {
        id: 'business-license',
        name: 'Business License',
        nameAm: 'የንግድ ፈቃድ',
        status: 'not-uploaded',
        uploadDate: null,
        required: false
      },
      {
        id: 'tax-certificate',
        name: 'Tax Registration Certificate',
        nameAm: 'የግብር ምዝገባ ሰርተፊኬት',
        status: 'not-uploaded',
        uploadDate: null,
        required: false
      }
    ]
  };

  const documents = verificationDocuments?.[userRole];

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: {
        color: 'bg-success/10 text-success border-success/20',
        icon: 'CheckCircle',
        text: currentLanguage === 'am' ? 'የተረጋገጠ' : 'Verified',
        textColor: 'text-success'
      },
      pending: {
        color: 'bg-warning/10 text-warning border-warning/20',
        icon: 'Clock',
        text: currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending',
        textColor: 'text-warning'
      },
      rejected: {
        color: 'bg-error/10 text-error border-error/20',
        icon: 'XCircle',
        text: currentLanguage === 'am' ? 'ተቀባይነት የለውም' : 'Rejected',
        textColor: 'text-error'
      },
      'not-uploaded': {
        color: 'bg-muted text-text-secondary border-border',
        icon: 'Upload',
        text: currentLanguage === 'am' ? 'አልተላከም' : 'Not Uploaded',
        textColor: 'text-text-secondary'
      }
    };

    const config = statusConfig?.[status];
    
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}>
        <Icon name={config?.icon} size={12} className={config?.textColor} />
        <span>{config?.text}</span>
      </div>
    );
  };

  const handleFileUpload = (docId, event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setUploadingDoc(docId);
      // Simulate upload process
      setTimeout(() => {
        setUploadingDoc(null);
        // Update document status logic here
      }, 2000);
    }
  };

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getDocumentName = (doc) => {
    return currentLanguage === 'am' ? doc?.nameAm : doc?.name;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          {getLabel('Verification Documents', 'የማረጋገጫ ሰነዶች')}
        </h2>
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} className="text-primary" />
          <span className="text-sm text-text-secondary">
            {getLabel('Secure Upload', 'ደህንነቱ የተጠበቀ ስርጭት')}
          </span>
        </div>
      </div>
      {/* Verification Progress */}
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            {getLabel('Verification Progress', 'የማረጋገጫ ሂደት')}
          </span>
          <span className="text-sm font-bold text-primary">
            {Math.round((documents?.filter(doc => doc?.status === 'verified' && doc?.required)?.length / documents?.filter(doc => doc?.required)?.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(documents?.filter(doc => doc?.status === 'verified' && doc?.required)?.length / documents?.filter(doc => doc?.required)?.length) * 100}%` 
            }}
          ></div>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {getLabel(
            `${documents?.filter(doc => doc?.status === 'verified' && doc?.required)?.length} of ${documents?.filter(doc => doc?.required)?.length} required documents verified`,
            `${documents?.filter(doc => doc?.status === 'verified' && doc?.required)?.length} ከ ${documents?.filter(doc => doc?.required)?.length} የሚያስፈልጉ ሰነዶች ተረጋግጠዋል`
          )}
        </p>
      </div>
      {/* Documents List */}
      <div className="space-y-4">
        {documents?.map((doc) => (
          <div key={doc?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-text-primary">
                    {getDocumentName(doc)}
                  </h3>
                  {doc?.required && (
                    <span className="text-xs text-error">*</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(doc?.status)}
                  {doc?.uploadDate && (
                    <span className="text-xs text-text-secondary">
                      {getLabel('Uploaded:', 'ተላክቷል:')} {new Date(doc.uploadDate)?.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {doc?.status === 'verified' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Eye"
                    iconPosition="left"
                  >
                    {getLabel('View', 'ይመልከቱ')}
                  </Button>
                )}
                
                {(doc?.status === 'not-uploaded' || doc?.status === 'rejected') && (
                  <div className="relative">
                    <input
                      type="file"
                      id={`upload-${doc?.id}`}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(doc?.id, e)}
                      disabled={uploadingDoc === doc?.id}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      loading={uploadingDoc === doc?.id}
                      iconName="Upload"
                      iconPosition="left"
                      disabled={uploadingDoc === doc?.id}
                    >
                      {getLabel('Upload', 'ላክ')}
                    </Button>
                  </div>
                )}
                
                {doc?.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Clock"
                    iconPosition="left"
                    disabled
                  >
                    {getLabel('Processing', 'በሂደት ላይ')}
                  </Button>
                )}
                
                {(doc?.status === 'verified' || doc?.status === 'pending') && (
                  <div className="relative">
                    <input
                      type="file"
                      id={`replace-${doc?.id}`}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(doc?.id, e)}
                      disabled={uploadingDoc === doc?.id}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="RefreshCw"
                      iconPosition="left"
                      disabled={uploadingDoc === doc?.id}
                    >
                      {getLabel('Replace', 'ቀይር')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {doc?.status === 'rejected' && (
              <div className="mt-3 p-3 bg-error/5 border border-error/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-error mb-1">
                      {getLabel('Document Rejected', 'ሰነድ ተቀባይነት አላገኘም')}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {getLabel(
                        'The document quality is poor. Please upload a clear, high-resolution image.',
                        'የሰነዱ ጥራት ዝቅተኛ ነው። እባክዎ ግልጽ እና ከፍተኛ ጥራት ያለው ምስል ይላኩ።'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Upload Guidelines */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium text-text-primary mb-2">
          {getLabel('Upload Guidelines', 'የስርጭት መመሪያዎች')}
        </h4>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• {getLabel('Accepted formats: PDF, JPG, PNG', 'የተቀበሉ ቅርጸቶች: PDF, JPG, PNG')}</li>
          <li>• {getLabel('Maximum file size: 5MB', 'ከፍተኛ የፋይል መጠን: 5MB')}</li>
          <li>• {getLabel('Ensure documents are clear and readable', 'ሰነዶች ግልጽ እና ሊነበቡ የሚችሉ መሆናቸውን ያረጋግጡ')}</li>
          <li>• {getLabel('All personal information must be visible', 'ሁሉም የግል መረጃዎች መታየት አለባቸው')}</li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationSection;