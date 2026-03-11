// Product Service - Firestore CRUD operations for products
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
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';

const PRODUCTS_COLLECTION = 'products';

// Get all products (real-time)
export const subscribeToProducts = (callback) => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(products);
    });
};

// Get products by category
export const getProductsByCategory = async (category) => {
    const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('category', '==', category)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get single product
export const getProduct = async (productId) => {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

// Add a new product (Admin)
export const addProduct = async (productData, imageFile) => {
    let imageURL = '';
    if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(snapshot.ref);
    }

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        imageURL: imageURL || productData.imageURL || '',
        brand: productData.brand || '',
        quantity: productData.quantity || '',
        price: Number(productData.price),
        discount: Number(productData.discount || 0),
        stock: Number(productData.stock),
        rating: Number(productData.rating || 4),
        lowStockThreshold: Number(productData.lowStockThreshold || 10),
        createdAt: serverTimestamp()
    });

    return docRef.id;
};

// Update a product (Admin)
export const updateProduct = async (productId, productData, imageFile) => {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    let updateData = { ...productData };

    if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        updateData.imageURL = await getDownloadURL(snapshot.ref);
    }

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.discount !== undefined) updateData.discount = Number(updateData.discount);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.rating) updateData.rating = Number(updateData.rating);
    if (updateData.lowStockThreshold) updateData.lowStockThreshold = Number(updateData.lowStockThreshold);

    await updateDoc(docRef, updateData);
};

// Delete a product (Admin)
export const deleteProduct = async (productId) => {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
};

// Update stock after order (batch operation)
export const deductStock = async (items) => {
    const batch = writeBatch(db);

    for (const item of items) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId || item.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const data = productSnap.data();
            const currentStock = Number(data.stock || 0);
            const newStock = Math.max(0, currentStock - item.quantity);

            let updateData = { stock: newStock };

            // If using the multi-brand/variant structure, update the nested stock as well
            if (data.brands && data.brands.length > 0) {
                const newBrands = [...data.brands];
                // Update first brand's first variant for consistency if we don't have specific variant ID
                if (newBrands[0].variants && newBrands[0].variants.length > 0) {
                    const v = newBrands[0].variants[0];
                    newBrands[0].variants[0].stock = Math.max(0, Number(v.stock || 0) - item.quantity);
                    updateData.brands = newBrands;
                }
            }

            batch.update(productRef, updateData);
        }
    }

    await batch.commit();
};

// Restock items after cancellation (batch operation)
export const restockItems = async (items) => {
    const batch = writeBatch(db);

    for (const item of items) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId || item.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const data = productSnap.data();
            const currentStock = Number(data.stock || 0);
            const newStock = currentStock + item.quantity;

            let updateData = { stock: newStock };

            // Update nested stock if brand structure exists
            if (data.brands && data.brands.length > 0) {
                const newBrands = [...data.brands];
                if (newBrands[0].variants && newBrands[0].variants.length > 0) {
                    const v = newBrands[0].variants[0];
                    newBrands[0].variants[0].stock = Number(v.stock || 0) + item.quantity;
                    updateData.brands = newBrands;
                }
            }

            batch.update(productRef, updateData);
        }
    }

    await batch.commit();
};

// Delete ALL products from Firestore
export const deleteAllProducts = async () => {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const batch = writeBatch(db);
    snapshot.docs.forEach(docSnap => {
        batch.delete(doc(db, PRODUCTS_COLLECTION, docSnap.id));
    });
    await batch.commit();
    return snapshot.size; // returns how many were deleted
};

// Get low stock products
export const getLowStockProducts = async () => {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => product.stock <= (product.lowStockThreshold || 10));
};

