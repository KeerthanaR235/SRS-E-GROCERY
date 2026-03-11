// Order Service - Firestore operations for orders
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { deductStock } from './productService';

const ORDERS_COLLECTION = 'orders';

// Create a new order
export const createOrder = async (orderData) => {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...orderData,
        orderStatus: 'placed',
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

// Create order and deduct stock (atomic-like operation)
export const createOrderAndDeductStock = async (userId, cartItems, paymentId, paymentStatus, totalAmount, customerInfo = {}, paymentMethod = 'online') => {
    // Validate stock availability first
    for (const item of cartItems) {
        if (item.quantity > item.stock) {
            throw new Error(`${item.name} has insufficient stock. Available: ${item.stock}`);
        }
    }

    // Create the order
    const orderData = {
        userId,
        items: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            discount: item.discount || 0,
            quantity: item.quantity,
            imageURL: item.imageURL || ''
        })),
        totalAmount,
        paymentId: paymentId || '',
        paymentStatus: paymentStatus || 'pending',
        paymentMethod: paymentMethod || 'online',
        orderStatus: 'placed',
        customerInfo: {
            name: customerInfo.fullName || '',
            phone: customerInfo.phone || '',
            email: customerInfo.email || '',
            address: `${customerInfo.street}, ${customerInfo.city}, ${customerInfo.state} - ${customerInfo.pincode}`
        }
    };

    const orderId = await createOrder(orderData);

    // Deduct stock only if payment is successful
    if (paymentStatus === 'success') {
        await deductStock(cartItems);
    }

    return orderId;
};

// Get orders by user ID
export const getUserOrders = (userId, callback) => {
    const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(orders);
    });
};

// Get all orders (Admin)
export const subscribeToAllOrders = (callback) => {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(orders);
    });
};

// Update order status (Admin)
export const updateOrderStatus = async (orderId, newStatus) => {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { orderStatus: newStatus });
};

// Get order by ID
export const getOrder = async (orderId) => {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

// Get all orders (for reports)
export const getAllOrders = async () => {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
