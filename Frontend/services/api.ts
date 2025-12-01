import { RepairRequest, AuthResponseDto, LoginDto, RegisterDto } from "../types";

const API_URL = "http://localhost:5000/api";

// Функция для добавления Authorization заголовка
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// ======================= Auth =======================

// Регистрация
export const login = async (
  email: string,
  password: string
): Promise<AuthResponseDto | null> => {
  try {
    const res = await fetch(`${API_URL}/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to login:", res.status, text);
      return null;
    }

    const data: AuthResponseDto = await res.json();

    // Сохраняем в localStorage
    localStorage.setItem("smartfix_user", JSON.stringify(data));
    localStorage.setItem("token", data.token);

    return data;
  } catch (err) {
    console.error("Error login:", err);
    return null;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<AuthResponseDto | null> => {
  try {
    const res = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });

    if (!res.ok) {
      console.error('Failed to register:', res.status, await res.text());
      return null;
    }

    const json = await res.json();
    return null;
  } catch (err) {
    console.error('Error register:', err);
    return null;
  }
};

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

  const data = await res.json();

  return data.map((r: any) => ({
    id: r.id,
    clientName: r.clientName,
    clientId: r.clientId,
    device: r.device,
    issueDescription: r.issueDescription,
    status: r.status,
    technicianId: r.technicianId,
    technicianName: r.technicianName || 'Не назначен',
    comments: r.comments || [],
    createdAt: r.createdAt
  }));
}

export const importRepairRequests = async (data: any[]): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
}> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/RepairRequests/import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка импорта');
    }

    return response.json();
};

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
      Authorization: `Bearer ${localStorage.getItem('token')}`, // или user.token
    },
    body: JSON.stringify({ clientId, technicianId, device, issueDescription }),
  });

  if (!res.ok) throw new Error("Failed to fetch");
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

export async function getTechnicianRequests(
  technicianId: number,
  status?: string,
  startDate?: string,
  endDate?: string
) {
  const params = new URLSearchParams();

  if (status && status !== 'all') params.append('status', status);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`${API_URL}/RepairRequests/technician/${technicianId}?${params.toString()}`);

  if (!response.ok) throw new Error("Failed to load technician requests");
  return response.json();
}

// Добавьте эти функции к существующим в api.ts

// ======================= Users Management =======================

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: number;
  isVerified?: boolean;
  phone?: string;
  avatar?: string;
}) {
  const res = await fetch(`${API_URL}/Users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Не удалось создать пользователя");
  }
  
  return res.json();
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    password?: string;
    role?: number;
    isVerified?: boolean;
  }
) {
  const res = await fetch(`${API_URL}/Users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Не удалось обновить пользователя");
  }
  
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`${API_URL}/Users/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Не удалось удалить пользователя");
  }
  
  return res.json();
}

export async function getUserById(id: number) {
  const res = await fetch(`${API_URL}/Users/${id}`, {
    headers: { ...getAuthHeader() },
  });
  
  if (!res.ok) {
    throw new Error("Не удалось получить пользователя");
  }
  
  return res.json();
}