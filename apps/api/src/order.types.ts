export interface OrderItem {
  productId: string;
  priceInCents: number;
  quantity: number;
}

export interface OrderDraft {
  email: string;
  items: OrderItem[];
  coupon?: string;
}

export interface NewOrder {
  email: string;
  total: number;
}

export interface Order extends NewOrder {
  id: number;
}