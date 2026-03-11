// Order Service - Firestore operations for orders
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
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

// Generate custom order ID: GRY-2026Mar11-45673
const generateDisplayOrderId = () => {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateStr = `${now.getFullYear()}${months[now.getMonth()]}${String(now.getDate()).padStart(2, '0')}`;
    const uniqueNum = String(Math.floor(10000 + Math.random() * 90000));
    return `GRY-${dateStr}-${uniqueNum}`;
};

// Create a new order
export const createOrder = async (orderData) => {
    const displayOrderId = generateDisplayOrderId();
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...orderData,
        displayOrderId,
        orderStatus: 'placed',
        createdAt: serverTimestamp()
    });
    return { id: docRef.id, displayOrderId };
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
            productId: item.originalId || item.id,
            name: item.name,
            price: item.price,
            discount: item.discount || 0,
            quantity: item.quantity,
            imageURL: item.imageURL || '',
            selectedBrand: item.selectedBrand || '',
            selectedQuantity: item.selectedQuantity || ''
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
            customerId: customerInfo.customerId || '',
            address: `${customerInfo.street}, ${customerInfo.city}, ${customerInfo.state} - ${customerInfo.pincode}`
        }
    };

    const result = await createOrder(orderData);

    // Deduct stock only if payment is successful
    if (paymentStatus === 'success') {
        await deductStock(cartItems);
    }

    return result;
};

// Get orders by user ID
export const getUserOrders = (userId, callback, onError) => {
    const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Sort client-side: newest first
        orders.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
        });
        callback(orders);
    }, (error) => {
        console.error('getUserOrders error:', error);
        if (onError) onError(error);
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

// Hide order from admin view (order still visible to customer)
export const hideOrderFromAdmin = async (orderId) => {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { adminHidden: true });
};

// Get all orders (for reports)
export const getAllOrders = async () => {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Delete all orders for a specific user
export const deleteAllUserOrders = async (userId) => {
    const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    let count = 0;
    for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, ORDERS_COLLECTION, docSnap.id));
        count++;
    }
    return count;
};
