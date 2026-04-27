export async function apiRequest(url, options = {}) {
  try {
    console.log('🌐 CALLING:', url, options.method || 'GET');

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: Request failed`);
    }

    console.log('✅ SUCCESS:', res.status, url);
    return data;
  } catch (err) {
    console.error('❌ API ERROR:', err.message, url);
    throw err;
  }
}

export function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token 
    ? { Authorization: `Bearer ${user.token}` }
    : {};
}