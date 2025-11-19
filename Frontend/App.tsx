import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Role, User } from './types';
import { mockUsers, api } from './services/api';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

export const AuthContext = React.createContext<{
    user: User | null;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => void;
    register: (name: string, email: string, pass: string) => Promise<User | null>;
    updateUser: (user: User) => Promise<User | null>;
}>({
    user: null,
    login: async () => null,
    logout: () => {},
    register: async () => null,
    updateUser: async () => null,
});


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for a logged-in user session
        const storedUser = localStorage.getItem('smartfix_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, pass: string) => {
        const loggedInUser = await api.login(email, pass);
        if (loggedInUser) {
            setUser(loggedInUser);
            localStorage.setItem('smartfix_user', JSON.stringify(loggedInUser));
        }
        return loggedInUser;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('smartfix_user');
    }, []);

    const register = useCallback(async (name: string, email: string, pass: string) => {
        const newUser = await api.register(name, email, pass);
        // User is not logged in automatically anymore. They must verify their email first.
        return newUser;
    }, []);

    const updateUser = useCallback(async (updatedUserData: User) => {
        const updatedUser = await api.updateUser(updatedUserData);
        if(updatedUser) {
            setUser(updatedUser);
            localStorage.setItem('smartfix_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
    }, []);
    

    const authContextValue = useMemo(() => ({
        user,
        login,
        logout,
        register,
        updateUser,
    }), [user, login, logout, register, updateUser]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-smartfix-darkest">
                <div className="text-smartfix-lightest text-2xl">Загрузка...</div>
            </div>
        );
    }
    
    return (
        <AuthContext.Provider value={authContextValue}>
            <div className="min-h-screen bg-smartfix-darkest text-smartfix-lightest">
                {user ? <Dashboard /> : <LoginPage />}
            </div>
        </AuthContext.Provider>
    );
};

export default App;