import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If data is FormData, let Axios set the Content-Type with boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  username: string;
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  getAllUsers: async (search: string = "") => {
    const response = await api.get(
      `/auth/get-all-users?q=${encodeURIComponent(search)}`,
    );
    return response.data;
  },

  changePassword: async (data: {
    new_password: string;
    confirm_password: string;
  }) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};

export const productApi = {
  getProducts: async (params: Record<string, string | number>) => {
    const response = await api.get("/products", {
      params,
    });

    return response.data;
  },
  searchProducts: async (q: string = "", warehouseId?: number, page: number = 1, perPage: number = 20) => {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (q) params.q = q;
    if (warehouseId) params.warehouse_id = warehouseId;
    const response = await api.get("/products/search", { params });
    return response.data;
  },
  getProductsByCompanyId: async (companyId: number) => {
    const response = await api.get(`/products/company/${companyId}`);
    return response.data;
  },
  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getProductImages: async (id: number) => {
    const response = await api.get(`/products/${id}/images`);
    return response.data;
  },
  getProductStockHistory: async (id: number) => {
    console.log("hit");
    const response = await api.get(`/products/stock-history/${id}`);
    console.log("data:", response);
    return response.data;
  },

  getProductWarehouseStockHistory: async (id: number, warehouseId?: number) => {
    const response = await api.get(`/products/warehouse-stock-history/${id}`, {
      params: warehouseId ? { warehouse_id: warehouseId } : {},
    });
    return response.data;
  },

  getProductLogs: async (id: number, page: number = 1, limit: number = 20) => {
    const response = await api.get(`/products/product-logs/${id}`, {
      params: { page, limit },
    });
    return response.data;
  },

  getPurchaseOrderDetails: async (id: number) => {
    console.log("hit");
    const response = await api.get(`/products/purchase-order-details/${id}`);
    console.log("data:", response);
    return response.data;
  },

  getOrderHistory: async (id: number, page: number = 1, limit: number = 20) => {
    const response = await api.get(`/products/order_history/${id}`, {
      params: { page, limit },
    });
    return response.data;
  },

  getSerialNumbersDetails: async (
    id: number,
    page: number = 1,
    limit: number = 20,
  ) => {
    const response = await api.get(`/products/serial-numbers-details/${id}`, {
      params: { page, limit },
    });
    console.log("data:", response);
    return response.data;
  },

  deleteserialDetails: async (serial_number: number) => {
    const response = await api.delete(
      `/products/delete-serial-number/${serial_number}`,
    );
    return response.data;
  },

  deleteProductImage: async (id: number, imageName: string) => {
    const response = await api.delete(`/products/${id}/images/${imageName}`);
    return response.data;
  },
  updateProduct: async (id: number, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  uploadProductImage: async (imageFile: File) => {
    // get the image upload url
    const getImageUploadUrl = await api.get(`/products/image-upload-url?filename=${imageFile.name}`);
    console.log("Get image upload url response:", getImageUploadUrl);
    if (getImageUploadUrl.status === 200 && getImageUploadUrl.data.status === "success") {
      const uploadUrl = (getImageUploadUrl.data as any).upload_url;
      // upload image to aws s3 using direct axios call (no auth headers)
      const uploadImageToS3 = await axios.put(uploadUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type
        }
      });
      if (uploadImageToS3.status !== 200) {
        return {
          status: uploadImageToS3.status,
          message: uploadImageToS3.statusText || "Failed to upload image"
        }
      }

      return getImageUploadUrl.data;
    }
    return {
      status: "error",
      message: "image not uploaded"
    };
  },
  createProduct: async (data: any) => {
    const response = await api.post("/products", data);
    return response.data;
  },
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  toggleProductStatus: async (
    productId: number,
    payload: { isactive: boolean },
  ) => {
    const response = await api.patch(`/products/${productId}/status`, payload);
    return response.data;
  },

  getAllWarehouse: async (companyId: number) => {
    const response = await api.get(`/products/get_all_warehouse/${companyId}`);
    return response.data;
  },

  submitBulkWarehouseData: async (data: any) => {
    const response = await api.post(`/products/bulk-upload`, data);
    return response.data;
  },

  changeStock: async (
    id: number,
    data: { warehouse_id: number; change_stock: number; reason: string; serial_numbers?: string[] },
  ) => {
    const response = await api.post(`/products/${id}/change-stock`, data);
    return response.data;
  },

  checkSerialNumbers: async (
    productId: number,
    serialNumbers: string[],
  ) => {
    const response = await api.post('/products/serial-numbers/check', {
      product_id: productId,
      serial_numbers: serialNumbers,
    });
    return response.data;
  },

  getProductWarehouseStocks: async (id: number) => {
    const response = await api.get(`/products/${id}/warehouse-stocks`);
    return response.data;
  },

  getProductStockStats: async (id: number, warehouseId?: number) => {
    const response = await api.get(`/products/${id}/stock`, {
      params: warehouseId ? { warehouse_id: warehouseId } : {},
    });
    return response.data;
  },

  getProductPriceHistory: async (id: number) => {
    const response = await api.get(`/products/${id}/price-history`);
    return response.data;
  },

  getStockTypes: async () => {
    const response = await api.get("/products/stock-types");
    return response.data;
  },

  getAllCompany: async (params: URLSearchParams) => {
    const response = await api.get("/companies/all", { params });
    return response.data;
  },

  downloadProductsPdf: async (params: Record<string, string | number>, download = false) => {
    const response = await api.get("/products/pdf", {
      params: { ...params, download: download ? 1 : 0 },
      responseType: "blob",
    });
    return response.data;
  },

  getTrendingProducts: async (params: Record<string, string | number | undefined>) => {
    const response = await api.get("/reports/trending-product-stock-report", { params });
    return response.data;
  },
};

