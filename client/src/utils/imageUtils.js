/**
 * Utility functions for image URL normalization and handling
 */

/**
 * Normalizes an image URL to a full URL
 * Handles both full URLs (http/https) and relative paths
 * 
 * @param {string|null|undefined} img - Image URL or path
 * @returns {string|null} - Normalized full URL or null
 */
export const normalizeImageUrl = (img) => {
  if (!img) return null;
  
  // If already a full URL, return as-is
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }
  
  // If it's a relative path, convert to full URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
  // Remove leading slash if present
  const cleanPath = img.startsWith('/') ? img.slice(1) : img;
  return `${API_BASE}/${cleanPath}`;
};

/**
 * Gets all images from a listing object
 * Handles both listing.images array and listing.image single property
 * 
 * @param {Object} listing - Listing object
 * @returns {Array<string>} - Array of normalized image URLs
 */
export const getListingImages = (listing) => {
  const images = [];

  const addImage = (img) => {
    if (!img) return;
    const normalized = normalizeImageUrl(img);
    if (normalized && !images.includes(normalized)) {
      images.push(normalized);
    }
  };

  // Handle listing.images as array of strings or objects with url/path
  if (Array.isArray(listing?.images) && listing.images.length > 0) {
    listing.images.forEach((img) => addImage(typeof img === 'string' ? img : img?.url || img?.path));
  }

  // Handle legacy/image_urls or imageUrls fields (array or JSON string)
  if (images.length === 0 && listing?.image_urls) {
    const raw = listing.image_urls;
    if (Array.isArray(raw)) {
      raw.forEach((img) => addImage(typeof img === 'string' ? img : img?.url || img?.path));
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => addImage(typeof img === 'string' ? img : img?.url || img?.path));
        }
      } catch (err) {
        // If comma separated, split and trim
        raw.split(',').map((s) => s.trim()).forEach(addImage);
      }
    }
  }

  if (images.length === 0 && Array.isArray(listing?.imageUrls)) {
    listing.imageUrls.forEach((img) => addImage(typeof img === 'string' ? img : img?.url || img?.path));
  }

  // Handle uploadedImages arrays used by uploader gallery
  if (images.length === 0 && Array.isArray(listing?.uploadedImages)) {
    listing.uploadedImages.forEach((img) => addImage(typeof img === 'string' ? img : img?.url || img?.path));
  }

  if (images.length === 0 && Array.isArray(listing?.uploaded_images)) {
    listing.uploaded_images.forEach((img) => addImage(typeof img === 'string' ? img : img?.url || img?.path));
  }

  // Single image fallback
  if (images.length === 0 && listing?.image) {
    addImage(typeof listing.image === 'string' ? listing.image : listing.image?.url || listing.image?.path);
  }

  return images;
};
