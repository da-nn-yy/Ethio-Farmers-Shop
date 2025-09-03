import React from 'react';

const ProductDetailsSection = ({ formData, formErrors, onUpdate, currentLanguage }) => {
  const produceTypes = [
    { value: 'vegetables', label: currentLanguage === 'en' ? 'Vegetables' : 'አትክልቶች', labelAm: 'አትክልቶች' },
    { value: 'fruits', label: currentLanguage === 'en' ? 'Fruits' : 'ፍራፍሬዎች', labelAm: 'ፍራፍሬዎች' },
    { value: 'grains', label: currentLanguage === 'en' ? 'Grains' : 'እህሎች', labelAm: 'እህሎች' },
    { value: 'legumes', label: currentLanguage === 'en' ? 'Legumes' : 'ጥራጥሬዎች', labelAm: 'ጥራጥሬዎች' },
    { value: 'spices', label: currentLanguage === 'en' ? 'Spices' : 'ቅመሞች', labelAm: 'ቅመሞች' },
    { value: 'other', label: currentLanguage === 'en' ? 'Other' : 'ሌላ', labelAm: 'ሌላ' }
  ];

  const qualityGrades = [
    { value: 'premium', label: currentLanguage === 'en' ? 'Premium' : 'ፕሪሚየም', labelAm: 'ፕሪሚየም' },
    { value: 'grade_a', label: currentLanguage === 'en' ? 'Grade A' : 'ደረጃ አ', labelAm: 'ደረጃ አ' },
    { value: 'grade_b', label: currentLanguage === 'en' ? 'Grade B' : 'ደረጃ ቢ', labelAm: 'ደረጃ ቢ' },
    { value: 'standard', label: currentLanguage === 'en' ? 'Standard' : 'መደበኛ', labelAm: 'መደበኛ' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Product Details' : 'የምርት ዝርዝሮች'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {currentLanguage === 'en'
            ? 'Provide basic information about your produce'
            : 'ስለ ምርትዎ መሰረታዊ መረጃ ይስጡ'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Product Name *' : 'የምርት ስም *'}
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => onUpdate('productName', e.target.value)}
            placeholder={currentLanguage === 'en' ? 'e.g., Fresh Tomatoes' : 'ለምሳሌ፣ ትኩስ ቲማቲም'}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              formErrors.productName ? 'border-red-500' : 'border-border'
            }`}
          />
          {formErrors.productName && (
            <p className="mt-1 text-sm text-red-500">{formErrors.productName}</p>
          )}
        </div>
        {/* Produce Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Produce Type *' : 'የምርት አይነት *'}
          </label>
          <select
            value={formData.produceType}
            onChange={(e) => onUpdate('produceType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              formErrors.produceType ? 'border-red-500' : 'border-border'
            }`}
          >
            <option value="">
              {currentLanguage === 'en' ? 'Select produce type' : 'የምርት አይነት ይምረጡ'}
            </option>
            {produceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {currentLanguage === 'en' ? type.label : type.labelAm}
              </option>
            ))}
          </select>
          {formErrors.produceType && (
            <p className="mt-1 text-sm text-red-500">{formErrors.produceType}</p>
          )}
        </div>

        {/* Quality Grade */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Quality Grade *' : 'የጥራት ደረጃ *'}
          </label>
          <select
            value={formData.qualityGrade}
            onChange={(e) => onUpdate('qualityGrade', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              formErrors.qualityGrade ? 'border-red-500' : 'border-border'
            }`}
          >
            <option value="">
              {currentLanguage === 'en' ? 'Select quality grade' : 'የጥራት ደረጃ ይምረጡ'}
            </option>
            {qualityGrades.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {currentLanguage === 'en' ? grade.label : grade.labelAm}
              </option>
            ))}
          </select>
          {formErrors.qualityGrade && (
            <p className="mt-1 text-sm text-red-500">{formErrors.qualityGrade}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {currentLanguage === 'en' ? 'Description *' : 'መግለጫ *'}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
            formErrors.description ? 'border-red-500' : 'border-border'
          }`}
          placeholder={currentLanguage === 'en'
            ? 'Describe your produce, including freshness, size, and any special characteristics...'
            : 'ስለ ምርትዎ ይግለጹ፣ ትኩስነት፣ መጠን እና ማንኛውም ልዩ ባህሪያት ጨምሮ...'}
        />
        <div className="flex justify-between items-center mt-1">
          {formErrors.description && (
            <p className="text-sm text-red-500">{formErrors.description}</p>
          )}
          <p className="text-sm text-muted-foreground ml-auto">
            {formData.description?.length || 0} / 500
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSection;
