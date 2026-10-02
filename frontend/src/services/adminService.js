import API from './api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await API.get('/admin/dashboard');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await API.put(`/admin/users/${userId}/status?status=${status}`);
    return response.data;
  },

  createMedicine: async (data) => {
    const response = await API.post('/medicines', data);
    return response.data;
  },

  updateMedicine: async (id, data) => {
    const response = await API.put(`/medicines/${id}`, data);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await API.delete(`/medicines/${id}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await API.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await API.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id, replacementCategoryId) => {
    const response = await API.delete(`/categories/${id}`, {
      params: replacementCategoryId ? { replacementCategoryId } : {}
    });
    return response.data;
  },

  getCategoryMedicineCount: async (id) => {
    const response = await API.get(`/categories/${id}/medicine-count`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await API.get('/admin/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await API.put(`/admin/orders/${orderId}/status?status=${status}`);
    return response.data;
  },

  getPrescriptions: async (status) => {
    const response = await API.get('/admin/prescriptions', { params: { status } });
    return response.data;
  },

  approvePrescription: async (id, notes, medicineIds) => {
    const params = new URLSearchParams();
    if (notes) params.append('notes', notes);
    if (medicineIds && medicineIds.length > 0) {
      medicineIds.forEach((mId) => params.append('medicineIds', mId));
    }
    const response = await API.put(`/admin/prescriptions/${id}/approve?${params.toString()}`);
    return response.data;
  },

  rejectPrescription: async (id, notes) => {
    const response = await API.put(`/admin/prescriptions/${id}/reject`, null, { params: { notes } });
    return response.data;
  },

  getSalesReport: async () => {
    const response = await API.get('/admin/reports/sales');
    return response.data;
  },

  getInventoryReport: async () => {
    const response = await API.get('/admin/reports/inventory');
    return response.data;
  }
};
