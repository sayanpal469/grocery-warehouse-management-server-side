const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
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

        app.get('/product', async (req, res) => {
            const query = {}

            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const product = await productCollection.findOne(query)
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
        app.put('/product/:id', async (req,res) => {
          const id = req.params.id
          const updateQuantity = req.body
          const filter = {_id: ObjectId(id)}
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              quantity: updateQuantity.newQuantity
            }
          };
          const result = await productCollection.updateOne(filter, updateDoc, options)
          res.send(result)
        })

    }
    finally{
        
    }
}


run().catch(console.dir)





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})