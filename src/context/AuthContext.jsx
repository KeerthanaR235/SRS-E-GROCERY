// Auth Context - Manages authentication state across the app
import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Fetch role from Firestore
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role || 'user');
                } else {
                    // Create user document if it doesn't exist
                    await setDoc(doc(db, 'users', currentUser.uid), {
                        uid: currentUser.uid,
                        name: currentUser.displayName || '',
                        email: currentUser.email,
                        role: 'user',
                        createdAt: serverTimestamp()
                    });
                    setUserRole('user');
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Email/Password Signup
    const signup = async (email, password, name) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            name: name,
            email: email,
            role: 'user',
            createdAt: serverTimestamp()
        });
        return result;
    };

    // Email/Password Login
    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Google Sign In
    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                role: 'user',
                createdAt: serverTimestamp()
            });
        }
        return result;
    };

    // Logout
    const logout = async () => {
        return signOut(auth);
    };

    const value = {
        user,
        userRole,
        loading,
        signup,
        login,
        signInWithGoogle,
        logout,
        isAdmin: userRole === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
