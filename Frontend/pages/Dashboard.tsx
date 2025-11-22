import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Role } from '../types';
import RequestsPage from './RequestsPage';
import ServicesPage from './ServicesPage';
import ReportsPage from './ReportsPage';
import ProfilePage from './ProfilePage';
import SchedulePage from './SchedulePage';
import { ArrowRightOnRectangleIcon, WrenchScrewdriverIcon, UserIcon } from '../components/icons';

type Page = 'requests' | 'services' | 'reports' | 'profile' | 'calendar';

const Dashboard: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const [activePage, setActivePage] = useState<Page>('requests');

    const NavItem = ({ page, label }: { page: Page, label: string }) => (
        <button
            onClick={() => setActivePage(page)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                activePage === page 
                ? 'bg-smartfix-light text-smartfix-darkest' 
                : 'text-smartfix-lightest hover:bg-smartfix-dark'
            }`}
        >
            {label}
        </button>
    );

    const renderPage = () => {
        switch (activePage) {
            case 'requests':
                return <RequestsPage />;
            case 'services':
                return <ServicesPage />;
            case 'reports':
                 return <ReportsPage />;
            case 'profile':
                return <ProfilePage />;
            case 'calendar':
                return <SchedulePage />;
            default:
                return <RequestsPage />;
        }
    };
    
    if (!user) return null;

    return (
        <div className="flex flex-col min-h-screen bg-smartfix-darkest">
            {/* Header */}
            <header className="w-full bg-smartfix-darker p-3 flex justify-between items-center border-b border-smartfix-dark shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-8">
                     <div className="flex items-center">
                        <WrenchScrewdriverIcon className="w-8 h-8 text-smartfix-light" />
                        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Roboto', sans-serif" }}>SmartFix</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-2">
                        <NavItem page="requests" label="Заявки" />
                        <NavItem page="services" label="Услуги" />
                        {(user.role === Role.Admin || user.role === Role.Technician) && (
                            <NavItem page="reports" label="Отчёты" />
                        )}
                        {(user.role === Role.Technician) && (
                            <NavItem page="calendar" label="Мой график" />
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setActivePage('profile')}
                        className="flex items-center gap-3 p-1 rounded-full hover:bg-smartfix-dark transition-colors"
                        title="Профиль"
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover bg-smartfix-darker" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-smartfix-medium flex items-center justify-center shrink-0">
                                <UserIcon className="w-5 h-5 text-smartfix-lightest" />
                            </div>
                        )}
                        <p className="font-bold text-smartfix-lightest truncate hidden sm:block">{user.name}</p>
                    </button>

                    <button onClick={logout} title="Выход" className="p-2 rounded-lg text-smartfix-light hover:bg-red-900/50 transition-colors">
                        <ArrowRightOnRectangleIcon className="w-6 h-6"/>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default Dashboard;