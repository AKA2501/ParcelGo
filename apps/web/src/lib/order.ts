import { api } from "../api";

export type Order = {
  id:number; userId:number; status:string; mode?:string;
  pickupCity?:string; pickupAddr1?:string; dropCity?:string; dropAddr1?:string;
  createdAt?:string; created_at?:string;
};
export type CreateOrderRequest = any;

export const OrdersAPI = {
  async list(): Promise<Order[]> {
    const { data } = await api.get<{content: Order[]}>("/orders?page=0&size=200");
    return Array.isArray(data) ? data : (data.content ?? []);
  },
  async create(body: CreateOrderRequest): Promise<Order> {
    const { data } = await api.post<Order>("/orders", body);
    return data;
  },
};
