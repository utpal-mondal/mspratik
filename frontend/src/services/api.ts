import axios, { type AxiosInstance } from 'axios';

class ApiService {
    public api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        this.api.interceptors.request.use(
            (config) => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('token');
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle network errors gracefully
                if (!error.response) {
                    // Network error - backend is down
                    console.log('Network error: Backend is currently unavailable');
                    // Don't redirect to login on network errors, just reject with a custom error
                    return Promise.reject({
                        ...error,
                        message: 'Network Error',
                        code: 'NETWORK_ERROR',
                        isNetworkError: true
                    });
                }
                
                if (error.response?.status === 401 && typeof window !== 'undefined') {
                    // Login/register 401s are credential errors, not expired sessions
                    const requestUrl: string = error.config?.url || '';
                    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
                    const token = localStorage.getItem('token');
                    if (token && !isAuthRequest) {
                        localStorage.removeItem('token');
                        window.location.href = '/login?session=expired';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    
    // Auth methods
    login = (data: { username: string; password: string }) => this.api.post('/auth/login', data);
    register = (data: any) => this.api.post('/auth/register', data);
    logout = () => this.api.post('/auth/logout');
    getCurrentUser = () => this.api.get('/auth/me');

    // Dashboard methods
    getDashboardData = () => this.api.get('/dashboard');
    getOrderStatus = (startDate?: string, endDate?: string) => this.api.post('/dashboard/order/status', { start_date: startDate, end_date: endDate });
    getRevenueData = () => this.api.get('/dashboard/revenue');

    // Webshops methods
    getWebshops = (page = 1, perPage = 25) => this.api.get('/webshops', { params: { page, per_page: perPage } });
    getProcessingStatus = (webshopId: number) => this.api.get(`/webshops/processing/status`, { params: { webshpid: webshopId } });
    runWebshop = (webshopId: number) => this.api.post(`/webshops/${webshopId}/run`);
    getWebshopTypes = () => this.api.get('/webshop-types');
    getImportOrders = (params: { webshopId?: number; page?: number; status?: string | null; query?: string } = {}) => {
        const { webshopId, page = 1, status, query } = params;
        const url = webshopId ? `/webshops/${webshopId}/import-orders` : '/webshops/import-orders';
        return this.api.get(url, { params: { page, status, query, per_page: 25 } });
    };
    getImportOrder = (orderId: number) => this.api.get(`/orders/${orderId}`);
    deleteImportOrder = (orderId: number) => this.api.delete(`/orders/${orderId}`);

    // Settings methods
    getCompanyDetails = () => this.api.get('/settings/company-details');
    updateCompanyDetails = (data: any) => this.api.put('/settings/company-details', data);
    getMySubscription = () => this.api.get('/subscription');
    getAvailableSubscriptions = () => this.api.get('/subscription/choose');
    upgradeSubscription = (subscriptionId: number) => this.api.post(`/subscription/upgrade/${subscriptionId}`);

    // Orders methods
    getOrders = (params: { webshopId?: number; page?: number; status?: string | null; query?: string } = {}) => {
        const { webshopId, page = 1, status, query } = params;
        const url = webshopId ? `/webshops/${webshopId}/orders` : '/orders';
        return this.api.get(url, { params: { page, status, query, per_page: 25 } });
    };
    getOrder = (orderId: number) => this.api.get(`/orders/${orderId}`);
    deleteOrder = (orderId: number) => this.api.delete(`/orders/${orderId}`);
    getOrderStatusCounts = () => this.api.get('/orders/status-counts');
    retryOrderImport = (orderId: number) => this.api.post(`/orders/${orderId}/retry`);
}

const apiService = new ApiService();
export default apiService;
