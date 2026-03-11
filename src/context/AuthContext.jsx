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

// Generate customer ID: GROCSRS-YYYY-XXXX
const generateCustomerId = () => {
    const year = new Date().getFullYear();
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    return `GROCSRS-${year}-${uniqueNum}`;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    // Fetch role from Firestore
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserRole(data.role || 'user');
                        setCustomerId(data.customerId || null);
                    } else {
                        // For new users, if email contains 'admin', default to admin (for easier setup)
                        const defaultRole = currentUser.email?.toLowerCase().includes('admin') ? 'admin' : 'user';
                        const newCustomerId = generateCustomerId();

                        await setDoc(doc(db, 'users', currentUser.uid), {
                            uid: currentUser.uid,
                            customerId: newCustomerId,
                            name: currentUser.displayName || '',
                            email: currentUser.email,
                            role: defaultRole,
                            createdAt: serverTimestamp()
                        });
                        setUserRole(defaultRole);
                        setCustomerId(newCustomerId);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
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
        const newCustomerId = generateCustomerId();
        await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            customerId: newCustomerId,
            name: name,
            email: email,
            role: 'user',
            createdAt: serverTimestamp()
        });
        setCustomerId(newCustomerId);
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
            const newCustomerId = generateCustomerId();
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                customerId: newCustomerId,
                name: result.user.displayName,
                email: result.user.email,
                role: 'user',
                createdAt: serverTimestamp()
            });
            setCustomerId(newCustomerId);
        } else {
            setCustomerId(userDoc.data().customerId || null);
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
        customerId,
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
