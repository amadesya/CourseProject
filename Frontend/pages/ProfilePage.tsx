import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../AuthContext';
import { updateUser } from '../services/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
    const { user, setUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        password: '',
        confirmPassword: ''
    });

    const [originalEmail, setOriginalEmail] = useState(user?.email || '');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                avatar: user.avatar || '',
                password: '',
                confirmPassword: ''
            });
            setOriginalEmail(user.email || '');
            setAvatarPreview(null);
            setAvatarFile(null);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Пожалуйста, выберите изображение' });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Размер файла не должен превышать 5MB' });
                return;
            }

            setAvatarFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarButtonClick = () => {
        fileInputRef.current?.click();
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user || !setUser) {
            setMessage({ type: 'error', text: 'Ошибка: контекст не инициализирован' });
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Пароли не совпадают' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            };

            if (avatarFile) {
                const base64Avatar = await convertFileToBase64(avatarFile);
                updateData.avatar = base64Avatar;
            } else if (formData.avatar) {
                updateData.avatar = formData.avatar;
            }

            if (formData.password) {
                updateData.password = formData.password;
            }

            const updatedUser = await updateUser(user.id, updateData);

            // Обновляем пользователя в контексте с сохранением токена
            const updatedAuthUser: User = {
                ...user,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar
            };

            // Обновляем контекст - это автоматически обновит localStorage
            setUser(updatedAuthUser);
            
            setMessage({ type: 'success', text: 'Профиль успешно обновлен' });
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setOriginalEmail(updatedUser.email);
            setAvatarPreview(null);
            setAvatarFile(null);

            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ошибка при обновлении профиля' });
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleLabel = (role: number) => {
        switch (role) {
            case 0: return 'Клиент';
            case 1: return 'Мастер';
            case 2: return 'Администратор';
            default: return 'Неизвестно';
        }
    };

    const getAvatarDisplay = () => {
        if (avatarPreview) {
            return avatarPreview;
        }
        if (formData.avatar) {
            return formData.avatar;
        }
        return null;
    };

    if (!user) {
        return <div className="text-smartfix-lightest">Загрузка...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto text-smartfix-lightest">
            <h2 className="text-4xl font-bold mb-8">Мой профиль</h2>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-500/20 border border-green-500 text-green-300' 
                        : 'bg-red-500/20 border border-red-500 text-red-300'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="bg-smartfix-darker p-8 rounded-2xl">
                <div className="flex items-center mb-8 pb-8 border-b border-smartfix-medium">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-smartfix-medium flex items-center justify-center text-4xl font-bold mr-6">
                            {getAvatarDisplay() ? (
                                <img src={getAvatarDisplay()!} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                formData.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleAvatarButtonClick}
                                className="absolute bottom-0 right-4 bg-smartfix-light text-smartfix-darkest rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-80 transition-colors"
                                title="Изменить аватар"
                            >
                                📷
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold">{formData.name}</h3>
                        <p className="text-smartfix-light text-lg">{getRoleLabel(user.role)}</p>
                        {user.isVerified && (
                            <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                ✓ Верифицирован
                            </span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                    />

                    <div className="space-y-6">
                        <div>
                            <label className="block text-smartfix-light mb-2">Имя</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full p-3 bg-smartfix-dark rounded-lg border border-smartfix-medium focus:border-smartfix-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-smartfix-light mb-2">Email</label>
                            {isEditing && originalEmail !== formData.email && (
                                <p className="text-sm text-smartfix-light mb-1">
                                    Текущий email: <span className="text-smartfix-lightest">{originalEmail}</span>
                                </p>
                            )}
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full p-3 bg-smartfix-dark rounded-lg border border-smartfix-medium focus:border-smartfix-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-smartfix-light mb-2">Телефон</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full p-3 bg-smartfix-dark rounded-lg border border-smartfix-medium focus:border-smartfix-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {isEditing && (
                            <div>
                                <label className="block text-smartfix-light mb-2">URL аватара (опционально)</label>
                                <input
                                    type="url"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleInputChange}
                                    disabled={!!avatarFile}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full p-3 bg-smartfix-dark rounded-lg border border-smartfix-medium focus:border-smartfix-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <p className="text-sm text-smartfix-light mt-1">
                                    {avatarFile ? 'Выбран файл с устройства' : 'Или загрузите файл, нажав на камеру выше'}
                                </p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="pt-4 border-t border-smartfix-medium">
                                <h4 className="text-xl font-semibold mb-4">Изменить пароль (необязательно)</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-smartfix-light mb-2">Новый пароль</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full p-3 bg-smartfix-dark rounded-lg border border-smartfix-medium focus:border-smartfix-light focus:outline-none"
                                            placeholder="Оставьте пустым, чтобы не менять"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-smartfix-light mb-2">Подтвердите пароль</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full p-3 bg-smartfix-dark rounded-lg border border-smartfix-medium focus:border-smartfix-light focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 mt-8">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="bg-smartfix-light text-smartfix-darkest font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
                            >
                                Редактировать профиль
                            </button>
                        ) : (
                            <>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-smartfix-light text-smartfix-darkest font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user.name || '',
                                            email: user.email || '',
                                            phone: user.phone || '',
                                            avatar: user.avatar || '',
                                            password: '',
                                            confirmPassword: ''
                                        });
                                        setMessage(null);
                                        setAvatarPreview(null);
                                        setAvatarFile(null);
                                    }}
                                    disabled={isSaving}
                                    className="bg-smartfix-medium text-smartfix-lightest font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50"
                                >
                                    Отмена
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;