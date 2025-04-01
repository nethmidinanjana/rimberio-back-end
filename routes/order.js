const express = require('express')
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.post('/createOrder', async (req, res) => {
    const { orderId, userId, orderData, orderItems } = req.body;

    if (!orderId || !orderData || !orderItems || !userId) {
        return res.status(404).json({ success: false, message: "Error creating order" });
    }

    try {
        //save order data
        await db.collection("order").doc(orderId).set(orderData);

        //delete cart items
        const cartQuerySnapshot = await db.collection('cart').where('userId', '==', userId).get();

        const batch = db.batch();

        cartQuerySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        })

        //updated product quanitites
        orderItems.forEach((item) => {
            const productRef = db.collection("product").doc(item.productId);
            batch.update(productRef, {
                qty: admin.firestore.FieldValue.increment(-item.qty)
            });
        });

        await batch.commit();

        return res.status(200).json({ success: true, message: "Order placed successfully" });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
})

router.post("/payhere-notify", (req, res) => {
    const merchantId = req.body.merchant_id;
    const orderId = req.body.order_id;
    const statusCode = req.body.status_code;
    const amount = req.body.payhere_amount;
    const paymentMethod = req.body.method;
    const customMessage1 = req.body.custom_1; 
    const customMessage2 = req.body.custom_2;

    console.log(`Received PayHere notification for Order ID: ${orderId}`);
    console.log(`Status Code: ${statusCode}, Amount: ${amount}, Method: ${paymentMethod}`);
    console.log(`Custom Messages: ${customMessage1}, ${customMessage2}`);

    if (statusCode === "2") {
        console.log(`Payment successful for Order ID: ${orderId}`);

    } else {
        console.log(`Payment failed or pending for Order ID: ${orderId}`);
    }

    res.sendStatus(200);
});

module.exports = router;