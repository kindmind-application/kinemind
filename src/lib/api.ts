import type { Company, User, Device } from "../data/types";
import { mockCompanies, mockUsers, mockDevices } from "../data/mock-data";

const COMPANIES_KEY = "kinemind_companies";
const USERS_KEY = "kinemind_users";
const DEVICES_KEY = "kinemind_devices";

// Simulated delay for realism
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // --- COMPANIES ---
  async getCompanies(): Promise<Company[]> {
    await delay(500);
    const stored = localStorage.getItem(COMPANIES_KEY);
    if (!stored) {
      localStorage.setItem(COMPANIES_KEY, JSON.stringify(mockCompanies));
      return mockCompanies;
    }
    return JSON.parse(stored);
  },

  async addCompany(company: Omit<Company, "id">): Promise<Company> {
    await delay(300);
    const companies = await this.getCompanies();
    const newCompany: Company = { ...company, id: `c${Date.now()}` };
    companies.push(newCompany);
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
    return newCompany;
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    await delay(300);
    const companies = await this.getCompanies();
    const index = companies.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Company not found");
    
    companies[index] = { ...companies[index], ...updates };
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
    return companies[index];
  },

  async deleteCompany(id: string): Promise<void> {
    await delay(300);
    const companies = await this.getCompanies();
    const filtered = companies.filter((c) => c.id !== id);
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(filtered));
  },

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    await delay(500);
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
      return mockUsers;
    }
    return JSON.parse(stored);
  },

  async addUser(user: Omit<User, "id">): Promise<User> {
    await delay(300);
    const users = await this.getUsers();
    const newUser: User = { ...user, id: `u${Date.now()}` };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(300);
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[index];
  },

  async deleteUser(id: string): Promise<void> {
    await delay(300);
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  },

  // --- DEVICES ---
  async getDevices(): Promise<Device[]> {
    await delay(500);
    const stored = localStorage.getItem(DEVICES_KEY);
    if (!stored) {
      localStorage.setItem(DEVICES_KEY, JSON.stringify(mockDevices));
      return mockDevices;
    }
    return JSON.parse(stored);
  },

  async addDevice(device: Omit<Device, "id">): Promise<Device> {
    await delay(300);
    const devices = await this.getDevices();
    const newDevice: Device = { ...device, id: `PB-${Date.now().toString().slice(-6)}` };
    devices.push(newDevice);
    localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
    return newDevice;
  },

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device> {
    await delay(300);
    const devices = await this.getDevices();
    const index = devices.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Device not found");
    
    devices[index] = { ...devices[index], ...updates };
    localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
    return devices[index];
  },

  async deleteDevice(id: string): Promise<void> {
    await delay(300);
    const devices = await this.getDevices();
    const filtered = devices.filter((d) => d.id !== id);
    localStorage.setItem(DEVICES_KEY, JSON.stringify(filtered));
  }
};