// Seed dummy products
export const seedProducts = async () => {
    const existingProducts = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (existingProducts.size > 0) return; // Don't seed if products exist

    const dummyProducts = [
        {
            name: 'Fresh Tomatoes',
            category: 'Vegetables',
            price: 40,
            discount: 10,
            imageURL: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400',
            rating: 4.5,
            stock: 150,
            lowStockThreshold: 10,
            description: 'Farm fresh red tomatoes, perfect for salads and cooking.'
        },
        {
            name: 'Green Spinach',
            category: 'Vegetables',
            price: 30,
            discount: 0,
            imageURL: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
            rating: 4.3,
            stock: 80,
            lowStockThreshold: 10,
            description: 'Fresh organic spinach leaves, rich in iron and vitamins.'
        },
        {
            name: 'Onions (1 kg)',
            category: 'Vegetables',
            price: 35,
            discount: 5,
            imageURL: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
            rating: 4.0,
            stock: 200,
            lowStockThreshold: 20,
            description: 'Premium quality onions for everyday cooking.'
        },
        {
            name: 'Fresh Mangoes',
            category: 'Fruits',
            price: 120,
            discount: 15,
            imageURL: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
            rating: 4.8,
            stock: 60,
            lowStockThreshold: 10,
            description: 'Sweet Alphonso mangoes, handpicked from the finest orchards.'
        },
        {
            name: 'Bananas (1 dozen)',
            category: 'Fruits',
            price: 50,
            discount: 0,
            imageURL: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
            rating: 4.2,
            stock: 100,
            lowStockThreshold: 15,
            description: 'Ripe yellow bananas, great for snacking and smoothies.'
        },
        {
            name: 'Red Apples (500g)',
            category: 'Fruits',
            price: 90,
            discount: 20,
            imageURL: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
            rating: 4.6,
            stock: 45,
            lowStockThreshold: 10,
            description: 'Crisp and juicy red apples imported from Kashmir.'
        },
        {
            name: 'Amul Full Cream Milk (1L)',
            category: 'Dairy',
            price: 65,
            discount: 0,
            imageURL: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
            rating: 4.7,
            stock: 300,
            lowStockThreshold: 30,
            description: 'Pure and fresh full cream milk for your daily needs.'
        },
        {
            name: 'Paneer (200g)',
            category: 'Dairy',
            price: 80,
            discount: 10,
            imageURL: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
            rating: 4.4,
            stock: 50,
            lowStockThreshold: 10,
            description: 'Fresh cottage cheese, perfect for curries and snacks.'
        },
        {
            name: 'Curd (400g)',
            category: 'Dairy',
            price: 40,
            discount: 5,
            imageURL: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
            rating: 4.3,
            stock: 120,
            lowStockThreshold: 15,
            description: 'Thick and creamy curd made from pure milk.'
        },
        {
            name: 'Basmati Rice (5 kg)',
            category: 'Grains',
            price: 450,
            discount: 10,
            imageURL: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            rating: 4.6,
            stock: 75,
            lowStockThreshold: 10,
            description: 'Premium aged basmati rice with long grains and aromatic flavor.'
        },
        {
            name: 'Wheat Flour (10 kg)',
            category: 'Grains',
            price: 380,
            discount: 5,
            imageURL: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
            rating: 4.5,
            stock: 60,
            lowStockThreshold: 10,
            description: 'Whole wheat flour for making soft rotis and parathas.'
        },
        {
            name: 'Coca-Cola (2L)',
            category: 'Beverages',
            price: 85,
            discount: 15,
            imageURL: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
            rating: 4.1,
            stock: 200,
            lowStockThreshold: 20,
            description: 'Refreshing cola beverage for parties and gatherings.'
        },
        {
            name: 'Green Tea (25 bags)',
            category: 'Beverages',
            price: 150,
            discount: 20,
            imageURL: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400',
            rating: 4.4,
            stock: 90,
            lowStockThreshold: 10,
            description: 'Premium green tea bags for a healthy lifestyle.'
        },
        {
            name: 'Surf Excel Detergent (1 kg)',
            category: 'Household',
            price: 199,
            discount: 25,
            imageURL: 'https://images.unsplash.com/photo-1585441695325-21557f83e8c1?w=400',
            rating: 4.3,
            stock: 5,
            lowStockThreshold: 10,
            description: 'Powerful stain remover for sparkling clean clothes.'
        },
        {
            name: 'Dish Wash Liquid (500ml)',
            category: 'Household',
            price: 79,
            discount: 0,
            imageURL: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400',
            rating: 4.0,
            stock: 150,
            lowStockThreshold: 15,
            description: 'Lemon fresh dish wash liquid for sparkling dishes.'
        },
        {
            name: "Lay's Classic (150g)",
            category: 'Snacks',
            price: 50,
            discount: 10,
            imageURL: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
            rating: 4.2,
            stock: 0,
            lowStockThreshold: 10,
            description: 'Classic salted potato chips for snack time.'
        },
        {
            name: 'Dark Chocolate (100g)',
            category: 'Snacks',
            price: 120,
            discount: 15,
            imageURL: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',
            rating: 4.7,
            stock: 70,
            lowStockThreshold: 10,
            description: 'Rich and smooth dark chocolate with 70% cocoa.'
        },
        {
            name: 'Mixed Nuts (250g)',
            category: 'Snacks',
            price: 250,
            discount: 20,
            imageURL: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
            rating: 4.5,
            stock: 40,
            lowStockThreshold: 10,
            description: 'Premium mix of almonds, cashews, walnuts, and pistachios.'
        },
        {
            name: 'Potatoes (1 kg)',
            category: 'Vegetables',
            price: 25,
            discount: 0,
            imageURL: 'https://images.unsplash.com/photo-1518977676601-b53f82ber40?w=400',
            rating: 4.1,
            stock: 250,
            lowStockThreshold: 25,
            description: 'Fresh locally grown potatoes for all your recipes.'
        },
        {
            name: 'Orange Juice (1L)',
            category: 'Beverages',
            price: 110,
            discount: 10,
            imageURL: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
            rating: 4.3,
            stock: 8,
            lowStockThreshold: 10,
            description: '100% natural orange juice with no added sugar.'
        },
        {
            name: 'Dishwash Gel (500ml)',
            category: 'Household',
            price: 95,
            discount: 5,
            imageURL: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
            rating: 4.4,
            stock: 120,
            lowStockThreshold: 15,
            description: 'Tough on stains, gentle on hands. Fresh lime scent.'
        },
        {
            name: 'Detergent Powder (1kg)',
            category: 'Household',
            price: 180,
            discount: 10,
            imageURL: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400',
            rating: 4.6,
            stock: 85,
            lowStockThreshold: 10,
            description: 'Advance laundry detergent for sparkling clean clothes.'
        },
        {
            name: 'Floor Cleaner (1L)',
            category: 'Household',
            price: 150,
            discount: 15,
            imageURL: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?w=400',
            rating: 4.5,
            stock: 50,
            lowStockThreshold: 10,
            description: 'Kills 99.9% germs and leaves a pleasant citrus fragrance.'
        }
    ];

    for (const product of dummyProducts) {
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
            ...product,
            createdAt: serverTimestamp()
        });
    }
};
