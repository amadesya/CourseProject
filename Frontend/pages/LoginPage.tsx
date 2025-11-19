import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { WrenchScrewdriverIcon, DocumentTextIcon, MagnifyingGlassIcon, ChartPieIcon, SparklesIcon } from '../components/icons';
import Modal from '../components/Modal';
import { Service } from '../types';
import { api } from '../services/api';

type RegistrationStep = 'form' | 'pending_verification' | 'verified';

const LoginPage: React.FC = () => {
    const { login, register } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // State for registration flow
    const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('form');
    const [verificationMessage, setVerificationMessage] = useState('');

    const [services, setServices] = useState<Service[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoadingServices(true);
            try {
                const data = await api.getServices();
                setServices(data);
            } catch (error) {
                console.error("Failed to fetch services:", error);
            } finally {
                setIsLoadingServices(false);
            }
        };
        fetchServices();
    }, []);
    
    const resetFormState = () => {
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setRegistrationStep('form');
        setVerificationMessage('');
    }
    
    const openLoginModal = () => {
        resetFormState();
        setIsLoginView(true);
        setIsModalOpen(true);
    }
    
    const closeModal = () => {
        setIsModalOpen(false);
    }

    const handleVerify = async () => {
        setIsLoading(true);
        setError('');
        try {
            const success = await api.verifyEmail(email);
            if (success) {
                setRegistrationStep('verified');
                setVerificationMessage('Аккаунт успешно подтвержден! Теперь вы можете войти.');
                setTimeout(() => {
                    setIsLoginView(true);
                    setRegistrationStep('form'); // Reset for next time
                }, 3000);
            } else {
                setError('Не удалось подтвердить email. Попробуйте снова.');
            }
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка при подтверждении.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isLoginView) {
                await login(email, password);
                closeModal();
            } else { // Registration
                const user = await register(name, email, password);
                if (!user) {
                    setError('Пользователь с таким email уже существует.');
                } else {
                    // Don't close modal, show verification step
                    setRegistrationStep('pending_verification');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка. Попробуйте снова.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (userEmail: string) => {
        setError('');
        setIsLoading(true);
        try {
            // In a real app, you'd use a more secure method than hardcoding a password.
            // For this mock API, we assume a common password for test users.
            await login(userEmail, 'password');
            closeModal();
        } catch (err: any) {
            setError(err.message || 'Быстрый вход не удался.');
        } finally {
            setIsLoading(false);
        }
    };


    const HowItWorksCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
        <div className="bg-smartfix-dark p-6 rounded-xl border border-smartfix-medium text-center transform hover:-translate-y-2 transition-transform duration-300">
            <div className="mx-auto bg-smartfix-medium w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-3xl font-bold" style={{ fontFamily: "'Roboto', sans-serif" }}>{title}</h3>
            <p className="text-smartfix-light">{description}</p>
        </div>
    );
    
    const renderAuthContent = () => {
        if (!isLoginView) { // Registration View
             switch (registrationStep) {
                case 'pending_verification':
                    return (
                        <div className="text-center p-4">
                            <h3 className="text-2xl font-bold text-smartfix-lightest mb-3">Подтвердите ваш Email</h3>
                            <p className="text-smartfix-light mb-6">Мы отправили ссылку для подтверждения на <span className="font-semibold text-smartfix-lightest">{email}</span>. Пожалуйста, проверьте свою почту.</p>
                            <div className="text-sm text-gray-400 mb-4">(Для демонстрации, нажмите кнопку ниже, чтобы имитировать переход по ссылке)</div>
                            <button
                                onClick={handleVerify}
                                disabled={isLoading}
                                className="w-full bg-smartfix-light text-smartfix-darkest font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-smartfix-medium"
                            >
                                {isLoading ? 'Подтверждение...' : 'Подтвердить аккаунт'}
                            </button>
                             {error && <p className="text-red-400 mt-4">{error}</p>}
                        </div>
                    );
                case 'verified':
                     return (
                        <div className="text-center p-4">
                             <h3 className="text-2xl font-bold text-green-400 mb-3">Email подтвержден!</h3>
                             <p className="text-smartfix-light">{verificationMessage}</p>
                        </div>
                     );
                case 'form':
                default:
                    return (
                        <form onSubmit={handleSubmit} className="space-y-4">
                             <div>
                                <label className="block text-smartfix-light mb-1">Имя</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                            </div>
                            <div>
                                <label className="block text-smartfix-light mb-1">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                            </div>
                            <div>
                                <label className="block text-smartfix-light mb-1">Пароль</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <div className="pt-2">
                                <button type="submit" disabled={isLoading} className="w-full bg-smartfix-light text-smartfix-darkest font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-smartfix-medium">
                                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                                </button>
                            </div>
                        </form>
                    );
            }
        }

        // Login View
        return (
            <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-smartfix-light mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                    </div>
                    <div>
                        <label className="block text-smartfix-light mb-1">Пароль</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-smartfix-dark p-3 rounded-lg border border-smartfix-medium focus:outline-none focus:ring-2 focus:ring-smartfix-light" />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="pt-2">
                        <button type="submit" disabled={isLoading} className="w-full bg-smartfix-light text-smartfix-darkest font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-smartfix-medium">
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t border-smartfix-dark">
                    <h4 className="text-center text-sm text-smartfix-light mb-4">Быстрый вход для тестирования</h4>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => handleQuickLogin('admin@smartfix.com')}
                            className="bg-smartfix-medium text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-80 transition-colors"
                        >
                            Админ
                        </button>
                        <button
                            onClick={() => handleQuickLogin('ivan@smartfix.com')}
                            className="bg-smartfix-medium text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-80 transition-colors"
                        >
                            Мастер
                        </button>
                        <button
                            onClick={() => handleQuickLogin('anna@client.com')}
                            className="bg-smartfix-medium text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-80 transition-colors"
                        >
                            Клиент
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                <div className="flex items-center">
                    <WrenchScrewdriverIcon className="w-8 h-8 text-smartfix-lightest" />
                    <span className="text-2xl font-bold ml-2 text-smartfix-lightest">SmartFix</span>
                </div>
                <button
                    onClick={openLoginModal}
                    className="bg-smartfix-dark hover:bg-smartfix-medium border border-smartfix-dark text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Войти
                </button>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-24">
                 <h1 className="text-5xl md:text-7xl font-black text-smartfix-lightest mb-4">Ваша техника в надежных руках</h1>
                <p className="text-lg md:text-xl text-smartfix-light max-w-3xl mb-8">
                    Оптимизируйте процесс ремонта с нашей системой. Отслеживайте заявки, взаимодействуйте с мастерами и получайте уведомления в реальном времени.
                </p>
                 <button onClick={openLoginModal} className="bg-smartfix-lightest text-smartfix-darkest font-bold py-4 px-10 rounded-lg text-lg hover:scale-105 transition-transform">
                    Создать заявку
                </button>
            </main>

            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                     <h2 className="text-4xl font-bold text-center text-smartfix-lightest mb-12">Как это работает?</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <HowItWorksCard icon={<DocumentTextIcon className="w-8 h-8 text-smartfix-lightest"/>} title="1. Создайте заявку" description="Заполните простую форму, описав проблему с вашим устройством." />
                        <HowItWorksCard icon={<MagnifyingGlassIcon className="w-8 h-8 text-smartfix-lightest"/>} title="2. Диагностика" description="Наш мастер проведет диагностику и определит причину неисправности." />
                        <HowItWorksCard icon={<ChartPieIcon className="w-8 h-8 text-smartfix-lightest"/>} title="3. Отслеживание" description="Следите за статусом ремонта в вашем личном кабинете в реальном времени." />
                        <HowItWorksCard icon={<SparklesIcon className="w-8 h-8 text-smartfix-lightest"/>} title="4. Готово!" description="Получите уведомление о готовности и заберите ваше исправное устройство." />
                     </div>
                </div>
            </section>
            
            <section className="py-20 px-4 bg-smartfix-darker">
                 <div className="max-w-4xl mx-auto">
                     <h2 className="text-4xl font-bold text-center text-smartfix-lightest mb-12">Наши услуги</h2>
                     {isLoadingServices ? <p className="text-center text-smartfix-light">Загрузка услуг...</p> : (
                        <div className="bg-smartfix-dark rounded-xl border border-smartfix-medium shadow-lg">
                            {services.map((service, index) => (
                                <div key={service.id} className={`p-6 flex justify-between items-center ${index < services.length - 1 ? 'border-b border-smartfix-medium' : ''}`}>
                                    <div>
                                        <h3 className="text-lg font-semibold text-smartfix-lightest">{service.name}</h3>
                                        <p className="text-sm text-smartfix-light">{service.description}</p>
                                    </div>
                                    <p className="text-lg font-bold text-smartfix-lightest whitespace-nowrap ml-4">{service.price.toLocaleString('ru-RU')} ₽</p>
                                </div>
                            ))}
                        </div>
                     )}
                 </div>
            </section>

             <footer className="my-heading py-6 text-center text-smartfix-lightest border-t border-smartfix-dark mt-auto">
                © 2025 СмартФикс. Все права защищены.
            </footer>

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Вход в личный кабинет">
                <div className="mb-6 border-b border-smartfix-dark flex">
                    <button onClick={() => { setIsLoginView(true); resetFormState(); }} className={`flex-1 pb-3 text-center font-semibold transition-colors ${isLoginView ? 'text-smartfix-lightest border-b-2 border-smartfix-lightest' : 'text-smartfix-light'}`}>
                        Вход
                    </button>
                    <button onClick={() => { setIsLoginView(false); resetFormState(); }} className={`flex-1 pb-3 text-center font-semibold transition-colors ${!isLoginView ? 'text-smartfix-lightest border-b-2 border-smartfix-lightest' : 'text-smartfix-light'}`}>
                        Регистрация
                    </button>
                </div>
                {renderAuthContent()}
            </Modal>
        </div>
    );
};

export default LoginPage;