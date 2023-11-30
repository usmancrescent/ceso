const express = require('express');
const mongoose = require('mongoose');
const Users = require('./user.model');
const Product=require('./product.model')
const CheckOut=require('./checkout.model')
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json())

app.get("/api", async (req, res) => {
  try {
    // Read all users from the database
    const allUsers = await Users.find({});
    console.log('All Users:', allUsers);

    // Send the users in the response
    res.json({ users: allUsers.map(user =>( [user.name,user.password])) });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Read the user from the database based on email and password
    const user = await Users.findOne({ email: email, password: password });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User:', user);

    // Send the user data in the response
    res.json({ user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Error reading user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    // Read all users from the database
    const allproducts = await Product.find({});
    console.log('All Products:', allproducts)

    // Send the users in the response
    res.json({products:allproducts.map(product=>([product.productid,product.title,product.quantity,product.description,product.gender]))});
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// POST endpoint to add a product
app.post('/api/products/add', async (req, res) => {
  try {
    // Extract product data from the request body
   const { productid, title, gender, price,description, quantity } = req.body;
   const existingProduct = await Product.findOne({ productid:productid });

   if (existingProduct) {
     return res.status(404).json({ error: 'Product with Same ID Already Exists' });
   }

    // Create a new Product instance
   const newProduct = new Product({
       productid,
       title,
       gender,
       price,
       description,
       quantity,
   })

//  { const newProduct = new Product({
//        productid:1,
//       title:'Suite',
//          gender:'Male',
//          price:12000,
//          description:'good shirt',
//         quantity:30,})}
    // Save the new product to the database
    const savedProduct = await newProduct.save();

    // Send the saved product in the response
    res.status(201).json({ product: savedProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE endpoint to remove a product by ID
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(productId)
    // Check if the product with the given ID exists
    const existingProduct = await Product.findOne({ productid:productId });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Remove the product from the database
    await Product.findOneAndDelete({ productid:productId });

    res.status(204).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Now when a Product is purchased we should Update Its quanity
//Update
app.put('/api/products/update/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { productid: req.params.id },
      { $set: { quantity: req.body.quantity } },
      { new: true }
    ).exec();

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(updatedProduct);
    res.send("Updated!")
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Error occurred');
  }
});

//Now when a Product is purchased we should Update Its quanity
//Update
app.put('/api/products/purchase/:id', async (req, res) => {
  try {
    const a=await Product.findOne({productid:req.params.id})
    if (a){
    const b=a.quantity
    console.log(b)
    if (b>0){
    const updatedProduct = await Product.findOneAndUpdate(
      { productid: req.params.id },
      { $set: { quantity: b-1 } },
      { new: true }
    ).exec();


    res.send("Purchase Successful")
  }
  else{
    res.send("Insufficient Quantity")
  }
    }
    else 
    {
      res.send("Not Found")
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Error occurred');
  }
});


//Get a specific Gender Products
app.get('/api/products/category', async (req, res) => {
  try {
    const gender = req.query.gender || 'Uni'; 
    const products = await Product.find({ gender: gender });
    
    res.json({ products: products.map(product=>([product.productid,product.title,product.quantity,product.description,product.gender]))});
  } catch (error) {
    console.error('Error reading product data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add a checkout
app.post('/api/checkout', async (req, res) => {
  try {
    const { useremail, products, totalBill, paymentMethod } = req.body;
    console.log('Received Request Payload:', req.body);
    const newCheckout = new CheckOut({
      useremail,
      products,
      totalBill,
      paymentMethod,
    });

    const savedCheckout = await newCheckout.save();
console.log('Saved Checkout:', savedCheckout);
res.json(newCheckout)
    
  } catch (error) {
    console.error('Error adding checkout:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


mongoose.connect('mongodb://localhost:27017/Users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check for successful connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});


