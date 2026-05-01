import request from '@/utils/request'

// ==================== Product Module ====================
export const productApi = {
  // Category
  listCategory: () => request.get('/product/category'),
  getCategory: (id: number) => request.get(`/product/category/${id}`),
  createCategory: (data: any) => request.post('/product/category', data),
  updateCategory: (id: number, data: any) => request.put(`/product/category/${id}`, data),
  deleteCategory: (id: number) => request.delete(`/product/category/${id}`),
  // Brand
  listBrand: (params?: any) => request.get('/product/brand', { params }),
  createBrand: (data: any) => request.post('/product/brand', data),
  updateBrand: (id: number, data: any) => request.put(`/product/brand/${id}`, data),
  deleteBrand: (id: number) => request.delete(`/product/brand/${id}`),
  // Product
  listProduct: (params?: any) => request.get('/product/list', { params }),
  getProduct: (id: number) => request.get(`/product/list/${id}`),
  createProduct: (data: any) => request.post('/product/list', data),
  updateProduct: (id: number, data: any) => request.put(`/product/list/${id}`, data),
  deleteProduct: (id: number) => request.delete(`/product/list/${id}`),
  // Order
  listOrder: (params?: any) => request.get('/product/order', { params }),
  getOrder: (id: number) => request.get(`/product/order/${id}`),
  updateOrder: (id: number, data: any) => request.put(`/product/order/${id}`, data),
  // Description Pack
  listDesc: (params?: any) => request.get('/product/desc', { params: params || { page: 1, page_size: 100 } }),
  getDesc: (id: number) => request.get(`/product/desc/${id}`),
  createDesc: (data: any) => request.post('/product/desc', data),
  updateDesc: (id: number, data: any) => request.put(`/product/desc/${id}`, data),
  deleteDesc: (id: number) => request.delete(`/product/desc/${id}`),
  // Desc Image
  listDescImage: () => request.get('/product/desc-image'),
  createDescImage: (data: any) => request.post('/product/desc-image', data),
  updateDescImage: (id: number, data: any) => request.put(`/product/desc-image/${id}`, data),
  deleteDescImage: (id: number) => request.delete(`/product/desc-image/${id}`),
  // Coupon
  listCoupon: (params?: any) => request.get('/product/coupon', { params }),
  createCoupon: (data: any) => request.post('/product/coupon', data),
  updateCoupon: (id: number, data: any) => request.put(`/product/coupon/${id}`, data),
  deleteCoupon: (id: number) => request.delete(`/product/coupon/${id}`),
}

// Stock Module
export const stockApi = {
  listGoods: (params?: any) => request.get('/stock/goods', { params }),
  getGoods: (id: number) => request.get(`/stock/goods/${id}`),
  createGoods: (data: any) => request.post('/stock/goods', data),
  updateGoods: (id: number, data: any) => request.put(`/stock/goods/${id}`, data),
  deleteGoods: (id: number) => request.delete(`/stock/goods/${id}`),
  getStatistics: (params?: any) => request.get('/stock/statistics', { params }),
  listAdmin: () => request.get('/stock/admin'),
  createAdmin: (data: any) => request.post('/stock/admin', data),
  listUser: () => request.get('/stock/user'),
  createUser: (data: any) => request.post('/stock/user', data),
}

// Sale Module
export const saleApi = {
  listLevel: () => request.get('/sale/level'),
  createLevel: (data: any) => request.post('/sale/level', data),
  updateLevel: (id: number, data: any) => request.put(`/sale/level/${id}`, data),
  deleteLevel: (id: number) => request.delete(`/sale/level/${id}`),
  listGoods: (params?: any) => request.get('/sale/goods', { params }),
  getGoods: (id: number) => request.get(`/sale/goods/${id}`),
  createGoods: (data: any) => request.post('/sale/goods', data),
  updateGoods: (id: number, data: any) => request.put(`/sale/goods/${id}`, data),
  deleteGoods: (id: number) => request.delete(`/sale/goods/${id}`),
  listUser: (params?: any) => request.get('/sale/user', { params }),
  createUser: (data: any) => request.post('/sale/user', data),
  updateUser: (id: number, data: any) => request.put(`/sale/user/${id}`, data),
  deleteUser: (id: number) => request.delete(`/sale/user/${id}`),
  listOrder: (params?: any) => request.get('/sale/order', { params }),
  updateOrder: (id: number, data: any) => request.put(`/sale/order/${id}`, data),
}

