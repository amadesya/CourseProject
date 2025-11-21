export enum Role {
  Client = 'Клиент',
  Technician = 'Мастер',
  Admin = 'Администратор',
  Unauthorized = 'Неавторизованный',
}

export enum RequestStatus {
  New = 'Новая',
  InProgress = 'В работе',
  Ready = 'Готова',
  Closed = 'Закрыта',
  Rejected = 'Отклонена',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  phone?: string;
  avatar?: string;
  token?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface RepairRequest {
  id: number;
  clientName: string;
  clientId: number;
  device: string;
  issueDescription: string;
  status: RequestStatus;
  technicianId?: number;
  technicianName?: string;
  comments: { author: string; text: string; date: string }[];
  createdAt: string;
}

