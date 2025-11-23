import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { RepairRequest } from '../types';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { getTechnicianRequests } from '../services/api';

const SchedulePage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState<RepairRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user || !user.id) {
                console.error("Нет пользователя или ID!");
                return;
            }

            setIsLoading(true);

            try {
                // ✅ Получение заявок ТОЛЬКО для техника
                const data = await getTechnicianRequests(user.id, "all");
                setRequests(data);
            } catch (error) {
                console.error("Failed to load technician requests:", error);
                alert("Не удалось загрузить заявки техники.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [user]);

    return (
        <div>
            <h2 className="text-4xl font-bold text-smartfix-lightest mb-8">Мой календарь заявок</h2>
            <div className="max-w-5xl mx-auto">
                {isLoading ? (
                    <p className="text-center text-smartfix-light">Загрузка календаря...</p>
                ) : (
                    <Calendar requests={requests} onSelectRequest={setSelectedRequest} />
                )}
            </div>

            {selectedRequest && (
                <Modal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    title={`Заявка #${selectedRequest.id} - ${selectedRequest.device}`}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-lg text-smartfix-lightest mb-2">Информация о заявке</h4>
                            <div className="grid grid-cols-2 gap-4 text-smartfix-light p-4 bg-smartfix-dark rounded-lg">
                                <p><strong>Клиент:</strong><br />{selectedRequest.clientName}</p>
                                <p><strong>Устройство:</strong><br />{selectedRequest.device}</p>
                                <p><strong>Статус:</strong><br /><StatusBadge status={selectedRequest.status} /></p>
                                <p className="col-span-2"><strong>Описание проблемы:</strong><br />{selectedRequest.issueDescription}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg text-smartfix-lightest mb-2">Комментарии</h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto bg-smartfix-dark p-4 rounded-lg">
                                {selectedRequest.comments.length > 0 ? selectedRequest.comments.map((c, i) => (
                                    <div key={i} className="p-3 bg-smartfix-darker rounded-md">
                                        <p className="text-sm text-smartfix-light">
                                            <span className="font-bold text-smartfix-lightest">{c.author}</span> - {c.date}
                                        </p>
                                        <p className="mt-1 text-smartfix-lightest">{c.text}</p>
                                    </div>
                                )) : <p className="text-smartfix-light">Комментариев пока нет.</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="bg-smartfix-medium text-smartfix-lightest font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SchedulePage;
