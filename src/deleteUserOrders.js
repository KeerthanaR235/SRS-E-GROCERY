// Temporary script to delete all orders for a specific user
// Run: import this in main.jsx temporarily, then remove it

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase/firebase';
import { deleteAllUserOrders } from './services/orderService';

const runDelete = async () => {
    try {
        // Find the user by email in users collection
        const usersQuery = query(
            collection(db, 'users'),
            where('email', '==', 'keerthivani2329@gmail.com')
        );
        const usersSnap = await getDocs(usersQuery);

        if (usersSnap.empty) {
            console.error('❌ User not found');
            return;
        }

        const userId = usersSnap.docs[0].id;
        console.log(`Found user: ${userId}`);

        const count = await deleteAllUserOrders(userId);
        console.log(`✅ Successfully deleted ${count} orders for keerthivani2329@gmail.com`);
    } catch (error) {
        console.error('❌ Failed to delete orders:', error);
    }
};

runDelete();
