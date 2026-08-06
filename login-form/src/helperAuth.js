export const fetchUserProfile = async (token) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('Profile response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    return data;
  } catch (err) {
    console.error('Profile fetch error:', err);
    throw err;
  }
};