// Partner Module
export const partnerApi = {
  listAgent: (params?: any) => request.get('/partner/agent', { params }),
  getAgent: (id: number) => request.get(`/partner/agent/${id}`),
  createAgent: (data: any) => request.post('/partner/agent', data),
  updateAgent: (id: number, data: any) => request.put(`/partner/agent/${id}`, data),
  deleteAgent: (id: number) => request.delete(`/partner/agent/${id}`),
  updateAgentStatus: (id: number, data: any) => request.put(`/partner/agent/${id}/status`, data),
  listPartner: (params?: any) => request.get('/partner/list', { params }),
  getPartner: (id: number) => request.get(`/partner/list/${id}`),
  createPartner: (data: any) => request.post('/partner/list', data),
  updatePartner: (id: number, data: any) => request.put(`/partner/list/${id}`, data),
  deletePartner: (id: number) => request.delete(`/partner/list/${id}`),
  getStoreList: (partnerId: number) => request.get(`/partner/list/${partnerId}/stores`),
  listKey: (params?: any) => request.get('/partner/key', { params }),
  createKey: (data: any) => request.post('/partner/key', data),
  deleteKey: (id: number) => request.delete(`/partner/key/${id}`),
  listWholeSale: (params?: any) => request.get('/partner/wholesale', { params }),
  deleteWholeSale: (id: number) => request.delete(`/partner/wholesale/${id}`),
  listJoinIn: (params?: any) => request.get('/partner/joinin', { params }),
  updateJoinInStatus: (id: number, data: any) => request.put(`/partner/joinin/${id}/status`, data),
  deleteJoinIn: (id: number) => request.delete(`/partner/joinin/${id}`),
  listStore: (params?: any) => request.get('/partner/store', { params }),
  createStore: (data: any) => request.post('/partner/store', data),
  updateStore: (id: number, data: any) => request.put(`/partner/store/${id}`, data),
  deleteStore: (id: number) => request.delete(`/partner/store/${id}`),
  listSubWeb: (params?: any) => request.get('/partner/subweb', { params }),
  createSubWeb: (data: any) => request.post('/partner/subweb', data),
  updateSubWeb: (id: number, data: any) => request.put(`/partner/subweb/${id}`, data),
  deleteSubWeb: (id: number) => request.delete(`/partner/subweb/${id}`),
}

// Pricing Module
export const pricingApi = {
  listCategory: () => request.get('/pricing/category'),
  createCategory: (data: any) => request.post('/pricing/category', data),
  updateCategory: (id: number, data: any) => request.put(`/pricing/category/${id}`, data),
  deleteCategory: (id: number) => request.delete(`/pricing/category/${id}`),
  listBrand: () => request.get('/pricing/brand'),
  createBrand: (data: any) => request.post('/pricing/brand', data),
  updateBrand: (id: number, data: any) => request.put(`/pricing/brand/${id}`, data),
  deleteBrand: (id: number) => request.delete(`/pricing/brand/${id}`),
  listUser: (params?: any) => request.get('/pricing/user', { params }),
  createUser: (data: any) => request.post('/pricing/user', data),
  updateUser: (id: number, data: any) => request.put(`/pricing/user/${id}`, data),
  updateUserStatus: (id: number, data: any) => request.put(`/pricing/user/${id}/status`, data),
  listPricing: (params?: any) => request.get('/pricing/pricing', { params }),
  getPricing: (id: number) => request.get(`/pricing/pricing/${id}`),
  createPricing: (data: any) => request.post('/pricing/pricing', data),
  updatePricing: (id: number, data: any) => request.put(`/pricing/pricing/${id}`, data),
  deletePricing: (id: number) => request.delete(`/pricing/pricing/${id}`),
}

