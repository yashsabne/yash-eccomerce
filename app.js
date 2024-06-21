
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { config, configDotenv } = require('dotenv');
const app = express();
const axios = require('axios');
const dayjs = require('dayjs');
const Razorpay = require('razorpay');
const { type } = require('os');
const PORT = process.env.PORT || 3000;


// Set up view engine (assuming you're using EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)

const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
    phone: Number,
    nameU: String,
    dob: String,
    firstLetterOfUser: String,
    googleId: String,
    nameGoogle: String,
    cart: [{ type: Object, ref: 'Product' }],
    address: [{ type: Object, ref: 'Address' }],
    orders: [{
        address: {
            type: Object,
            required: true
        },
        deliveringProducts: {
            type: Array,
            required: true
        },
        paymentMethodSelected: {
            type: Boolean,
            required: true
        },
        selectedPaymentMethod: {
            type: String,
            default: null
        },
        paymentDone: {
            type: Boolean,
            default: false
        },
        DateAndTimeHere: {
            type: String,
            required: true
        },
        total: {
            type: Number
        }

    }]
}));

const DeliverySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const Delivery = mongoose.model('Delivery', DeliverySchema);

app.use(session({
    secret: 'yourdfijsukghruheuuklsfdmcskksksfshfbsbhdhdebfhsdhz',
    resave: false,
    saveUninitialized: true
}));



app.use(passport.initialize());
app.use(passport.session());

// Function to read products from JSON file
const productPath = path.join(__dirname, 'products.json');
const productData = fs.readFileSync(productPath, 'utf8');

const product = JSON.parse(productData);

app.get('/products', (req, res) => {
    res.json(product);
});

app.get('/', async (req, res) => {

    axios.get('https://api.ipify.org?format=json')
    .then(response => {
      const publicIp = response.data.ip;
      console.log('Public IP address:', publicIp);

      async function getIpInfo (){
        // Set endpoint and your access key
        const ip = publicIp;
        const accessKey = process.env.ACCESS_KEYIP;
        const url = 'https://apiip.net/api/check?ip='+ip+'&accessKey='+accessKey; 

        // Make a request and store the response
        const response = await axios.get(url);
        const result = response.data;

        // Output the "code" value inside "currency" object
        console.log(result.city);
        res.render('index',{cityOfDelivery:result.city}); 
      };

      getIpInfo();

    });
 
});

app.get('/login', (req, res) => {
    res.render("login")
})

 

app.get("/register", (req, res) => {
    res.render("register")
})

//=====================POST REQUEST FOR REGISTER DONE SUCCESSFULLY==============//

