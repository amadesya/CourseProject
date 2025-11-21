import React, { useState, useEffect, useContext } from 'react';
import { Service, Role } from '../types';
import { AuthContext } from '../AuthContext';
import Modal from '../components/Modal';
import { PlusIcon, TrashIcon } from '../components/icons';
import { getServices} from '../services/api';

const ServicesPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceDesc, setNewServiceDesc] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');

    const fetchServices = async () => {
        setIsLoading(true);

        try {
            // Получаем список услуг с бэкенда
            const data = await getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services:", error);
            alert("Не удалось загрузить список услуг. Попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAddService = async () => {
        if (!newServiceName || !newServiceDesc || !newServicePrice) {
            alert("Пожалуйста, заполните все поля услуги.");
            return;
        }

        const newService = {
            name: newServiceName,
            description: newServiceDesc,
            price: parseFloat(newServicePrice),
        };

        try {
            // Вызываем API для создания услуги
            // await createService(newService);

            // Обновляем список услуг после добавления
            await fetchServices();

            // Закрываем модалку и сбрасываем поля
            setIsModalOpen(false);
            setNewServiceName('');
            setNewServiceDesc('');
            setNewServicePrice('');
        } catch (error) {
            console.error("Failed to add service:", error);
            alert("Не удалось добавить услугу. Попробуйте снова.");
        }
    };

    const handleDeleteService = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту услугу?')) return;

        try {
            // Вызываем API для удаления услуги
            // await deleteService(id);

            // Обновляем список услуг после удаления
            await fetchServices();
        } catch (error) {
            console.error("Failed to delete service:", error);
            alert("Не удалось удалить услугу. Попробуйте снова.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-smartfix-lightest">Прайс-лист услуг</h2>
                {user?.role === Role.Admin && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-smartfix-light text-smartfix-darkest font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Добавить услугу
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="text-center text-smartfix-light">Загрузка услуг...</div>
            ) : (
                <div className="bg-smartfix-darker rounded-2xl shadow-xl border border-smartfix-dark overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-smartfix-dark">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="p-6 flex justify-between items-start hover:bg-smartfix-dark transition-colors duration-200"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-smartfix-lightest">{service.name}</h3>
                                    <p className="text-smartfix-light mt-1">{service.description}</p>
                                </div>
                                <div className="text-right flex items-center shrink-0 ml-4">
                                    <p className="text-xl font-semibold text-smartfix-lightest mr-4">
                                        {service.price.toLocaleString('ru-RU')} ₽
                                    </p>

                                    {user?.role === Role.Admin && (
                                        <button
                                            onClick={() => handleDeleteService(service.id)}
                                            className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-900/50 transition-colors"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить новую услугу">
                <div className="space-y-4">
                    <div>
                        <label className="block text-smartfix-light mb-1">Название услуги</label>
                        <input type="text" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                    </div>
                    <div>
                        <label className="block text-smartfix-light mb-1">Описание</label>
                        <textarea value={newServiceDesc} onChange={(e) => setNewServiceDesc(e.target.value)} className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" rows={3}></textarea>
                    </div>
                    <div>
                        <label className="block text-smartfix-light mb-1">Цена (₽)</label>
                        <input type="number" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleAddService} className="bg-smartfix-light text-smartfix-darkest font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
                            Сохранить
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ServicesPage;

