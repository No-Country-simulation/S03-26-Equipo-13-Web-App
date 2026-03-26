import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, refreshToken: string, user: User) => void;
    logout: () => void;
    initialize: () => void; //Para hidratacion
}

export const useAuthStore = create<AuthState>()(
    devtools((set) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,

        // Función para recuperar la sesión 
        initialize: () => {

            if (typeof window === 'undefined') return;

            const savedToken = localStorage.getItem('access_token');
            const savedRefresh = localStorage.getItem('refresh_token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                set({
                    token: savedToken,
                    refreshToken: savedRefresh,
                    user: JSON.parse(savedUser),
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        },

        login: (token, refreshToken, user) => {
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            set({ token, refreshToken, user, isAuthenticated: true, isLoading: false });
        },

        logout: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');

            set({ token: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
        }
    }), { name: "AuthStore" }));