export const shippingProviderApi = {
  getShippingProviders: async () => {
    const response = await api.get("/shipping-providers");
    return response.data;
  },
  getShippingProvider: async (id: number) => {
    const response = await api.get(`/shipping-providers/${id}`);
    return response.data;
  },
  createShippingProvider: async (data: any) => {
    const response = await api.post("/shipping-providers", data);
    return response.data;
  },
  updateShippingProvider: async (id: number, data: any) => {
    const response = await api.put(`/shipping-providers/${id}`, data);
    return response.data;
  },
  deleteShippingProvider: async (id: number) => {
    const response = await api.delete(`/shipping-providers/${id}`);
    return response.data;
  },
  getShippingCompaniesWithProfiles: async () => {
    const response = await api.get("/shipping-providers/companies-with-profiles");
    return response.data;
  },
};

export const invoiceTemplateApi = {
  getInvoiceTemplates: async () => {
    const response = await api.get("/invoice-templates");
    return response.data;
  },
  getInvoiceTemplate: async (id: number) => {
    const response = await api.get(`/invoice-templates/${id}`);
    return response.data;
  },
  createInvoiceTemplate: async (data: any) => {
    const response = await api.post("/invoice-templates", data);
    return response.data;
  },
  updateInvoiceTemplate: async (id: number, data: any) => {
    const response = await api.put(`/invoice-templates/${id}`, data);
    return response.data;
  },
  deleteInvoiceTemplate: async (id: number) => {
    const response = await api.delete(`/invoice-templates/${id}`);
    return response.data;
  },
  toggleInvoiceTemplateStatus: async (id: number) => {
    const response = await api.patch(`/invoice-templates/${id}/toggle-status`);
    return response.data;
  },
  setDefaultInvoiceTemplate: async (id: number) => {
    const response = await api.patch(`/invoice-templates/${id}/set-default`);
    return response.data;
  },
};

export const bankReminderCalendarApi = {
  uploadPaymentDocument: async (reminderId: number, amount: string, file: File) => {
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("document", file);
    const response = await api.post(
      `/bank-reminder-calendar/${reminderId}/payment-documents`,
      formData,
    );
    return response.data;
  },

  updateStatus: async (reminderId: number, status: string) => {
    const formData = new FormData();
    formData.append("status", status);
    const response = await api.patch(
      `/bank-reminder-calendar/${reminderId}/status`,
      formData,
    );
    return response.data;
  },
};

