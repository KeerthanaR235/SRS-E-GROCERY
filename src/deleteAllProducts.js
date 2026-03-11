// Temporary script to delete all products from Firestore
// Run this by importing it in main.jsx or via browser console

import { deleteAllProducts } from './services/productService';

const runDelete = async () => {
    try {
        const count = await deleteAllProducts();
        console.log(`✅ Successfully deleted ${count} products from all categories!`);
    } catch (error) {
        console.error('❌ Failed to delete products:', error);
    }
};

runDelete();
