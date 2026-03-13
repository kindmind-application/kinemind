export interface Company {
  id: string;
  name: string;
  nit: string;
  sector: string;
  city: string;
  status: "Activa" | "Inactiva" | "En negociación" | "Suspendida";
  employeeCount: number;
  devicesAssigned: number;
  registrationDate: string;
  address: string;
  phone: string;
  email: string;
  contactName: string;
  contactPosition: string;
  size: string;
  observations: string;
}

export interface User {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  document: string;
  position: string;
  email: string;
  phone: string;
  area: string;
  status: "Activo" | "Inactivo" | "Pendiente";
  deviceId: string | null;
  joinDate: string;
}

export interface Device {
  id: string;
  userId: string | null;
  userName: string | null;
  companyId: string | null;
  status: "Disponible" | "Asignado" | "Mantenimiento" | "Inactivo";
  assignmentDate: string | null;
  lastSync: string | null;
}