export const bankApi = {
  getBanks: async (params?: URLSearchParams) => {
    const response = await api.get("/banks", { params });
    return response.data;
  },
  searchBanks: async (q: string = "") => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    const response = await api.get("/banks/search", { params });
    return response.data;
  },
  getBank: async (id: number) => {
    const response = await api.get(`/banks/${id}`);
    return response.data;
  },
  createBank: async (data: any) => {
    const response = await api.post("/banks", data);
    return response.data;
  },
  updateBank: async (id: number, data: any) => {
    const response = await api.put(`/banks/${id}`, data);
    return response.data;
  },
  deleteBank: async (id: number) => {
    const response = await api.delete(`/banks/${id}`);
    return response.data;
  },
  toggleBankStatus: async (id: number) => {
    const response = await api.patch(`/banks/${id}/toggle-status`);
    return response.data;
  },
};

export const countryApi = {
  getCountryList: async (params?: URLSearchParams) => {
    const response = await api.get(`/country-list`, { params });
    return response.data;
  },
};

export const repairsApi = {
  getRepairs: async (params?: Record<string, string | number>) => {
    const response = await api.get("/repairs", { params });
    return response.data;
  },
  getRepair: async (id: number) => {
    const response = await api.get(`/repairs/${id}`);
    return response.data;
  },
  createRepair: async (data: any) => {
    const response = await api.post("/repairs", data);
    return response.data;
  },
  updateRepair: async (id: number, data: any) => {
    const response = await api.put(`/repairs/${id}`, data);
    return response.data;
  },
  deleteRepair: async (id: number) => {
    const response = await api.delete(`/repairs/${id}`);
    return response.data;
  },
  updateStatus: async (id: number, data: { status: string }) => {
    const response = await api.put(`/repairs/${id}/status`, data);
    return response.data;
  }
};