// Bidding Module
export const biddingApi = {
  listCategory: () => request.get('/bidding/category'),
  createCategory: (data: any) => request.post('/bidding/category', data),
  updateCategory: (id: number, data: any) => request.put(`/bidding/category/${id}`, data),
  deleteCategory: (id: number) => request.delete(`/bidding/category/${id}`),
  listBrand: () => request.get('/bidding/brand'),
  createBrand: (data: any) => request.post('/bidding/brand', data),
  updateBrand: (id: number, data: any) => request.put(`/bidding/brand/${id}`, data),
  deleteBrand: (id: number) => request.delete(`/bidding/brand/${id}`),
  listType: () => request.get('/bidding/type'),
  createType: (data: any) => request.post('/bidding/type', data),
  updateType: (id: number, data: any) => request.put(`/bidding/type/${id}`, data),
  deleteType: (id: number) => request.delete(`/bidding/type/${id}`),
  listUser: (params?: any) => request.get('/bidding/user', { params }),
  createUser: (data: any) => request.post('/bidding/user', data),
  updateUser: (id: number, data: any) => request.put(`/bidding/user/${id}`, data),
  updateUserStatus: (id: number, data: any) => request.put(`/bidding/user/${id}/status`, data),
  listProduct: (params?: any) => request.get('/bidding/product', { params }),
  getProduct: (id: number) => request.get(`/bidding/product/${id}`),
  createProduct: (data: any) => request.post('/bidding/product', data),
  updateProduct: (id: number, data: any) => request.put(`/bidding/product/${id}`, data),
  deleteProduct: (id: number) => request.delete(`/bidding/product/${id}`),
  listOrder: (params?: any) => request.get('/bidding/order', { params }),
  updateOrder: (id: number, data: any) => request.put(`/bidding/order/${id}`, data),
}

// Article Module
export const articleApi = {
  listCategory: () => request.get('/article/category'),
  createCategory: (data: any) => request.post('/article/category', data),
  updateCategory: (id: number, data: any) => request.put(`/article/category/${id}`, data),
  deleteCategory: (id: number) => request.delete(`/article/category/${id}`),
  listArticle: (params?: any) => request.get('/article/article', { params }),
  getArticle: (id: number) => request.get(`/article/article/${id}`),
  createArticle: (data: any) => request.post('/article/article', data),
  updateArticle: (id: number, data: any) => request.put(`/article/article/${id}`, data),
  deleteArticle: (id: number) => request.delete(`/article/article/${id}`),
  listComment: (params?: any) => request.get('/article/comment', { params }),
  createComment: (data: any) => request.post('/article/comment', data),
  deleteComment: (id: number) => request.delete(`/article/comment/${id}`),
}

// Web Module
export const webApi = {
  getConfig: () => request.get('/web/config'),
  updateConfig: (data: any) => request.put('/web/config', data),
  listIndexPic: (params?: any) => request.get('/web/indexpic', { params }),
  createIndexPic: (data: any) => request.post('/web/indexpic', data),
  updateIndexPic: (id: number, data: any) => request.put(`/web/indexpic/${id}`, data),
  deleteIndexPic: (id: number) => request.delete(`/web/indexpic/${id}`),
  listBank: () => request.get('/web/bank'),
  createBank: (data: any) => request.post('/web/bank', data),
  updateBank: (id: number, data: any) => request.put(`/web/bank/${id}`, data),
  deleteBank: (id: number) => request.delete(`/web/bank/${id}`),
  listProvince: () => request.get('/web/province'),
  listCity: (params?: any) => request.get('/web/city', { params }),
  listCounty: (params?: any) => request.get('/web/county', { params }),
  listMember: (params?: any) => request.get('/web/member', { params }),
  getMember: (id: number) => request.get(`/web/member/${id}`),
  updateMember: (id: number, data: any) => request.put(`/web/member/${id}`, data),
  deleteMember: (id: number) => request.delete(`/web/member/${id}`),
  listExpress: () => request.get('/web/express'),
  createExpress: (data: any) => request.post('/web/express', data),
  updateExpress: (id: number, data: any) => request.put(`/web/express/${id}`, data),
  deleteExpress: (id: number) => request.delete(`/web/express/${id}`),
}
