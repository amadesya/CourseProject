import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { UserIcon } from '../components/icons';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setAvatar(user.avatar || '');
        }
    }, [user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');
        setSuccess('');
        setIsSaving(true);

        try {
            const updatedUser = await updateUser({ ...user, name, email, phone, avatar });
            if (updatedUser) {
                setSuccess('Данные профиля успешно обновлены!');
            } else {
                setError('Не удалось обновить профиль.');
            }
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
        }
    };

    if (!user) {
        return <div className="text-center text-smartfix-light">Загрузка данных пользователя...</div>;
    }

    return (
        <div>
            <h2 className="text-4xl font-bold text-smartfix-lightest mb-8">Профиль пользователя</h2>
            
            <div className="max-w-2xl mx-auto bg-smartfix-darker p-8 rounded-2xl border border-smartfix-dark">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            className="hidden"
                            accept="image/*"
                        />
                         <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {avatar ? (
                                <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-smartfix-dark" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-smartfix-dark flex items-center justify-center border-4 border-smartfix-dark">
                                    <UserIcon className="w-16 h-16 text-smartfix-light"/>
                                </div>
                            )}
                             <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-white font-semibold">Изменить</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-smartfix-light mb-2" htmlFor="name">Имя</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light"
                        />
                    </div>
                    <div>
                        <label className="block text-smartfix-light mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light"
                        />
                    </div>
                     <div>
                        <label className="block text-smartfix-light mb-2" htmlFor="phone">Телефон</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 (999) 000-00-00"
                            className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light"
                        />
                    </div>
                    
                    <div className="pt-4 flex items-center justify-between">
                         <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="bg-smartfix-light hover:bg-opacity-80 text-smartfix-darkest text-lg font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-smartfix-medium disabled:cursor-not-allowed"
                         >
                            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                        
                        <div className="text-right">
                            {success && <p className="text-green-400">{success}</p>}
                            {error && <p className="text-red-400">{error}</p>}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;