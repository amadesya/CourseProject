export enum Role {
    Client = 0,
    Technician = 1,
    Admin = 2
}

export enum RequestStatus {
  New = 'New',
  InProgress = 'InProgress',
  Ready = 'Ready',
  Closed = 'Closed',
  Rejected = 'Rejected',
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

export interface ServiceDto {
  name: string;
  description?: string;
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

export interface AuthResponseDto {
    id: number;
    token: string;
    name: string;
    email: string;
    role: number;
    isVerified: boolean;
    phone?: string;
    avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

