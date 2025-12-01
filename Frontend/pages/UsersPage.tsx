import React, { useState, useEffect, useContext } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { User, Role } from '../types';
import { AuthContext } from '../AuthContext';
import Modal from '../components/Modal';

const UsersPage: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: Role.Client,
        isVerified: false,
        avatar: ''
    });

    useEffect(() => {
        if (!currentUser || currentUser.role !== Role.Admin) return;
        fetchUsers();
    }, [currentUser]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            alert('Не удалось загрузить пользователей');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setIsCreating(true);
        setSelectedUser(null);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setIsCreating(false);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '',
            role: user.role,
            isVerified: user.isVerified,
            avatar: user.avatar || ''
        });
    };

    const closeModal = () => {
        setSelectedUser(null);
        setIsCreating(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: Role.Client,
            isVerified: false,
            avatar: ''
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            alert('Заполните обязательные поля: Имя и Email');
            return;
        }

        if (isCreating && !formData.password) {
            alert('Укажите пароль для нового пользователя');
            return;
        }

        try {
            const submitData = { ...formData };
            if (!submitData.password) {
                delete (submitData as any).password;
            }

            if (isCreating) {
                await createUser(submitData);
                alert('Пользователь успешно создан');
            } else if (selectedUser) {
                await updateUser(selectedUser.id, submitData);
                alert('Пользователь успешно обновлен');
            }

            closeModal();
            fetchUsers();
        } catch (error: any) {
            console.error('Ошибка сохранения:', error);
            alert(error.message || 'Не удалось сохранить пользователя');
        }
    };

    const handleDelete = async (userId: number) => {
        if (userId === currentUser?.id) {
            alert('Нельзя удалить собственный аккаунт');
            return;
        }

        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            await deleteUser(userId);
            alert('Пользователь удален');
            fetchUsers();
        } catch (error: any) {
            console.error('Ошибка удаления:', error);
            alert(error.message || 'Не удалось удалить пользователя');
        }
    };

    const getRoleName = (role: Role): string => {
        switch (role) {
            case Role.Client: return 'Клиент';
            case Role.Technician: return 'Техник';
            case Role.Admin: return 'Администратор';
            default: return 'Неизвестно';
        }
    };

    const getRoleBadgeClass = (role: Role): string => {
        switch (role) {
            case Role.Client: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case Role.Technician: return 'bg-green-500/20 text-green-300 border-green-500/30';
            case Role.Admin: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    if (!currentUser || currentUser.role !== Role.Admin) {
        return (
            <div className="text-center text-smartfix-light mt-12">
                <p className="text-xl">У вас нет доступа к этой странице</p>
            </div>
        );
    }

    const renderModal = () => {
        if (!isCreating && !selectedUser) return null;

        return (
            <Modal
                isOpen={isCreating || !!selectedUser}
                onClose={closeModal}
                title={isCreating ? 'Создать пользователя' : `Редактировать: ${selectedUser?.name}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-smartfix-light mb-1 text-sm">Имя *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-smartfix-lightest"
                            placeholder="Иван Иванов"
                        />
                    </div>

                    <div>
                        <label className="block text-smartfix-light mb-1 text-sm">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-smartfix-lightest"
                            placeholder="example@mail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-smartfix-light mb-1 text-sm">Телефон</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-smartfix-lightest"
                            placeholder="+7 (999) 123-45-67"
                        />
                    </div>

                    <div>
                        <label className="block text-smartfix-light mb-1 text-sm">
                            Пароль {!isCreating && '(оставьте пустым, чтобы не менять)'}
                            {isCreating && ' *'}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-smartfix-lightest"
                            placeholder="********"
                        />
                    </div>

                    <div>
                        <label className="block text-smartfix-light mb-1 text-sm">Роль</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: parseInt(e.target.value) as Role })}
                            className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-smartfix-lightest"
                        >
                            <option value={Role.Client}>Клиент</option>
                            <option value={Role.Technician}>Техник</option>
                            <option value={Role.Admin}>Администратор</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-smartfix-light mb-1 text-sm">URL аватара</label>
                        <input
                            type="url"
                            value={formData.avatar}
                            onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                            className="w-full bg-smartfix-dark p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light text-smartfix-lightest"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-smartfix-dark rounded-lg">
                        <input
                            type="checkbox"
                            id="isVerified"
                            checked={formData.isVerified}
                            onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                            className="w-4 h-4 text-smartfix-light border-smartfix-medium rounded focus:ring-smartfix-light"
                        />
                        <label htmlFor="isVerified" className="text-smartfix-light text-sm">
                            Подтвержденный аккаунт
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={closeModal}
                            className="bg-smartfix-medium text-smartfix-lightest font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-smartfix-light text-smartfix-darkest font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            {isCreating ? 'Создать' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <div className="text-smartfix-lightest">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold">Управление пользователями</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-smartfix-light text-smartfix-darkest font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                    ➕ Создать пользователя
                </button>
            </div>

            {/* Фильтры и поиск */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-smartfix-dark rounded-lg border border-smartfix-medium">
                <div>
                    <label htmlFor="role-filter" className="text-sm font-medium text-smartfix-light mr-2">
                        Роль:
                    </label>
                    <select
                        id="role-filter"
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as Role)}
                        className="bg-smartfix-darker p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light"
                    >
                        <option value="all">Все роли</option>
                        <option value={Role.Client}>Клиенты</option>
                        <option value={Role.Technician}>Техники</option>
                        <option value={Role.Admin}>Администраторы</option>
                    </select>
                </div>

                <div className="flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Поиск по имени или email..."
                        className="w-full bg-smartfix-darker p-2 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light"
                    />
                </div>

                <button
                    onClick={() => {
                        setFilterRole('all');
                        setSearchQuery('');
                    }}
                    className="text-sm bg-smartfix-medium text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                    Сбросить
                </button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-smartfix-darker p-4 rounded-lg border border-smartfix-dark">
                    <p className="text-sm text-smartfix-light mb-1">Всего пользователей</p>
                    <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <div className="bg-smartfix-darker p-4 rounded-lg border border-smartfix-dark">
                    <p className="text-sm text-smartfix-light mb-1">Клиентов</p>
                    <p className="text-3xl font-bold text-blue-300">{users.filter(u => u.role === Role.Client).length}</p>
                </div>
                <div className="bg-smartfix-darker p-4 rounded-lg border border-smartfix-dark">
                    <p className="text-sm text-smartfix-light mb-1">Техников</p>
                    <p className="text-3xl font-bold text-green-300">{users.filter(u => u.role === Role.Technician).length}</p>
                </div>
                <div className="bg-smartfix-darker p-4 rounded-lg border border-smartfix-dark">
                    <p className="text-sm text-smartfix-light mb-1">Администраторов</p>
                    <p className="text-3xl font-bold text-purple-300">{users.filter(u => u.role === Role.Admin).length}</p>
                </div>
            </div>

            {/* Список пользователей */}
            {isLoading ? (
                <div className="text-center text-smartfix-light py-12">Загрузка пользователей...</div>
            ) : (
                <div className="bg-smartfix-darker rounded-2xl shadow-xl border border-smartfix-dark overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-smartfix-dark">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-smartfix-light">ID</th>
                                    <th className="p-4 text-left text-sm font-semibold text-smartfix-light">Пользователь</th>
                                    <th className="p-4 text-left text-sm font-semibold text-smartfix-light">Email</th>
                                    <th className="p-4 text-left text-sm font-semibold text-smartfix-light">Телефон</th>
                                    <th className="p-4 text-left text-sm font-semibold text-smartfix-light">Роль</th>
                                    <th className="p-4 text-left text-sm font-semibold text-smartfix-light">Статус</th>
                                    <th className="p-4 text-right text-sm font-semibold text-smartfix-light">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-smartfix-dark">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-smartfix-dark transition-colors">
                                        <td className="p-4 text-smartfix-lightest">{user.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-smartfix-medium flex items-center justify-center text-white font-bold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-smartfix-lightest">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-smartfix-light">{user.email}</td>
                                        <td className="p-4 text-smartfix-light">{user.phone || '—'}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClass(user.role)}`}>
                                                {getRoleName(user.role)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.isVerified ? (
                                                <span className="text-green-400 text-sm flex items-center gap-1">
                                                    ✓ Подтвержден
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-sm">
                                                    Не подтвержден
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="bg-smartfix-medium text-white px-4 py-1.5 rounded-lg hover:bg-opacity-80 transition-colors text-sm mr-2"
                                            >
                                                ✏️ Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="bg-red-600/80 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                disabled={user.id === currentUser.id}
                                            >
                                                🗑️ Удалить
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-smartfix-light">
                                            Пользователи не найдены
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {renderModal()}
        </div>
    );
};

export default UsersPage;