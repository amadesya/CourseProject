import React, { useState, useEffect, useContext, useMemo } from 'react';
import { createRepairRequest, getRepairRequests, getTechnicians, updateRepairRequest, getTechnicianRequests } from "../services/api";
import { RepairRequest, RequestStatus, Role, User } from '../types';
import { AuthContext } from '../AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import StatusSelect from '../components/StatusSelect';

const NewRequestForm: React.FC<{ user: User; onSubmitted: () => void }> = ({ user, onSubmitted }) => {
    const [deviceType, setDeviceType] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [urgency, setUrgency] = useState('standard');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deviceType || !brand || !model || !issueDescription) {
            alert('Пожалуйста, заполните все поля информации об устройстве и опишите проблему.');
            return;
        }

        setIsSubmitting(true);

        const deviceFullName = `${deviceType} ${brand} ${model}`;
        const issueFullDescription = `Срочность: ${urgency === 'urgent' ? 'Срочно' : 'Стандартная'}. Проблема: ${issueDescription}`;

        try {
            const newRequest = await createRepairRequest(
                user.id,
                null,
                deviceFullName,
                issueFullDescription
            );

            onSubmitted(newRequest);

            setDeviceType('');
            setBrand('');
            setModel('');
            setIssueDescription('');
            setUrgency('standard');
        } catch (error) {
            console.error("Failed to create request:", error);
            alert('Не удалось создать заявку. Попробуйте снова.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-smartfix-darker p-6 rounded-2xl border border-smartfix-dark max-w-3xl mx-auto">
            <div className="space-y-8">
                <fieldset className="p-4 border border-smartfix-dark rounded-lg">
                    <legend className="px-2 font-semibold text-smartfix-lightest">Информация об устройстве</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                            <label className="block text-smartfix-light mb-1 text-sm">Тип устройства</label>
                            <input type="text" value={deviceType} onChange={e => setDeviceType(e.target.value)} placeholder="Телефон" className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                        </div>
                        <div>
                            <label className="block text-smartfix-light mb-1 text-sm">Бренд</label>
                            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Apple" className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                        </div>
                        <div>
                            <label className="block text-smartfix-light mb-1 text-sm">Модель</label>
                            <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="iPhone 14 Pro" className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="p-4 border border-smartfix-dark rounded-lg">
                    <legend className="px-2 font-semibold text-smartfix-lightest">Описание проблемы</legend>
                    <textarea value={issueDescription} onChange={e => setIssueDescription(e.target.value)} placeholder="Например: разбит экран, не включается..." rows={4} className="mt-2 w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light"></textarea>
                </fieldset>

                <fieldset className="p-4 border border-smartfix-dark rounded-lg">
                    <legend className="px-2 font-semibold text-smartfix-lightest">Срочность</legend>
                    <select value={urgency} onChange={e => setUrgency(e.target.value)} className="mt-2 w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light">
                        <option value="standard">Стандартная</option>
                        <option value="urgent">Срочный ремонт</option>
                    </select>
                </fieldset>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="bg-smartfix-light text-smartfix-darkest font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-smartfix-medium">
                        {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                </div>
            </div>
        </form>
    );
};

const RequestsPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState<RepairRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
    const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Client view state
    const [activeClientTab, setActiveClientTab] = useState<'list' | 'new'>('list');

    // Technician view state
    const [activeTechTab, setActiveTechTab] = useState<'accepted' | 'new'>('accepted');

    // State for request details modal
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [selectedTechnician, setSelectedTechnician] = useState<string>('');
    const [newStatus, setNewStatus] = useState<RequestStatus | ''>('');
    const [newComment, setNewComment] = useState('');

    const fetchData = async () => {
        if (!user) return;

        setIsLoading(true);

        try {
            let data: RepairRequest[] = [];

            if (user.role === Role.Client) {
                const all = await getRepairRequests();
                data = all.filter(r => r.clientId === user.id);
            }

            else if (user.role === Role.Technician) {
                if (activeTechTab === 'accepted') {

                    const status =
                        filterStatus !== "all"
                            ? filterStatus
                            : undefined;

                    data = await getTechnicianRequests(
                        user.id,
                        status,
                        startDate || undefined,
                        endDate || undefined
                    );
                }

                else if (activeTechTab === 'new') {
                    const all = await getRepairRequests();

                    data = all.filter(r => r.technicianId === null);

                    if (filterStatus !== "all") {
                        data = data.filter(r => r.status === filterStatus);
                    }

                    if (startDate || endDate) {
                        data = data.filter(r => {
                            const date = new Date(r.createdAt);
                            const start = startDate ? new Date(startDate) : null;
                            const end = endDate ? new Date(endDate) : null;
                            return (!start || date >= start) &&
                                (!end || date <= end);
                        });
                    }
                }
            }

            else if (user.role === Role.Admin) {
                let all = await getRepairRequests();

                if (filterStatus !== "all") {
                    all = all.filter(r => r.status === filterStatus);
                }

                if (startDate || endDate) {
                    all = all.filter(r => {
                        const date = new Date(r.createdAt);
                        const start = startDate ? new Date(startDate) : null;
                        const end = endDate ? new Date(endDate) : null;
                        return (!start || date >= start) &&
                            (!end || date <= end);
                    });
                }

                data = all;

                // подгружаем мастеров
                const techs = await getTechnicians();
                setTechnicians(techs);
            }

            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            alert("Не удалось загрузить заявки. Попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, activeTechTab, filterStatus, startDate, endDate]);

    const handleUpdateRequest = async () => {
        if (!selectedRequest || !user) return;

        // Формируем новые значения
        const updatedStatus = newStatus && newStatus !== selectedRequest.status ? newStatus : selectedRequest.status;
        const updatedTechnicianId =
            user.role === Role.Admin && selectedTechnician && Number(selectedTechnician) !== selectedRequest.technicianId
                ? Number(selectedTechnician)
                : selectedRequest.technicianId;

        // Формируем новый комментарий
        const updatedComments = [...selectedRequest.comments];
        if (newComment.trim()) {
            updatedComments.push({
                author: user.name,
                text: newComment.trim(),
                date: new Date().toLocaleString('ru-RU'),
            });
        }

        try {
            // Вызываем API для обновления заявки
            await updateRepairRequest(
                selectedRequest.id,
                updatedTechnicianId ?? null,
                selectedRequest.device,
                selectedRequest.issueDescription,
                updatedStatus
            );

            // Если API отдельно обрабатывает комментарии, можно их отправить через отдельный эндпоинт
            // Например: await addCommentToRequest(selectedRequest.id, updatedComments);

            // После успешного обновления перезагружаем список заявок
            await fetchData();

            // Сбрасываем состояние модалки и комментария ПОСЛЕ успешной загрузки данных
            closeDetailsModal();

            // Можно добавить уведомление об успехе
            // alert("Заявка успешно обновлена!");

        } catch (error) {
            console.error("Failed to update request:", error);
            alert("Не удалось обновить заявку. Попробуйте снова.");
        }
    };

    const handleTechnicianAction = async (action: 'accept' | 'reject') => {
        if (!selectedRequest || !user || user.role !== Role.Technician) return;

        // Копируем текущую заявку
        const updatedComments = [...selectedRequest.comments];
        let updatedStatus = selectedRequest.status;
        let updatedTechnicianId = selectedRequest.technicianId;

        if (action === 'accept') {
            updatedTechnicianId = user.id;
            updatedStatus = RequestStatus.InProgress;
            updatedComments.push({
                author: 'Система',
                text: `Мастер ${user.name} принял заявку в работу.`,
                date: new Date().toLocaleString('ru-RU'),
            });
        } else { // reject
            updatedStatus = RequestStatus.Rejected;
            updatedComments.push({
                author: 'Система',
                text: `Мастер ${user.name} отклонил заявку.`,
                date: new Date().toLocaleString('ru-RU'),
            });
        }

        try {
            // Вызываем API для обновления заявки
            await updateRepairRequest(
                selectedRequest.id,
                updatedTechnicianId ?? null,
                selectedRequest.device,
                selectedRequest.issueDescription,
                updatedStatus
            );

            // Обновляем список заявок
            await fetchData();

            // Закрываем модалку с деталями
            closeDetailsModal();

            if (action === 'accept') {
                setActiveTechTab('accepted');
            }
        } catch (error) {
            console.error(`Failed to ${action} request:`, error);
            alert(`Не удалось ${action === 'accept' ? 'принять' : 'отклонить'} заявку. Попробуйте снова.`);
        }
    };

    const openDetailsModal = (request: RepairRequest) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setSelectedTechnician(request.technicianId?.toString() || '');
    };

    const closeDetailsModal = () => {
        setSelectedRequest(null);
        setNewComment('');
    }

    const onNewRequestSubmitted = () => {
        fetchData();
        setActiveClientTab('list');
    }

    if (!user) return null;

    const isClient = user.role === Role.Client;
    const isTechnician = user.role === Role.Technician;

    const renderTechnicianActionModal = () => {
        if (!selectedRequest) return null;
        return (
            <Modal isOpen={!!selectedRequest} onClose={closeDetailsModal} title={`Новая заявка #${selectedRequest.id}`}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-lg text-smartfix-lightest mb-2">Информация о заявке</h4>
                        <div className="grid grid-cols-2 gap-4 text-smartfix-light p-4 bg-smartfix-dark rounded-lg">
                            <p><strong>Клиент:</strong><br />{selectedRequest.clientName}</p>
                            <p><strong>Устройство:</strong><br />{selectedRequest.device}</p>
                            <p className="col-span-2"><strong>Описание проблемы:</strong><br />{selectedRequest.issueDescription}</p>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 gap-4">
                        <button onClick={() => handleTechnicianAction('reject')} className="bg-red-600/80 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                            Отклонить
                        </button>
                        <button onClick={() => handleTechnicianAction('accept')} className="bg-green-600/80 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
                            Принять в работу
                        </button>
                    </div>
                </div>
            </Modal>
        )
    }

    const renderDetailsModal = () => {
        if (!selectedRequest) return null;

        // Technician viewing a new, unassigned request
        if (isTechnician && activeTechTab === 'new' && !selectedRequest.technicianId) {
            return renderTechnicianActionModal();
        }

        return (
            <Modal isOpen={!!selectedRequest} onClose={closeDetailsModal} title={`Заявка #${selectedRequest.id} - ${selectedRequest.device}`}>
                <div className="space-y-6">
                    {/* Request info */}
                    <div>
                        <h4 className="font-bold text-lg text-smartfix-lightest mb-2">Информация о заявке</h4>
                        <div className="grid grid-cols-2 gap-4 text-smartfix-light p-4 bg-smartfix-dark rounded-lg">
                            <p><strong>Клиент:</strong><br />{selectedRequest.clientName}</p>
                            <p><strong>Устройство:</strong><br />{selectedRequest.device}</p>
                            <p><strong>Мастер:</strong><br />{selectedRequest.technicianName || 'Не назначен'}</p>
                            <p><strong>Статус:</strong><br /><StatusBadge status={selectedRequest.status} /></p>
                            <p className="col-span-2"><strong>Описание проблемы:</strong><br />{selectedRequest.issueDescription}</p>
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <h4 className="font-bold text-lg text-smartfix-lightest mb-2">Комментарии</h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto bg-smartfix-dark p-4 rounded-lg">
                            {selectedRequest.comments.length > 0 ? selectedRequest.comments.map((c, i) => (
                                <div key={i} className="p-3 bg-smartfix-darker rounded-md">
                                    <p className="text-sm text-smartfix-light"><span className="font-bold text-smartfix-lightest">{c.author}</span> - {c.date}</p>
                                    <p className="mt-1 text-smartfix-lightest">{c.text}</p>
                                </div>
                            )) : <p className="text-smartfix-light">Комментариев пока нет.</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    {(user.role === Role.Admin || user.role === Role.Technician) && (
                        <div>
                            <h4 className="font-bold text-lg text-smartfix-lightest mb-2">Изменить заявку</h4>
                            <div className="space-y-4 p-4 bg-smartfix-dark rounded-lg">
                                {user.role === Role.Admin && (
                                    <div>
                                        <label className="block text-smartfix-light mb-1">Назначить мастера</label>
                                        <select value={selectedTechnician} onChange={e => setSelectedTechnician(e.target.value)} className="w-full bg-smartfix-darker p-2 rounded-lg border border-smartfix-medium">
                                            <option value="">Не назначен</option>
                                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-smartfix-light mb-1">Изменить статус</label>
                                    <StatusSelect
                                        value={newStatus as RequestStatus} // текущий статус заявки
                                        onChange={(val: RequestStatus) => setNewStatus(val)} // обновляем состояние
                                    />
                                </div>
                                <div>
                                    <label className="block text-smartfix-light mb-1">Добавить комментарий</label>
                                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} className="w-full bg-smartfix-darker p-2 rounded-lg border border-smartfix-medium" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 gap-4">
                        <button onClick={closeDetailsModal} className="bg-smartfix-medium text-smartfix-lightest font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
                            Закрыть
                        </button>
                        {(user.role === Role.Admin || user.role === Role.Technician) && (
                            <button onClick={handleUpdateRequest} className="bg-smartfix-light text-smartfix-darkest font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
                                Сохранить
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        )
    }

    const renderContent = () => {
        if (isClient) {
            if (activeClientTab === 'new') {
                return <NewRequestForm user={user} onSubmitted={onNewRequestSubmitted} />;
            }
        }

        return (
            <>
                {isTechnician && (
                    <div className="flex border-b border-smartfix-dark mb-6">
                        <button onClick={() => setActiveTechTab('accepted')} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTechTab === 'accepted' ? 'text-smartfix-lightest bg-smartfix-dark rounded-t-md' : 'text-smartfix-light'}`}>
                            Принятые
                        </button>
                        <button onClick={() => setActiveTechTab('new')} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTechTab === 'new' ? 'text-smartfix-lightest bg-smartfix-dark rounded-t-md' : 'text-smartfix-light'}`}>
                            Новые
                        </button>
                    </div>
                )}

                {!isClient && (
                    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-smartfix-dark rounded-lg border border-smartfix-medium">
                        <div>
                            <label htmlFor="status-filter" className="text-sm font-medium text-smartfix-light mr-2">Статус:</label>
                            <select
                                id="status-filter"
                                onChange={(e) => setFilterStatus(e.target.value)}
                                value={filterStatus}
                                className="bg-smartfix-darker p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light"
                            >
                                <option value="all">Все статусы</option>
                                {Object.values(RequestStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="start-date" className="text-sm font-medium text-smartfix-light">С:</label>
                            <input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="bg-smartfix-darker p-1.5 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="end-date" className="text-sm font-medium text-smartfix-light">По:</label>
                            <input
                                type="date"
                                id="end-date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="bg-smartfix-darker p-1.5 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-sm"
                            />
                        </div>
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); setFilterStatus('all'); }}
                            className="text-sm bg-smartfix-medium text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center text-smartfix-light">Загрузка заявок...</div>
                ) : (
                    <div className="bg-smartfix-darker rounded-2xl shadow-xl border border-smartfix-dark">
                        <div className="divide-y divide-smartfix-dark">
                            {requests.length > 0 ? requests.map(req => (
                                <div key={req.id} className="p-4 hover:bg-smartfix-dark transition-colors duration-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                        <div>
                                            <div className="font-bold text-lg text-smartfix-lightest">Заявка #{req.id}</div>
                                            <div className="text-sm text-smartfix-light">{new Date(req.createdAt).toLocaleDateString('ru-RU')}</div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <div className="font-semibold text-smartfix-lightest">{req.device}</div>
                                            <p className="text-sm text-smartfix-light truncate">{req.issueDescription}</p>
                                        </div>
                                        <div className="text-center">
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <div className="text-right col-span-2 md:col-span-1">
                                            <button onClick={() => openDetailsModal(req)} className="bg-smartfix-medium text-smartfix-lightest py-2 px-4 rounded-lg hover:bg-smartfix-light hover:text-smartfix-darkest transition-colors text-sm font-semibold">
                                                Подробнее
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="p-6 text-center text-smartfix-light">Заявок не найдено.</p>
                            )}
                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-bold text-smartfix-lightest">{isClient ? 'Личный кабинет' : 'Заявки на ремонт'}</h2>
            </div>

            {isClient && (
                <div className="flex border-b border-smartfix-dark mb-6">
                    <button onClick={() => setActiveClientTab('list')} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeClientTab === 'list' ? 'text-smartfix-lightest bg-smartfix-dark rounded-t-md' : 'text-smartfix-light'}`}>
                        Список заявок
                    </button>
                    <button onClick={() => setActiveClientTab('new')} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeClientTab === 'new' ? 'text-smartfix-lightest bg-smartfix-dark rounded-t-md' : 'text-smartfix-light'}`}>
                        Новая заявка
                    </button>
                </div>
            )}

            {renderContent()}

            {renderDetailsModal()}
        </div>
    );
};

export default RequestsPage;