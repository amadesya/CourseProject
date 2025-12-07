    import React, { useState, useEffect, useContext, useRef } from 'react';
    import { getRepairRequests, getTechnicians } from '../services/api';
    import { RepairRequest, RequestStatus, Role } from '../types';
    import { AuthContext } from '../AuthContext';

    // Временная функция импорта (замените на настоящую из api.ts)
    const importRepairRequests = async (data: any[]): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }> => {
        const token = localStorage.getItem('token');
        const API_URL = 'http://localhost:5000/api'; // Замените на ваш API_URL
        
        const response = await fetch(`${API_URL}/repairrequests/import`, {
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

    const ReportsPage: React.FC = () => {
        const { user } = useContext(AuthContext);
        const [requests, setRequests] = useState<RepairRequest[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [importError, setImportError] = useState<string | null>(null);
        const [importSuccess, setImportSuccess] = useState<string | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);
        
        const statusLabels: Record<RequestStatus, string> = {
            [RequestStatus.New]: 'Новая',
            [RequestStatus.InProgress]: 'В работе',
            [RequestStatus.Ready]: 'Готова',
            [RequestStatus.Closed]: 'Закрыта',
            [RequestStatus.Rejected]: 'Отклонена',
        };
        const [technicians, setTechnicians] = useState<{ id: number, name: string }[]>([]);

        useEffect(() => {
            if (!user) return;

            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const allRequests = await getRepairRequests();
                    setRequests(allRequests);

                    const allTechnicians = await getTechnicians();
                    setTechnicians(allTechnicians);
                } catch (error) {
                    console.error("Failed to fetch requests or technicians:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, [user]);

        const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            setImportError(null);
            setImportSuccess(null);

            try {
                const text = await file.text();
                let importedData: any[];

                // Определяем тип файла и парсим
                if (file.name.endsWith('.json')) {
                    importedData = JSON.parse(text);
                } else if (file.name.endsWith('.csv')) {
                    // Простой парсер CSV
                    const lines = text.split('\n').filter(line => line.trim());
                    const headers = lines[0].split(',').map(h => h.trim());
                    
                    importedData = lines.slice(1).map(line => {
                        const values = line.split(',').map(v => v.trim());
                        const obj: any = {};
                        headers.forEach((header, index) => {
                            obj[header] = values[index];
                        });
                        return obj;
                    });
                } else {
                    throw new Error('Поддерживаются только файлы JSON и CSV');
                }

                // Валидация данных
                if (!Array.isArray(importedData)) {
                    throw new Error('Файл должен содержать массив данных');
                }

                console.log('Импортированные данные:', importedData);
                
                // Отправка данных на сервер
                const result = await importRepairRequests(importedData);
                
                let successMessage = `Импортировано: ${result.imported}`;
                if (result.skipped > 0) {
                    successMessage += `, Пропущено: ${result.skipped}`;
                }
                if (result.errors.length > 0) {
                    successMessage += `\nОшибки: ${result.errors.slice(0, 3).join('; ')}`;
                    if (result.errors.length > 3) {
                        successMessage += `... и ещё ${result.errors.length - 3}`;
                    }
                }
                
                setImportSuccess(successMessage);
                
                // Обновляем список заявок
                const allRequests = await getRepairRequests();
                setRequests(allRequests);

            } catch (error) {
                console.error('Ошибка импорта:', error);
                setImportError(error instanceof Error ? error.message : 'Неизвестная ошибка при импорте');
            }

            // Очищаем input для возможности повторного импорта того же файла
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        const handleImportClick = () => {
            fileInputRef.current?.click();
        };

        const handlePrint = () => {
            window.print();
        };

        const handleExportJSON = () => {
            const dataStr = JSON.stringify(requests, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `repair-requests-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        };

        const handleExportCSV = () => {
            const headers = ['ID', 'Клиент', 'Устройство', 'Мастер', 'Статус', 'Дата создания'];
            const csvRows = [headers.join(',')];
            
            requests.forEach(req => {
                const technicianName = req.technicianId
                    ? technicians.find(t => t.id === req.technicianId)?.name || 'Неизвестно'
                    : 'Не назначен';
                
                const row = [
                    req.id,
                    req.clientName,
                    req.device,
                    technicianName,
                    statusLabels[req.status],
                    new Date(req.createdAt).toLocaleDateString('ru-RU')
                ];
                csvRows.push(row.join(','));
            });

            const csvStr = csvRows.join('\n');
            const dataBlob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `repair-requests-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        };

        const summary = requests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
        }, {} as Record<RequestStatus, number>);

        return (
            <div className="text-smartfix-lightest">
                <div className="print:hidden flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-bold">Отчёты</h2>
                    <div className="flex gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileImport}
                            accept=".json,.csv"
                            className="hidden"
                        />
                        <button
                            onClick={handleImportClick}
                            className="bg-smartfix-medium text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            📥 Импорт
                        </button>
                        <button
                            onClick={handleExportJSON}
                            className="bg-smartfix-medium text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            📤 JSON
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="bg-smartfix-medium text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            📤 CSV
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-smartfix-light text-smartfix-darkest font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            🖨️ Печать
                        </button>
                    </div>
                </div>

                {importError && (
                    <div className="print:hidden mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                        <strong>Ошибка импорта:</strong> {importError}
                    </div>
                )}

                {importSuccess && (
                    <div className="print:hidden mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
                        <strong>Успех!</strong> {importSuccess}
                    </div>
                )}

                <div id="report-content" className="bg-smartfix-darker p-8 rounded-2xl print:bg-white print:text-black print:shadow-none print:p-0">
                    <h3 className="text-3xl font-bold mb-2 print:text-black">Сводный отчёт по заявкам</h3>
                    <p className="text-smartfix-light mb-8 print:text-gray-600">Дата формирования: {new Date().toLocaleDateString('ru-RU')}</p>

                    <div className="mb-12 p-6 bg-smartfix-dark rounded-lg print:bg-gray-100 print:p-4">
                        <h4 className="text-2xl font-semibold mb-4 print:text-black">Статистика по статусам</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {Object.values(RequestStatus).map(status => (
                                <div key={status} className="bg-smartfix-darker p-4 rounded-md print:bg-gray-200">
                                    <p className="text-lg text-smartfix-light print:text-gray-700">{statusLabels[status]}</p>
                                    <p className="text-3xl font-bold text-white print:text-black">{summary[status] || 0}</p>
                                </div>
                            ))}
                            <div className="bg-smartfix-medium p-4 rounded-md print:bg-blue-200">
                                <p className="text-lg text-smartfix-lightest font-semibold print:text-blue-800">Всего заявок</p>
                                <p className="text-3xl font-bold text-white print:text-blue-900">{requests.length}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-2xl font-semibold mb-4 print:text-black">Все заявки</h4>
                        <div className="overflow-x-auto border border-smartfix-medium rounded-lg">
                            <table className="w-full text-left table-auto">
                                <thead className="bg-smartfix-dark text-smartfix-light print:bg-gray-200">
                                    <tr>
                                        <th className="p-3 font-semibold">ID</th>
                                        <th className="p-3 font-semibold">Клиент</th>
                                        <th className="p-3 font-semibold">Устройство</th>
                                        <th className="p-3 font-semibold">Мастер</th>
                                        <th className="p-3 font-semibold">Статус</th>
                                        <th className="p-3 font-semibold">Дата создания</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-smartfix-dark print:divide-gray-300">
                                    {requests.map(req => (
                                        <tr key={req.id} className="hover:bg-smartfix-dark/50 print:hover:bg-gray-100 text-smartfix-light">
                                            <td className="p-3 text-smartfix-lightest">{req.id}</td>
                                            <td className="p-3 text-smartfix-lightest">{req.clientName}</td>
                                            <td className="p-3 text-smartfix-lightest">{req.device}</td>
                                            <td className="p-3">
                                                {req.technicianId
                                                    ? technicians.find(t => t.id === req.technicianId)?.name || 'Неизвестно'
                                                    : 'Не назначен'}
                                            </td>
                                            <td className="p-3">{statusLabels[req.status]}</td>
                                            <td className="p-3">{new Date(req.createdAt).toLocaleDateString('ru-RU')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <style>
                    {`
                @media print {
                    body {
                    background-color: white;
                    }
                    main {
                    padding: 0;
                    }
                }
                `}
                </style>
            </div>
        );
    };

    export default ReportsPage;