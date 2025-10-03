// Temporary admin login utility to fix token issue
export const setAdminToken = () => {
  if (typeof window !== 'undefined') {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGU0ZDAyNWIxNTU2MGQzZTdmZTg1NSIsImVtYWlsIjoic2hpdmFuc2guc2Q4QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJzaGl2YW5zaCIsImlhdCI6MTc1OTQ4MTI1NSwiZXhwIjoxNzYwMDg2MDU1fQ.bOIDFINvzpvtS2M24je1ENpoQSSg9m3W6xDA7jy7DrM';
    const adminData = {
      _id: '68de4d025b15560d3e7fe855',
      name: 'shivansh',
      email: 'shivansh.sd8@gmail.com',
      role: 'admin',
      isActive: true
    };
    
    localStorage.setItem('adminToken', validToken);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    
    console.log('✅ Admin token set successfully');
  }
};

// Call this function to fix the token issue
export const fixAdminToken = () => {
  setAdminToken();
  // Reload the page to refresh the auth state
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};
