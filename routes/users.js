const express = require('express')
const router = express.Router();
const admin = require('firebase-admin');
const { route } = require('./auth');
const db = admin.firestore();

router.post("/addToCart", async (req, res) => {

    const { userId, productId, qty } = req.body;

    if (!userId || !productId || !qty) {
        return res.status(400).json({ success: false, message: "Missing details" });
    }

    try {
        const cartQuery = await db.collection("cart").where("userId", "==", userId).limit(1).get();

        if (!cartQuery.empty) {
            //user already in the cart
            const cartDoc = cartQuery.docs[0];
            const cartRef = db.collection("cart").doc(cartDoc.id);
            let cartData = cartDoc.data();
            let items = cartData.items || [];

            //checking product already in the cart
            const productIndex = items.findIndex(item => item.productId === productId);

            if (productIndex !== -1) {
                //product exists, update qty
                items[productIndex].qty += qty;
            } else {
                //product doesn't exists
                items.push({ productId, qty });
            }

            await cartRef.update({ items });
        } else {
            //user data not in the cart
            await db.collection("cart").add({
                userId,
                items: [{ productId, qty }]
            })
        }

        return res.status(200).json({ success: true, message: "Product added to the cart" });

    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

});

router.post('/deleteFromCart', async (req, res) => {
    const { productId, userId } = req.body;

    if (!productId || !userId) {
        return res.status(400).json({ success: false, message: "Missing details." })
    }

    try {

        const cartQuery = await db.collection("cart").where("userId", "==", userId).limit(1).get();

        if (cartQuery.empty) {
            return res.status(404).json({ success: false, message: "Cart details not found." })
        }

        const cartDoc = cartQuery.docs[0];
        const cartRef = db.collection("cart").doc(cartDoc.id);

        let cartData = cartDoc.data();
        let items = cartData.items || [];

        const updatedItems = items.filter(item => item.productId !== productId);

        if (updatedItems.length == items.length) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        if (updatedItems.length === 0) {
            await cartRef.delete();
        } else {
            await cartRef.update({ items: updatedItems });
        }

        return res.status(200).json({ success: true, message: "Product removed from the cart successfully." });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
})



module.exports = router;