export const categoryApi = {
  getCategories: async (params: URLSearchParams) => {
    const response = await api.get("/categories", { params });
    return response.data;
  },
  searchCategories: async (q: string = "") => {
    const params = new URLSearchParams();
    if (q) params.append("query", q);
    params.append("per_page", "100");
    const response = await api.get("/categories", { params });
    return response.data;
  },
  getCategory: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  createCategory: async (data: any) => {
    const response = await api.post("/categories", data);
    return response.data;
  },
  updateCategory: async (id: number, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const orderApi = {
  getOrders: async (params: URLSearchParams) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },
  getOrderDetails: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  createOrder: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  updateOrder: async (id: number, data: any) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },
  submitOrderSettings: async (data: any) => {
    const response = await api.post(`/orders/order-settings`, data);
    return response.data;
  },
  addPayment: async (data: {
    order_id: number;
    customer_id: number;
    payment_date: string;
    payment_amount: string;
    currency: string;
    payment_method: string;
    total_payment: number;
    total_due: number;
    description: string;
    note: string;
  }) => {
    const response = await api.post("/orders/payments", data);
    return response.data;
  },
  getOrderPayments: async (id: number) => {
    const response = await api.get(`/orders/${id}/payments`);
    return response.data;
  },

  getPayment: async (id: number) => {
    const response = await api.get(`/orders/payments/${id}`);
    return response.data;
  },

  getMarketPlace: async (q: string = "", webshopId?: number | string) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (webshopId !== undefined && webshopId !== "") params.append("webshop_id", String(webshopId));
    const response = await api.get("/orders/get-all-marketPlace", { params });
    return response.data;
  },

  downloadOrderPdf: async (id: number) => {
    const response = await api.get(`/orders/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadInvoicePdf: async (id: number) => {
    const response = await api.get(`/orders/${id}/invoice-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadPackingSlipPdf: async (id: number) => {
    const response = await api.get(`/orders/${id}/packing-slip-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getOrderDetailsPdf: async (id: number, showDiscount: boolean = false) => {
    const response = await api.get(`/orders/${id}/get-order-details-pdf`, {
      params: { show_discount: showDiscount ? 1 : 0 },
    });
    return response.data;
  },

  getOrderLogs: async (id: number, page: number = 1, limit: number = 25) => {
    const response = await api.get(`/orders/${id}/logs`, {
      params: { page, limit },
    });
    return response.data;
  },

  getReturnDetails: async (id: number) => {
    const response = await api.get(`/orders/${id}/return`);
    return response.data;
  },

  getDamageReturns: async (params: URLSearchParams) => {
    const response = await api.get(`/orders/return/damage`, { params });
    return response.data;
  },

  createOrderReturn: async (data: any) => {
    const response = await api.post(`orders/${data.order_id}/${data.condition}/return`, data);
    return response.data;
  },

  getOrderTrackingNumbers: async (id: number) => {
    const response = await api.get(`/orders/${id}/tracking-numbers`);
    return response.data;
  },

  addOrderTrackingNumber: async (id: number, trackingNumber: string) => {
    const response = await api.post(`/orders/${id}/tracking-numbers`, { tracking_number: trackingNumber });
    return response.data;
  },

  deleteOrderTrackingNumber: async (id: number, trackingId: number) => {
    const response = await api.delete(`/orders/${id}/tracking-numbers/${trackingId}`);
    return response.data;
  },

  getOrderProducts: async (id: number) => {
    const response = await api.get(`/orders/${id}/products`);
    return response.data;
  },

  deleteOrder: async (id: number) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export const customerApi = {
  getCustomers: async (params: URLSearchParams) => {
    const response = await api.get("/customers", { params });
    return response.data;
  },
  searchCustomers: async (q: string = "") => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    const response = await api.get("/customers/search", { params });
    return response.data;
  },
  getCustomer: async (id: number, userId?: number) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get(`/customers/${id}`, { params });
    console.log(response);
    return response.data.data;
  },
  createCustomer: async (data: any) => {
    const response = await api.post("/customers", data);
    return response.data;
  },
  updateCustomer: async (id: number, data: any) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
  deleteCustomer: async (id: number) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
  updateCustomerStatus: async (id: number, status: string) => {
    const response = await api.put(`/customers/${id}/status`, { status });
    return response.data;
  },

  getCustomerDetails: async (id: number, userId?: number) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get(`/customers/customer-details/${id}`, { params });
    return response.data;
  },
  getCustomerOrderHistory: async (id: number, params?: { page: number; per_page: number; from_date?: string; to_date?: string; unpaid_only?: number; q?: string }) => {
    const response = await api.get(`/customers/order-history/${id}`, { params });
    return response.data;
  },
  getCustomerPaymentHistory: async (id: number, params?: { page: number; per_page: number }) => {
    const response = await api.get(`/customers/${id}/get-customer-payment-history`, { params });
    return response.data.data;
  },
  getCustomerLedger: async (id: number, params?: { page?: number; per_page?: number; from_date?: string; to_date?: string }) => {
    const response = await api.get(`/customers/${id}/ledger`, { params });
    return response.data.data;
  },

  getTopTenCustomers: async () => {
    const response = await api.get("/customers/top-ten");
    return response.data?.data ?? [];
  },

  getPaymentLedger: async (
    customerId: number,
    params?: { page?: number; per_page?: number; q?: string }
  ) => {
    const response = await api.get(`/customers/view-customer-ledger/${customerId}`, {
      params,
    });
    return response.data;
  },

  getCustomerSalesInvoices: async (
    customerId: number,
    params?: { page?: number; per_page?: number; q?: string }
  ) => {
    const response = await api.get(`/customers/sales-invoices/${customerId}`, {
      params,
    });
    return response.data;
  },

  downloadLedgerPdf: async (
    customerId: number,
    type: "sales" | "payments" = "sales",
    params: Record<string, string | number | undefined> = {},
    download = false
  ) => {
    const response = await api.get(`/customers/${customerId}/ledger-pdf`, {
      params: { ...params, type, download: download ? 1 : 0 },
      responseType: "blob",
    });
    return response.data;
  },

  downloadOrderHistoryPdf: async (customerId: number, params: Record<string, string | number | undefined> = {}, download = false) => {
    const response = await api.get(`/customers/${customerId}/order-history-pdf`, {
      params: { ...params, download: download ? 1 : 0 },
      responseType: "blob",
    });
    return response.data;
  }
};

export const publicCustomerApi = {
  getCustomerDetails: async (token: string) => {
    const response = await api.get(`/customers/public/customer-details/${token}`);
    return response.data;
  },
  getPaymentLedger: async (
    token: string,
    params?: { page?: number; per_page?: number; q?: string }
  ) => {
    const response = await api.get(`/customers/public/view-customer-ledger/${token}`, {
      params,
    });
    return response.data;
  },
  getCustomerSalesInvoices: async (
    token: string,
    params?: { page?: number; per_page?: number; q?: string }
  ) => {
    const response = await api.get(`/customers/public/sales-invoices/${token}`, {
      params,
    });
    return response.data;
  },
  downloadLedgerPdf: async (
    token: string,
    type: "sales" | "payments" = "sales",
    params: Record<string, string | number | undefined> = {},
    download = false
  ) => {
    const response = await api.get(`/customers/public/ledger-pdf/${token}`, {
      params: { ...params, type, download: download ? 1 : 0 },
      responseType: "blob",
    });
    return response.data;
  },
};

export const supplierApi = {
  getSuppliers: async (params: URLSearchParams) => {
    const response = await api.get("/suppliers", { params });
    return response.data;
  },
  searchSuppliers: async (q: string = "") => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    const response = await api.get("/suppliers/search", { params });
    return response.data;
  },
  getSupplier: async (id: number) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data.data;
  },
  createSupplier: async (data: any) => {
    const response = await api.post("/suppliers", data);
    return response.data;
  },
  updateSupplier: async (id: number, data: any) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },
  deleteSupplier: async (id: number) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
  getSupplierLedger: async (id: number, params?: { page: number; per_page: number }) => {
    const query = params ? { page: params.page, limit: params.per_page } : undefined;
    const response = await api.get(`/suppliers/${id}/ledger`, { params: query });
    return response.data;
  },
  getSupplierPurchaseHistory: async (id: number, params?: { page: number; per_page: number }) => {
    const query = params ? { page: params.page, limit: params.per_page } : undefined;
    const response = await api.get(`/suppliers/purchase-history/${id}`, { params: query });
    return response.data;
  },
  getSupplierPaymentHistory: async (id: number, params?: { page: number; per_page: number }) => {
    const query = params ? { page: params.page, limit: params.per_page } : undefined;
    const response = await api.get(`/suppliers/payment-history/${id}`, { params: query });
    return response.data;
  },

  getTopTenSuppliers: async () => {
    const response = await api.get("/suppliers/top-ten");
    return response.data?.data ?? [];
  },
};

export const brandApi = {
  getBrands: async (params: URLSearchParams) => {
    const response = await api.get("/brands", { params });
    return response.data;
  },
  searchBrands: async (q: string = "") => {
    const params = new URLSearchParams();
    if (q) params.append("query", q);
    params.append("per_page", "100");
    const response = await api.get("/brands", { params });
    return response.data;
  },
  getBrand: async (id: number) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
  createBrand: async (data: any) => {
    const response = await api.post("/brands", data);
    return response.data;
  },
  updateBrand: async (id: number, data: any) => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
  },
  deleteBrand: async (id: number) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
   getBrandsByProfit: async (params: URLSearchParams) => {
    const response = await api.get("/brands/profit/report", { params });
    return response.data;
  },
};

export const webshopApi = {
  getWebshops: async (params: URLSearchParams) => {
    try {
      const response = await api.get("/webshops", { params });
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch webshops";
      throw new Error(message);
    }
  },
  createWebshop: async (data: any) => {
    try {
      console.log("DEBUG: Frontend sending data:", data);
      const response = await api.post("/webshops", data);
      console.log("DEBUG: Backend response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      console.log("DEBUG: Error response:", error.response?.data);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to connect webshop";
      throw new Error(message);
    }
  },
  getWebshopTypes: async (page = 1, perPage = 25) => {
    try {
      const response = await api.get("/webshop-types", { params: { page, per_page: perPage } });
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch webshop types";
      throw new Error(message);
    }
  },
  getWebshopCreationTime: async (webshopId: number) => {
    try {
      const response = await api.get(`/webshops/${webshopId}/creation-time`);
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch webshop creation time";
      throw new Error(message);
    }
  },
  getWebshopDetails: async (webshopId: number) => {
    try {
      const response = await api.get(`/webshops/${webshopId}`);
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch webshop details";
      throw new Error(message);
    }
  },
  updateWebshop: async (webshopId: number, data: any) => {
    try {
      const response = await api.put(`/webshops/${webshopId}`, data);
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update webshop";
      throw new Error(message);
    }
  },
  updateWebshopType: async (id: number, data: { delivery_charge?: number; commission?: number }) => {
    try {
      const response = await api.put(`/webshop-types/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update webshop type";
      throw new Error(message);
    }
  },
};

export const warehouseApi = {
  getAllWarehouses: async (params?: any) => {
    try {
      const response = await api.get("/warehouses/all", { params });
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch warehouses";
      throw new Error(message);
    }
  },
  getAll: async (params?: any) => {
    try {
      const response = await api.get("/warehouses/get-warehouse-names", { params });
      return response.data.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch warehouses";
      throw new Error(message);
    }
  },
  getAllWarehousesByCompanyId: async (params?: any) => {
    try {
      const response = await api.get("/warehouses/all-by-company-id", { params });
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch warehouses";
      throw new Error(message);
    }
  },
  getWarehouses: async (params?: any) => {
    try {
      const response = await api.get("/warehouses", { params });
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      // Transform error to user-friendly format
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch warehouses";
      throw new Error(message);
    }
  },
  searchWarehouses: async (q: string = "") => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    const response = await api.get("/warehouses/search", { params });
    return response.data;
  },
  getWarehousesByUser: async () => {
    const response = await api.get("/warehouses/get-warehouseByUserId");
    return response.data;
  },
  getTrendingProductWarehouses: async () => {
    const response = await api.get("/warehouses/trending-products-warehouse");
    return response.data;
  },
  getWarehouseDetails: async (id: number, params?: any) => {
    const response = await api.get(`/warehouses/${id}`, { params });
    return response.data;
  },
  getWarehouseStockHistory: async (id: number, params?: { page?: number; per_page?: number }) => {
    const response = await api.get(`/warehouses/${id}/stock-history`, { params });
    return response.data;
  },
  getSingleWarehouse: async () => {
    const response = await api.get("/warehouses/getSingleWarehouse");
    return response.data;
  },
  createWarehouse: async (data: any) => {
    const response = await api.post("/warehouses", data);
    return response.data;
  },
  updateWarehouse: async (id: number, data: any) => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
  },
  getWarehouseStockReports: async (params?: any) => {
    const response = await api.get(`/warehouses/getWarehouseStockReports`, { params });
    return response.data;
  },
  getWarehouseStockReportsPrint: async (params?: any) => {
    const response = await api.get(`/warehouses/get-WarehouseStockReports-print`, { params });
    return response.data;
  },
  getWarehouseSalesReport: async (id:number, params?: any) => {
    const response = await api.get(`/warehouses/${id}/sales/report`, { params });
    return response.data;
  },
  getWarehouseDetailReport: async (id:number, params?: any) => {
    const response = await api.get(`/warehouses/${id}/detail/report`, { params });
    return response.data;
  },
  getWarehouseOrderReportByWebshop: async (id:number, params?: any) => {
    const response = await api.get(`/warehouses/${id}/orders/by-webshop`, { params });
    return response.data;
  },
};

