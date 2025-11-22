import { RepairRequest } from "../types";

const API_URL = "http://localhost:5000/api";

// Функция для добавления Authorization заголовка
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// ======================= Auth =======================

// Регистрация
export async function register(name: string, email: string, password: string, phone?: string) {
  const res = await fetch(`${API_URL}/Auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone }),
  });
  if (!res.ok) throw new Error("Ошибка регистрации");
  return res.json();
}

// Логин
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Ошибка логина");
  return res.json(); // AuthResponseDto
}

// ======================= Users =======================

// Все пользователи
export async function getUsers() {
  const res = await fetch(`${API_URL}/Users`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Не удалось получить пользователей");
  return res.json();
}

// Только техники
export async function getTechnicians() {
  const res = await fetch(`${API_URL}/Users/technicians`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Не удалось получить мастеров");
  return res.json();
}

// ======================= RepairRequests =======================

// Получить все заявки
export async function getRepairRequests() {
  const res = await fetch(`${API_URL}/RepairRequests`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Не удалось получить заявки");
  return res.json();
}

// Создать заявку
export async function createRepairRequest(
  clientId: number,
  technicianId: number | null,
  device: string,
  issueDescription: string
) {
  const res = await fetch(`${API_URL}/RepairRequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ clientId, technicianId, device, issueDescription }),
  });
  if (!res.ok) throw new Error("Не удалось создать заявку");
  return res.json();
}

// Обновить заявку
export async function updateRepairRequest(
  id: number,
  technicianId: number | null,
  device: string,
  issueDescription: string,
  status: string
) {
  const res = await fetch(`${API_URL}/RepairRequests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ technicianId, device, issueDescription, status }),
  });
  if (!res.ok) throw new Error("Не удалось обновить заявку");
  return res.json();
}

// ======================= Comments =======================

// Получить комментарии по заявке
export async function getComments(requestId: number) {
  const res = await fetch(`${API_URL}/Comments/${requestId}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Не удалось получить комментарии");
  return res.json();
}

// ======================= Services =======================

// Получить все услуги
export async function getServices() {
  const res = await fetch(`${API_URL}/Services`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Не удалось получить услуги");
  return res.json();
}