const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt')
const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/ecommerceData')

const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
    phone:Number,
    nameU:String,
    dob:String,
    googleId:String,
    nameGoogle:String
}));

// Set up view engine (assuming you're using EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/products', (req, res) => {
    const productPath = path.join(__dirname, 'products.json');
    const productData = fs.readFileSync(productPath, 'utf8');
    res.json(JSON.parse(productData));
});

app.get('/', (req, res) => {
    res.render('index');  
    const productPath = path.join(__dirname, 'product.json');
    const productData = fs.readFileSync(productPath, 'utf8');
    res.json(JSON.parse(productData));
});

app.get('/login',(req,res) => {
    res.render("login")
})


app.get("/register",(req,res) => {
    res.render("register")
})

  //=====================POST REQUEST FOR REGISTER DONE SUCCESSFULLY==============//

app.post("/register", async function (req, res) {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        phone: req.body.phone,
        nameU: req.body.fullName,
        dob: req.body.dob
    });

    try {
        const username = req.body.username;
        const foundUser = await User.findOne({ username });

        if (foundUser) {
            return res.send("User already exists");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        newUser.password = hashedPassword;

        await newUser.save();
        res.render("index");
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
                // Successful login
                res.render("index");
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

app.get("/cart",(req,res) => {
    res.render("cart")
})
 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
