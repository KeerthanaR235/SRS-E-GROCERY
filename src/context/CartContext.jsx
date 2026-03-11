// Cart Context - Manages shopping cart state with stock validation
import { createContext, useContext, useState, useEffect } from 'react';
import { parseQuantityToKg } from '../services/productService';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('e-grocery-cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist cart to localStorage
    useEffect(() => {
        localStorage.setItem('e-grocery-cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Calculate max cart items based on stock (for Vegetables, stock is in kg)
    const getMaxItems = (product) => {
        if (product.category === 'Vegetables') {
            const kgPerUnit = parseQuantityToKg(product.selectedQuantity || product.quantity);
            if (kgPerUnit && kgPerUnit > 0) {
                return Math.floor(product.stock / kgPerUnit);
            }
        }
        return product.stock;
    };

    // Add item to cart with stock check
    const addToCart = (product) => {
        if (product.stock <= 0) {
            toast.error('This product is out of stock!');
            return;
        }

        const maxItems = getMaxItems(product);
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= maxItems) {
                    const stockLabel = product.category === 'Vegetables' ? `${product.stock} kg` : `${product.stock} items`;
                    toast.error(`Only ${stockLabel} available in stock!`);
                    return prev;
                }
                toast.success(`${product.name} quantity updated!`);
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            toast.success(`${product.name} added to cart!`);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // Update item quantity
    const updateQuantity = (productId, newQuantity, maxStock, category, variantQty) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        let maxItems = maxStock;
        if (category === 'Vegetables') {
            const kgPerUnit = parseQuantityToKg(variantQty);
            if (kgPerUnit && kgPerUnit > 0) {
                maxItems = Math.floor(maxStock / kgPerUnit);
            }
        }
        if (newQuantity > maxItems) {
            const stockLabel = category === 'Vegetables' ? `${maxStock} kg` : `${maxStock} items`;
            toast.error(`Only ${stockLabel} available in stock!`);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
        toast.success('Item removed from cart');
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('e-grocery-cart');
    };

    // Calculate totals
    const getSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const discountedPrice = item.price - (item.price * (item.discount || 0) / 100);
            return total + (discountedPrice * item.quantity);
        }, 0);
    };

    const getGST = () => {
        return getSubtotal() * 0.05; // 5% GST
    };

    const getTotal = () => {
        return getSubtotal() + getGST();
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getGST,
        getTotal,
        getCartCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
