import axios, { AxiosResponse } from "axios";
import { BASE_URL, API_KEY } from "../config";

interface Pet {
  id?: number;
  name: string;
  photoUrls: string[];
  status?: string;
}

interface Order {
  id?: number;
  petId: number;
  quantity: number;
  status?: string;
  complete?: boolean;
}

const validateStatus = () => true;

export class PetstoreClient {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(baseUrl = BASE_URL, apiKey = API_KEY) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private get authHeaders() {
    return { ...this.headers, api_key: this.apiKey };
  }

  async createPet(name: string, petId?: number, status = "available"): Promise<AxiosResponse> {
    const pet: Pet = { name, photoUrls: [], status };
    if (petId !== undefined) pet.id = petId;
    return axios.post(`${this.baseUrl}/pet`, pet, { headers: this.headers, validateStatus });
  }

  async getPet(petId: number): Promise<AxiosResponse> {
    return axios.get(`${this.baseUrl}/pet/${petId}`, { headers: this.headers, validateStatus });
  }

  async deletePet(petId: number): Promise<AxiosResponse> {
    return axios.delete(`${this.baseUrl}/pet/${petId}`, { headers: this.authHeaders, validateStatus });
  }

  async placeOrder(petId: number, quantity = 1, orderId?: number): Promise<AxiosResponse> {
    const order: Order = { petId, quantity, status: "placed", complete: false };
    if (orderId !== undefined) order.id = orderId;
    return axios.post(`${this.baseUrl}/store/order`, order, { headers: this.headers, validateStatus });
  }

  async getOrder(orderId: number): Promise<AxiosResponse> {
    return axios.get(`${this.baseUrl}/store/order/${orderId}`, { headers: this.headers, validateStatus });
  }

  async deleteOrder(orderId: number): Promise<AxiosResponse> {
    return axios.delete(`${this.baseUrl}/store/order/${orderId}`, { headers: this.authHeaders, validateStatus });
  }
}
