import { createContext, useState, useMemo, useCallback } from "react";

export const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {

            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
    });

    const setUserData = useCallback((userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    }, []);

    const clearUserData = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }, []);


    const value = useMemo(() => ({
        user,
        setUserData,
        clearUserData
    }), [user, setUserData, clearUserData]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};