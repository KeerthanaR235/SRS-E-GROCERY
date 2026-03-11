// Wishlist Context - Manages wishlist state with Firestore sync for logged-in users
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sync wishlist with Firestore when user is logged in
    useEffect(() => {
        if (!user) {
            // Load from localStorage for guests
            const saved = localStorage.getItem('e-grocery-wishlist');
            setWishlistItems(saved ? JSON.parse(saved) : []);
            setLoading(false);
            return;
        }

        // Listen to Firestore wishlist document for logged-in users
        const unsubscribe = onSnapshot(
            doc(db, 'wishlists', user.uid),
            (docSnap) => {
                if (docSnap.exists()) {
                    setWishlistItems(docSnap.data().items || []);
                } else {
                    setWishlistItems([]);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching wishlist:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Save to Firestore or localStorage
    const saveWishlist = async (items) => {
        if (user) {
            try {
                await setDoc(doc(db, 'wishlists', user.uid), {
                    items,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error saving wishlist:', error);
            }
        } else {
            localStorage.setItem('e-grocery-wishlist', JSON.stringify(items));
        }
    };

    // Add item to wishlist
    const addToWishlist = (product) => {
        const exists = wishlistItems.find(item => item.id === product.id);
        if (exists) {
            toast('Already in your wishlist!', { icon: '💚' });
            return;
        }

        const newItems = [...wishlistItems, {
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
            imageURL: product.imageURL,
            category: product.category,
            stock: product.stock,
            rating: product.rating || 4.0,
            addedAt: new Date().toISOString()
        }];

        setWishlistItems(newItems);
        saveWishlist(newItems);
        toast.success(`${product.name} added to wishlist!`);
    };

    // Remove item from wishlist
    const removeFromWishlist = (productId) => {
        const newItems = wishlistItems.filter(item => item.id !== productId);
        setWishlistItems(newItems);
        saveWishlist(newItems);
        toast.success('Removed from wishlist');
    };

    // Toggle wishlist item
    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    // Check if product is in wishlist
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    // Clear entire wishlist
    const clearWishlist = async () => {
        setWishlistItems([]);
        if (user) {
            try {
                await setDoc(doc(db, 'wishlists', user.uid), { items: [], updatedAt: new Date().toISOString() });
            } catch (error) {
                console.error('Error clearing wishlist:', error);
            }
        } else {
            localStorage.removeItem('e-grocery-wishlist');
        }
    };

    // Get wishlist count
    const getWishlistCount = () => wishlistItems.length;

    const value = {
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
