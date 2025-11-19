import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { RepairRequest, RequestStatus, Role } from '../types';
import { AuthContext } from '../App';

const ReportsPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState<RepairRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllRequests = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                // In a real app, an admin might get all requests, a tech only their own.
                // We'll simulate getting all requests for reporting purposes.
                const allRequests = await api.getRequests({ ...user, role: Role.Admin }); // Override to get all
                setRequests(allRequests);
            } catch (error) {
                console.error("Failed to fetch requests for report:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllRequests();
    }, [user]);

    const handlePrint = () => {
        window.print();
    };
    
    const summary = requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
    }, {} as Record<RequestStatus, number>);

    return (
        <div className="text-smartfix-lightest">
            <div className="print:hidden flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold">Отчёты</h2>
                <button
                    onClick={handlePrint}
                    className="bg-smartfix-light text-smartfix-darkest font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                    Печать / Сохранить в PDF
                </button>
            </div>
            
             <div id="report-content" className="bg-smartfix-darker p-8 rounded-2xl print:bg-white print:text-black print:shadow-none print:p-0">
                <h3 className="text-3xl font-bold mb-2 print:text-black">Сводный отчёт по заявкам</h3>
                <p className="text-smartfix-light mb-8 print:text-gray-600">Дата формирования: {new Date().toLocaleDateString('ru-RU')}</p>

                <div className="mb-12 p-6 bg-smartfix-dark rounded-lg print:bg-gray-100 print:p-4">
                    <h4 className="text-2xl font-semibold mb-4 print:text-black">Статистика по статусам</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.values(RequestStatus).map(status => (
                            <div key={status} className="bg-smartfix-darker p-4 rounded-md print:bg-gray-200">
                                <p className="text-lg text-smartfix-light print:text-gray-700">{status}</p>
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
                                        <td className="p-3">{req.technicianName || 'Не назначен'}</td>
                                        <td className="p-3">{req.status}</td>
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