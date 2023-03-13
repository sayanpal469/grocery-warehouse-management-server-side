const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

// Middleware
app.use(express.json())
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39pjl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect()
        const productCollection = client.db('groceryWarehouse').collection('products')
        const userCollection = client.db('groceryWarehouse').collection('user')

        // JWT
      
        app.post('/login', (req, res) => {
          const email = req.body
          var token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
          res.send({token})
        })

        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        
        app.get('/userProduct', async (req, res) => {
            const email = req.query.email
            const query = {email: email}
            const cursor = userCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const product = await productCollection.findOne(query)
            res.send(product)
        })

        app.get('/userProduct/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const product = await userCollection.findOne(query)
            res.send(product)
        })

        // Delever Quantity
        app.put('/product/:id', async (req,res) => {
          const id = req.params.id
          const deleverQuantity = req.body
          const filter = {_id: ObjectId(id)}
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              quantity: deleverQuantity.newQuantity
            }
          };
          const result = await productCollection.updateOne(filter, updateDoc, options)
          res.send(result)
          })


        // Update Quantity
        app.put('/product/updateQuantity/:id', async (req,res) => {
          const id = req.params.id;
          const updateQuantity = req.body
          const filter = {_id: ObjectId(id)};
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              quantity: updateQuantity.quantity
            }
          };
          console.log(req.body)
          const result = await productCollection.updateOne(filter, updateDoc, options)
          res.send(result)
        })

        // Delete Product

        app.delete('/product/:id', async (req, res) => {
          const id = req.params.id
          const query = {_id: ObjectId(id)}
          const result = await productCollection.deleteOne(query)
          res.send(result)
        })

        app.delete('/userProduct/:id', async (req, res) => {
          const id = req.params.id
          const query = {_id: ObjectId(id)}
          console.log(query);
          const result = await userCollection.deleteOne(query)
          res.send(result)
        })

        // Add Product
        app.post('/product', async (req, res) => {
          const newProduct = req.body
          const tokenInfo = req.headers.authoraization
          const [email, accessToken] = tokenInfo.split(" ")
          const decoded = verifyToken(accessToken)
          if(email === decoded.email?.email) {
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
            console.log('Product update succesfully');
          } else{
            res.send({err: 'Unauthoraized Access'})
            
          }
        })

         app.post('/userProduct', async (req, res) => {
          const newProduct = req.body
          const tokenInfo = req.headers.authoraization
          const [email, accessToken] = tokenInfo.split(" ")
          const decoded = verifyToken(accessToken)
          if(email === decoded.email?.email) {
            const result = await userCollection.insertOne(newProduct)
            res.send(result)
            console.log('Product update succesfully');
          } else{
            res.send({err: 'Unauthoraized Access'})
          }
        })
        

    }
    finally{
        
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Healthy Piorr')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// verify token function

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
    if(err) {
      email = "Invalid Email"
    } 
    if(decoded) {
      console.log(decoded);
      email = decoded
    }
  });

  return email
}