export const picklistApi = {
  getPicklists: async (params: any) => {
    const response = await api.get("/picklists", { params });
    return response.data;
  },
  getPicklistsByOrderId: async (orderId: number) => {
    const response = await api.get(`/picklists/order/${orderId}`);
    return response.data;
  },
  getPicklistDetails: async (id: number) => {
    const response = await api.get(`/picklists/${id}`);
    return response.data;
  },
  updatePicklistStatus: async (id: number, status: number) => {
    const response = await api.put(`/picklists/${id}/status`, { status });
    return response.data;
  },
  createPicklist: async (data: {
    order_id: number;
    picklist_qty: number;
    count_items: number;
    items: {
      product_id: number;
      orders_items_id: number;
      warehouse_id: number;
      picked_amount: number;
    }[];
  }) => {
    const response = await api.post("/picklists/create-picklist", data);
    return response.data;
  },
  createSerialNumber: async (data: {
    pick_id: number;
    product_id: number;
    serial_numbers: string[];
  }) => {
    const response = await api.post("/picklists/create-serial-number", data);
    return response.data;
  },

  getSerialNumbers: async (pickId: number) => {
    const response = await api.get(`/picklists/serial-numbers/${pickId}`);
    return response.data;
  },

  getImeiNumbersByOrderId: async (orderId: number) => {
    const response = await api.get(`/picklists/orders/${orderId}/imei-numbers`);
    return response.data;
  },
  deleteSerialNumber: async (serialId: number) => {
    const response = await api.delete(`/picklists/serial-numbers/${serialId}`);
    return response.data;
  },
};

