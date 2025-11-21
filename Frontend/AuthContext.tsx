import { createContext } from 'react';
import { User } from './types';

export const AuthContext = createContext<{
    user: User | null;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => void;
    register: (name: string, email: string, pass: string) => Promise<User | null>;
}>({
    user: null,
    login: async () => null,
    logout: () => {},
    register: async () => null,
});
