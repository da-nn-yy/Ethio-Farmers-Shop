/**
 * Utility functions for handling listing duplication
 */

/**
 * Navigate to add-listing page with duplicate parameter
 * @param {Function} navigate - React Router navigate function
 * @param {string|number} listingId - ID of the listing to duplicate
 */
export const navigateToDuplicateListing = (navigate, listingId) => {
  if (!listingId) {
    console.error('No listing ID provided for duplication');
    return;
  }
  
  // Navigate to add-listing page with duplicate parameter
  navigate(`/add-listing?duplicate=${listingId}`);
};

/**
 * Navigate to add-listing page with edit parameter
 * @param {Function} navigate - React Router navigate function
 * @param {string|number} listingId - ID of the listing to edit
 */
export const navigateToEditListing = (navigate, listingId) => {
  if (!listingId) {
    console.error('No listing ID provided for editing');
    return;
  }
  
  // Navigate to add-listing page with edit parameter
  navigate(`/add-listing?edit=${listingId}`);
};

/**
 * Get URL parameters for listing actions
 * @param {string} action - 'edit' or 'duplicate'
 * @param {string|number} listingId - ID of the listing
 * @returns {string} URL with parameters
 */
export const getListingActionUrl = (action, listingId) => {
  if (!action || !listingId) {
    console.error('Action and listing ID are required');
    return '/add-listing';
  }
  
  return `/add-listing?${action}=${listingId}`;
};

/**
 * Check if current page is in duplicate mode
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {boolean} True if in duplicate mode
 */
export const isDuplicateMode = (searchParams) => {
  return searchParams.get('duplicate') !== null;
};

/**
 * Check if current page is in edit mode
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {boolean} True if in edit mode
 */
export const isEditMode = (searchParams) => {
  return searchParams.get('edit') !== null;
};

/**
 * Get listing ID from URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {string} mode - 'duplicate' or 'edit'
 * @returns {string|null} Listing ID or null
 */
export const getListingIdFromParams = (searchParams, mode) => {
  return searchParams.get(mode);
};