export const settingsApi = {
  getUsers: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(
      `/settings/get-users?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get("/settings/get-roles");
    return response.data;
  },

  // getRolePermission : async (roleId:number)=>{
  //     const response = await api.get(`/settings/get-role-permission/${roleId}`)
  // 	return response.data
  // },

  createRole: async (name: string, permissions: number[]) => {
    const response = await api.post("/settings/create-role", {
      name,
      permissions,
    });
    return response.data;
  },

  updateRole: async (roleId: number, name: string, permissions: number[]) => {
    const response = await api.put(`/settings/update-role/${roleId}`, {
      name,
      permissions,
    });
    return response.data;
  },

  deleteRole: async (roleId: number) => {
    const response = await api.delete(`/settings/delete-role/${roleId}`);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await api.delete(`/settings/delete-user/${userId}`);
    return response.data;
  },

  getUserById: async (userId: number) => {
    const response = await api.get(`/settings/get-user/${userId}`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post("/settings/create-user", userData);
    return response.data;
  },

  updateUser: async (userId: number, userData: any) => {
    const response = await api.put(`/settings/update-user/${userId}`, userData);
    return response.data;
  },

  updateUserPassword: async (userId: number, password: string) => {
    const response = await api.put(`/settings/change-password/${userId}`, { password });
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get("/permissions");
    return response.data;
  },
};

export const purchaseApi = {
  getPurchase: async (params: any) => {
    const response = await api.get("/purchases", { params });
    return response.data;
  },

  getPurchaseDetails: async (id: number) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  uploadPurchaseImage: async (imageFile: File) => {
    // get the image upload url
    const getImageUploadUrl = await api.get(`/purchases/image-upload-url?filename=${imageFile.name}`);
    console.log("Get image upload url response:", getImageUploadUrl);
    if (getImageUploadUrl.status === 200 && getImageUploadUrl.data.status === "success") {
      const uploadUrl = (getImageUploadUrl.data as any).upload_url;
      // upload image to aws s3 using direct axios call (no auth headers)
      const uploadImageToS3 = await axios.put(uploadUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type
        }
      });
      if (uploadImageToS3.status !== 200) {
        return {
          status: uploadImageToS3.status,
          message: uploadImageToS3.statusText || "Failed to upload image"
        }
      }

      return getImageUploadUrl.data;
    }
    return {
      status: "error",
      message: "image not uploaded"
    };
  },

  createPurchase: async (formData: FormData) => {
    const response = await api.post("/purchases", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  updatePurchase: async (id: number, formData: FormData) => {
    const response = await api.put(`/purchases/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  downloadPurchasePdf: async (id: number) => {
    const response = await api.get(`/purchases/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  printPurchasePdf: async (id: number) => {
    const response = await api.get(`/purchases/${id}/pdf`);
    return response.data;
  },

  updatePurchaseStatus: async (id: number, status: number) => {
    const response = await api.put(`/purchases/${id}/status`, { status });
    return response.data;
  },

  addPayment: async (data: {
    purchase_id: number;
    payment_date: string;
    payment_amount: string;
    currency: string;
    currency_amount: string;
    exchange_rate: number;
    description: string;
    note: string;
  }) => {
    const response = await api.post("/purchases/payment", data);
    return response.data;
  },

  getPurchaseReport: async (params: any) => {
    const response = await api.get("/purchases/report", { params });
    return response.data;
  },
};

export const vatApi = {
  getVats: async () => {
    const response = await api.get("/vat_groups");
    return response.data;
  },
};

export const stockTransferApi = {
  getTransfers: async (params: any) => {
    const response = await api.get("/stock-transfers", { params });
    return response.data;
  },

  getTransfersReport: async (params: any) => {
    const response = await api.get("/stock-transfers/reports", { params });
    return response.data;
  },

  getTransferById: async (id: number) => {
    const response = await api.get(`/stock-transfers/${id}`);
    return response.data;
  },

  getProductStockAccordingWarehouses: async (warehouseFromId: number, warehouseToId: number) => {
    const response = await api.get(`/stock-transfers/product-stocks?warehouse_from_id=${warehouseFromId}&warehouse_to_id=${warehouseToId}`)
    return response.data;
  },

  createTransferReferenceNumber: async () => {
    const response = await api.get("/stock-transfers/reference-number");
    return response.data;
  },

  createTransfer: async (data: any) => {
    const response = await api.post("/stock-transfers", data);
    return response.data;
  },

  updateTransferStatus: async (id: number, status: number) => {
    const response = await api.put(`/stock-transfers/${id}/status`, { status });
    return response.data;
  },

  deleteTransfer: async (id: number) => {
    const response = await api.delete(`/stock-transfers/${id}`);
    return response.data;
  },

  printTransferPdf: async (id: number) => {
    const response = await api.get(`/stock-transfers/${id}/pdf`);
    return response.data;
  },

  getTransferImei: async (stockTransferId: number, productId: number) => {
    const response = await api.get(
      `/stock-transfers/imei/${stockTransferId}/${productId}`,
    );
    return response.data;
  },

  createTransferImei: async (data: {
    stock_transfer_id: number;
    product_id: number;
    serial_numbers: string[];
  }) => {
    const response = await api.post(`/stock-transfers/imei`, data);
    return response.data;
  },

  deleteTransferImei: async (imeiId: number) => {
    const response = await api.delete(`/stock-transfers/${imeiId}/imei`);
    return response.data;
  },
};
export const trackingControlApi = {
  getClientCompanies: async (params?: { query?: string }) => {
    const response = await api.get("/client-companies", { params });
    return response.data;
  },

  addClientCompanies: async (data: { name: string }) => {
    const response = await api.post("/client-companies", data);
    return response.data;
  },

  getOurCompanies: async (params?: { query?: string }) => {
    const response = await api.get("/our-companies", { params });
    return response.data;
  },

  createTrackingControl: async (data: any) => {
    const response = await api.post("/track-controls", data);
    return response.data;
  },

  updateTrackingControl: async (id: number, data: any) => {
    const response = await api.put(`/track-controls/${id}`, data);
    return response.data;
  },

  updateTrackingControlStatus: async (id: number, data: any) => {
    const response = await api.put(`/track-controls/${id}/status`, data);
    return response.data;
  },

  getTrackingControlById: async (id: number) => {
    const response = await api.get(`/track-controls/${id}`);
    return response.data;
  },

  uploadTrackingControlFiles: async (id: number, data: FormData) => {
    const response = await api.put(`/track-controls/${id}/files`, data);
    return response.data;
  },

  getTrackingControlPdf: async (id: number) => {
    const response = await api.get(`/track-controls/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  getTrackingControl: async (params?: Record<string, any>) => {
    const response = await api.get("/track-controls", { params });
    return response.data;
  },

  deleteTrackingControl: async (id: number) => {
    const response = await api.delete(`/track-controls/${id}`);
    return response.data;
  },
};

export const reportApi = {
  getOrderRepresentativeReport: async (params: {
    query?: string;
    warehouse_id?: number;
    customer_id?: number;
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get("/reports/order-representative-report", { params });
    return response.data;
  },

  
  getPaymentReport: async (params: {
    page?: number;
    per_page?: number;
    customer_id?: number;
    warehouse_id?: number;
    from_date?: string;
    to_date?: string;
    payment_method?: string;
  }) => {
    const response = await api.get("/reports/payment-report", { params });
    return response.data;
  },

  getItemsReport: async (params: {
    page?: number;
    per_page?: number;
    query?: string;
    warehouse_id?: number;
    supplier_id?: number;
    customer_id?: number;
    purchase_from_date?: string;
    purchase_to_date?: string;
    order_from_date?: string;
    order_to_date?: string;
  }) => {
    const response = await api.get("/reports/items-report", { params });
    return response.data;
  },

  getProductOrderReport: async (params: {
    page?: number;
    per_page?: number;
    query?: string;
    customer_id?: number;
    brand_id?: number;
    category_id?: number;
    from_date?: string;
    to_date?: string;
    from_time?: string;
    to_time?: string;
    warehouse_id?:number
  }) => {
    const response = await api.get("/reports/product-order-report", { params });
    return response.data;
  },
};

export default api;
