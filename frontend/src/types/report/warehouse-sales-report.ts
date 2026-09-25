export type Location = {
  id: number;
  warehouse_name: string;
  stock: number;
  accept_orders: boolean;
  selected_default: boolean;
  general_stock: boolean;
  allow_over_selling: boolean;
  priority: number;
}

export type ReportData = {
  warehouse_id: number;
  warehouse_name: string;
  summary: {
    total_purchase: number;
    total_order: number;
    total_purchase_due: number;
    total_invoice_due: number;
    total_purchase_return: number;
    total_sale_return: number;
    total_expense: number;
    total_repair: number;
  };
};