app.post('/send-email-otp', async (req, res) => {
    try {
        const username = req.body.username;

        const otp = (Math.random() * 10000).toFixed(0);
        req.session.otp = otp;

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.USEROTP,
                pass: process.env.PASSOTP
            }
        });

        const mailOptions = {
            from: 'yashsabne39@gmail.com',
            to: username,
            subject: `OTP for registration`,
            html: `<p>Hello ${username},</p><p>Nice to see you here. Here is your OTP for login: <strong>${otp}</strong></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).send('Email sent successfully');
            }
        });
    } catch (e) {
        console.log("Error occurred", e);
        res.status(500).json({ error: 'Error sending OTP' });
    }
});


app.post("/verify-otp", (req, res) => {
    const { username, otp } = req.body;

    // Check if the OTP matches the one stored in the session
    if (otp === req.session.otp) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});


app.post("/register", async function (req, res) {
    const username = req.body.username;
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        phone: req.body.phone,
        nameU: req.body.fullName,
        dob: req.body.dob,
        otp: req.body.otp,
        firstLetterOfUser: username.charAt(0)

    });

    try {
        const username = req.body.username;
        const foundUser = await User.findOne({ username });

        if (foundUser) {
            return res.send("User already exists");
        }
        if (req.body.otp !== req.session.otp) {
            return res.send("Incorrect OTP");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        newUser.password = hashedPassword;

        await newUser.save();
        res.render("login");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { errorMessage: "Internal Server Error" });
    }
});
//=====================POSTT REQUEST FOR login DONE SUCCESSFULLY==============//

 
app.post("/login", async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const foundUser = await User.findOne({ username });

        if (foundUser) {
            const passwordMatch = await bcrypt.compare(password, foundUser.password);

            if (passwordMatch) {
                // Set the user's ID in the session and save the session
                req.session.userId = foundUser._id;
                req.session.save();

                const userId = req.session.userId;

                const user = await User.findById(userId);
                // Clear the previous timeout if it exists

                const userCartNumber = user.cart.length;
                const userfirstLetter = user.firstLetterOfUser;

                res.render("index", { cartLength: userCartNumber, firstLetterOfUser: userfirstLetter });

            } else {
                // Incorrect password
                res.render("login", { errorMessage: "Incorrect username or password" });
            }
        } else {
            // User not found
            res.render("login", { errorMessage: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }

        res.redirect('/login');
    });
});



function readProductsFromFile() {
    const productsData = fs.readFileSync('products.json');
    return JSON.parse(productsData);
}

app.post("/add-to-cart", async function (req, res) {
    try {
        const productId = req.body.productId;
        const productName = req.body.productName;
        const productPrice = req.body.productPrice;
        const productImage = req.body.productImage;
        const productRating = req.body.productRating;
        const productCategory = req.body.productCategory;
        const quantityOfItem = req.body.quantityOfItem;

        console.log(quantityOfItem)

        const userId = req.session.userId;

        if (!userId) {
            return res.render('login');
        }
        // Read products from JSON file
        const products = readProductsFromFile();

        // Find the product with the given productId
        const product = products.find(p => p.id === productId);

        if (!product) {
            return console.log("product added")
        }

        // Add the productId to the user's cart
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found. Please login into your account");
        }
        user.cart.push(
            {
                productId,
                productName,
                productPrice,
                productRating,
                productImage,
                productCategory,
                quantityOfItem
            });

        await user.save();

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/cart", async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.render('loginCart');
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.render('loginCart');

        }        
        const cartIsEmpty = user.cart.length === 0;

        const usercartArrayNumber = user.cart.length

        const cartItemsQuantity = []

        user.cart.forEach((cartQuantitty) => {
            cartItemsQuantity.push(cartQuantitty.quantityOfItem)
        })

        let cartItemsAreHere = [];

        for (let i = 0; i < usercartArrayNumber; i++) {
            cartItemsAreHere.push(user.cart[i]);
        }

        //  making the Array for saving the prices

        let cartItemPrices = []

        user.cart.forEach(item => {
            if (item.productPrice) {
                cartItemPrices.push(item.productPrice);
            }
        });



        const totalSumWithQunatityAdd = []

        for (let i = 0; i < cartItemsQuantity.length; i++) {
            totalSumWithQunatityAdd.push(cartItemsQuantity[i] * cartItemPrices[i])

        }

        let sum = 0;
        totalSumWithQunatityAdd.forEach(itemPrices => {
            sum += itemPrices
        });
        const totalSumBeforeShipping = sum //before shiping

        let shipppingCharges;

        if (totalSumBeforeShipping > 500) {
            shipppingCharges = 0;
        }
        else if (totalSumBeforeShipping === 0) {
            shipppingCharges = 0;
        }
        else {
            shipppingCharges = 40;
        }

        const totalSumAfterShipping = parseInt(parseInt(totalSumBeforeShipping) + parseInt(shipppingCharges)).toFixed(2);
 
        let taxesOnProducts;

        if (totalSumAfterShipping < 900) {
            taxesOnProducts = 0
        }
        else {
            taxesOnProducts = parseInt((5 / 100) * totalSumAfterShipping)
        } 
        const totalOrder = (parseInt(totalSumAfterShipping) + parseInt(taxesOnProducts)).toFixed(2);
        const userfirstLetter = user.firstLetterOfUser;

    

        res.render("cart", {
            cartItems: user.cart,
            cartIsEmpty: cartIsEmpty,
            cartItemNumber: usercartArrayNumber,
            totalSum: totalSumAfterShipping,
            shipppingCharges: shipppingCharges,
            taxesOnProducts: taxesOnProducts,
            totalAfterTax: totalOrder,
            firstLetterOfUser: userfirstLetter,
            totalSumBeforeShipping: totalSumBeforeShipping 
        });

    

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.post("/delete-product", async (req, res) => {
    try {
        const productIdToDelete = parseInt(req.body.productId); // Get the ID of the product to delete
        const userId = req.session.userId; // Get the ID of the logged-in user

        if (!userId) {
            return res.render('loginCart');
        }

        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return res.render('loginCart');
        }

        // Remove the product from the user's cart
        user.cart = user.cart.filter(item => item.productId !== parseInt(productIdToDelete));

        // Save the updated user document
        await user.save();
 
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/delete-product", async (req, res) => {
    try {
        const productIdToDelete = parseInt(req.body.productId); // Get the ID of the product to delete

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/address", async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.send("User not found.");
            return;
        }

        const address = user.address;
     

        if (!address) {
            res.send("Address not found for the user.");
            return;
        }



        const usercartArrayNumber = user.cart.length

        const cartItemsQuantity = []

        user.cart.forEach((cartQuantitty) => {
            cartItemsQuantity.push(cartQuantitty.quantityOfItem)
        })

        // console.log(cartItemsQuantity)

        //calculating the total before doing further process

        let cartItemsAreHere = [];

        for (let i = 0; i < usercartArrayNumber; i++) {
            cartItemsAreHere.push(user.cart[i]);
        }

        //  making the Array for saving the prices

        let cartItemPrices = []

        cartItemsAreHere.forEach(item => {

            cartItemPrices.push(item.productPrice)

        });

        const totalSumWithQunatityAdd = []

        for (let i = 0; i < cartItemsQuantity.length; i++) {
            totalSumWithQunatityAdd.push(cartItemsQuantity[i] * cartItemPrices[i])

        }

        //  console.log(cartItemPrices)

        let sum = 0;
        totalSumWithQunatityAdd.forEach(itemPrices => {
            sum += itemPrices
        });
        const totalSumBeforeShipping = sum //before shiping



        let shipppingCharges;

        if (totalSumBeforeShipping > 500) {
            shipppingCharges = 0;
        }
        else {
            shipppingCharges = 40;
        }

        const totalSumAfterShipping = parseInt(parseInt(totalSumBeforeShipping) + parseInt(shipppingCharges)).toFixed(2);
 
        let taxesOnProducts;

        if (totalSumAfterShipping < 900) {
            taxesOnProducts = 0
        }
        else {
            taxesOnProducts = parseInt((5 / 100) * totalSumAfterShipping)
        }
       

        const totalOrder = (parseInt(totalSumAfterShipping) + parseInt(taxesOnProducts)).toFixed(2);

        const userArrayBuying = user.cart;

        const userfirstLetter = user.firstLetterOfUser;

      
        res.render('address', {
            addresses: address,
            cartItemNumber: usercartArrayNumber,
            totalSum: totalSumAfterShipping,
            shipppingCharges: shipppingCharges,
            taxesOnProducts: taxesOnProducts,
            totalAfterTax: totalOrder,
            firstLetterOfUser: userfirstLetter,
            
        });

     

    } catch (error) {
        console.error("Error fetching address:", error);
        res.status(500).send("Internal Server Error");
    }

});

app.get('/getTotalPiceWithDescription', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.send("User not found.");
            return;
        }
        const userName = user.nameU;
        const emailAdd = user.username;
        const usercartArrayNumber = user.cart.length;

        const cartItemsQuantity = []
        user.cart.forEach((cartQuantitty) => {
            cartItemsQuantity.push(cartQuantitty.quantityOfItem)
        })
        let cartItemsAreHere = [];
        for (let i = 0; i < usercartArrayNumber; i++) {
            cartItemsAreHere.push(user.cart[i]);
        }
        let cartItemPrices = []
        cartItemsAreHere.forEach(item => {
            cartItemPrices.push(item.productPrice)
        });
        const totalSumWithQunatityAdd = []
        for (let i = 0; i < cartItemsQuantity.length; i++) {
            totalSumWithQunatityAdd.push(cartItemsQuantity[i] * cartItemPrices[i])
        }
        //  console.log(cartItemPrices)
        let sum = 0;
        totalSumWithQunatityAdd.forEach(itemPrices => {
            sum += itemPrices
        });
        const totalSumBeforeShipping = sum //before shiping
        let shipppingCharges;
        if (totalSumBeforeShipping > 500) {
            shipppingCharges = 0;
        }
        else {
            shipppingCharges = 40;
        }
        const totalSumAfterShipping = parseInt(parseInt(totalSumBeforeShipping) + parseInt(shipppingCharges)).toFixed(2);
         

        let taxesOnProducts;
        if (totalSumAfterShipping < 900) {
            taxesOnProducts = 0
        }
        else {
            taxesOnProducts = parseInt((5 / 100) * totalSumAfterShipping)
        }
        // console.log(taxesOnProducts);
        const totalOrder = (parseInt(totalSumAfterShipping) + parseInt(taxesOnProducts)).toFixed(2);

        res.json({
            totalAfterTax: totalOrder,
            userName: userName,
            emailAdd: emailAdd
        });

        await user.save();

    } catch (error) {
        console.error("Error fetching address:", error);
        res.status(500).send("Internal Server Error");
    }
})


app.post("/newAddress", async function (req, res) {

    try {
        const country = req.body.countries
        const fullName = req.body.nameAddress
        const mobileNumber = req.body.mobileAdd
        const pincode = req.body.pincodeAdd
        const flatHouse = req.body.houseAdd
        const AreaOrVillage = req.body.villageAdd
        const Landmark = req.body.landmarkAdd
        const City = req.body.townAdd
        const State = req.body.State

        const userId = req.session.userId;

        if (!userId) {
            return res.render('login');
        }

        const user = await User.findById(userId);
       

        if (!user) {
            return res.render('login')
        }
        user.address.push(
            {
                country,
                fullName,
                mobileNumber,
                pincode,
                flatHouse,
                AreaOrVillage,
                Landmark,
                City,
                State
            });


        await user.save();

        res.redirect('address')

    } catch (error) {
        console.log("Error occurred", error);
        res.send(error);
    }

});


app.post("/delete-add", async (req, res) => {
    try {
        const addIdToDelete = parseInt(req.body.index); // Get the index of the address to delete
        const userId = req.session.userId; // Get the ID of the logged-in user


        if (!userId) {
            return res.render('loginCart');
        }

        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return res.render('loginCart');
        }

        // Remove the address from the user's addresses
        user.address = user.address.filter((item, idx) => idx !== addIdToDelete);

        // Save the updated user document
        await user.save();

        if (user.save = true) {
            res.redirect('address')
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/orderConfirm', async (req, res) => {

    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const nameU = user.nameU;
        const username = user.username;
        const { selectedAddressIndex: newIndex, selectedPaymentMethod } = req.body;
        const paymentDone = req.body.paymentDone;
        const totalPrice = req.body.totalPrice
    
        const today = dayjs();

        const formatted = today.format('D MMMM, dddd');

        if (newIndex === undefined) {
            console.log('Please select the address');
        } else {
            const userCartItemsDelivering = user.cart;
            const userAddressDelivering = user.address[newIndex];

            user.orders.push({
                address: userAddressDelivering,
                deliveringProducts: userCartItemsDelivering,
                paymentMethodSelected: selectedPaymentMethod !== undefined,
                selectedPaymentMethod: selectedPaymentMethod || null,
                paymentDone: paymentDone || false,
                DateAndTimeHere: formatted,
                total: totalPrice
            });
        }
        // Save the updated user object
        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.USEROTP,
                pass: process.env.PASSOTP
            }

        });

        const mailOptions = {
            from: 'yashsabne39@gmail.com',
            to: username,
            subject: `Hurray! Order confirmed successfully`,
            html: `<p> Hello <b> ${nameU}</b>, your order is successfully placed! we will reach soon to you with your order </p>
                    <p>For Order details visit to our website<p>
                    <p>Thank you</p><p>Best Regards </p><p><b> Yash Store</b> </p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sending email');
            } else {

                return res.status(200).send('Email sent successfully');
            }
        })

        res.render('orderSucess')

    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});


app.get('/terms&condition', (req, res) => {
    res.render('terms&condition')
})



const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});



app.get('/orderSucess', async (req, res) => {
    await res.render('orderSucess')
})

app.get('/Orders', async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);

        if (!user) {
            res.render('login')
        }

        const orders = user.orders;

        const deliveringProductsOrDelivered = orders.map(order => ({
            deliveringProducts: order.deliveringProducts,
            deliveryDate: order.DateAndTimeHere, // Assuming this is a field in your order object
            total: order.total,
            orderId: order._id

        }));

        res.render('orders', {
            deliveringProductsOrDelivered
        });

    } catch (error) {
        console.log(error); // It's a good practice to log errors for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
 

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
