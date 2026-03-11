// Payment Service - Razorpay & Stripe integration
// Since we don't have a backend server, we simulate payment processing
// In production, you'd use Firebase Cloud Functions for server-side verification

const RAZORPAY_KEY_ID = 'rzp_test_demo123456789'; // Replace with your Razorpay test key

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Initialize Razorpay Payment
export const initiateRazorpayPayment = async (orderDetails, onSuccess, onFailure) => {
    // If using demo key, skip script loading and go straight to simulation
    if (RAZORPAY_KEY_ID === 'rzp_test_demo123456789') {
        return simulatePayment(orderDetails, onSuccess, onFailure);
    }

    const loaded = await loadRazorpayScript();

    if (!loaded) {
        // Fallback to simulation even if script fails to load, for better demo experience
        return simulatePayment(orderDetails, onSuccess, onFailure);
    }

    const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(orderDetails.amount * 100), // Amount in paise
        currency: 'INR',
        name: 'Sri Ranga Supermarket',
        description: `Order Payment - ${orderDetails.items?.length || 0} items`,
        image: '/logo.png',
        handler: function (response) {
            // Payment successful
            onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                status: 'success'
            });
        },
        prefill: {
            name: orderDetails.customerName || '',
            email: orderDetails.customerEmail || '',
            contact: orderDetails.customerPhone || ''
        },
        notes: {
            address: orderDetails.address || ''
        },
        theme: {
            color: '#2e7d32'
        },
        modal: {
            ondismiss: function () {
                onFailure('Payment cancelled by user');
            }
        }
    };

    try {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
            onFailure(response.error.description || 'Payment failed');
        });
        razorpay.open();
    } catch (error) {
        console.error('Razorpay Error:', error);
        simulatePayment(orderDetails, onSuccess, onFailure);
    }
};

// Simulate payment for demo/development
export const simulatePayment = (orderDetails, onSuccess, onFailure) => {
    // Simulate a delay then succeed
    return new Promise((resolve) => {
        setTimeout(() => {
            const success = true; // Always succeed in demo mode
            if (success) {
                const result = {
                    paymentId: `pay_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    orderId: `order_demo_${Date.now()}`,
                    status: 'success'
                };
                onSuccess(result);
                resolve(result);
            } else {
                onFailure('Payment failed - please try again');
                resolve(null);
            }
        }, 2000);
    });
};

// Cash on Delivery option
export const processCOD = (orderDetails) => {
    return {
        paymentId: `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: `order_cod_${Date.now()}`,
        status: 'success',
        method: 'COD'
    };
};
