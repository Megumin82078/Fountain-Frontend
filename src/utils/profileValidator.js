// Profile validation utility to avoid circular dependencies

export const validateStoredProfile = async (token) => {
  try {
    // Only validate if we have a token
    if (!token) return null;
    
    // For now, just return null to avoid circular dependency
    // Profile will be fetched when user accesses protected routes
    return null;
  } catch (error) {
    console.warn('Profile validation skipped:', error);
    return null;
  }
};