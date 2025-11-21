import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User } from './types';
import { login, register } from './services/api';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import { AuthContext } from './AuthContext';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('smartfix_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const loginUser = useCallback(async (email: string, password: string) => {
        try {
            const authResponse = await login(email, password);
            if (authResponse) {
                const loggedInUser: User = {
                    id: authResponse.id,
                    name: authResponse.name,
                    email: authResponse.email,
                    role: authResponse.role,
                    isVerified: authResponse.isVerified,
                    phone: authResponse.phone,
                    avatar: authResponse.avatar,
                    token: authResponse.token, 
                };
                setUser(loggedInUser);
                localStorage.setItem('smartfix_user', JSON.stringify(loggedInUser));
                localStorage.setItem('token', authResponse.token); 
                return loggedInUser;
            }
            return null;
        } catch (error) {
            console.error("Login error:", error);
            return null;
        }
    }, []);

    const logoutUser = useCallback(() => {
        setUser(null);
        localStorage.removeItem('smartfix_user');
        localStorage.removeItem('token');
    }, []);

    const registerUserFn = useCallback(async (name: string, email: string, password: string, phone?: string) => {
        try {
            const newUser = await register(name, email, password, phone);
            return newUser;
        } catch (error) {
            console.error("Register error:", error);
            return null;
        }
    }, []);

    const authContextValue = useMemo(() => ({
        user,
        login: loginUser,
        logout: logoutUser,
        register: registerUserFn,
    }), [user, loginUser, logoutUser, registerUserFn]);

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
