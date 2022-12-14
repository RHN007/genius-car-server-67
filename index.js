const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 9000;
require('dotenv').config();

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.niglu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nm1iekw.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization
  if(!authHeader){
    return res.status(401).send({message: 'Unauthorized Access'})
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, function(err, decoded ) {

    if(err) {
      return res.status(401).send({message: 'Unauthorized Access'})
    }
    req.decoded = decoded ;
    next()

  })
}



const run = async () => {
  try {
    const serviceCollection = client.db('geniusCar').collection('service');
    const orderCollection  = client.db('geniusCar').collection('orders')

app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
  res.send({token})
})
//To find all the data from servers 
app.get('/services', async (req, res) => {
  const search = req.query.search
  console.log(search);
  let query = {};
  if (search.length) {
      query = {
          $text: {
              $search: search
          }
      }

  }
  // const query = { price: { $gt: 100, $lt: 300 } }
  // const query = { price: { $eq: 200 } }
  // const query = { price: { $lte: 200 } }
  // const query = { price: { $ne: 150 } }
  // const query = { price: { $in: [20, 40, 150] } }
  // const query = { price: { $nin: [20, 40, 150] } }
  // const query = { $and: [{price: {$gt: 20}}, {price: {$gt: 100}}] }
  const order = req.query.order === 'asc' ? 1 : -1;
  const cursor = serviceCollection.find(query).sort({ price: order });
  const services = await cursor.toArray();
  res.send(services);
});

    app.get('/services/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id:ObjectId(id)}
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })
    //Orders API

    app.get('/orders', verifyJWT, async(req, res)=> {
      const decoded = req.decoded;
      console.log('Inside orders Api',decoded)

      if(decoded.email !== req.query.email){
        res.status(403).send({message: 'UnAuthorized access'})
      }
      // console.log(req.headers.authorization)
      let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
    })


app.post ('/orders', verifyJWT, async(req, res) => {
  const order = req.body;
  const result = await orderCollection.insertOne(order)
  res.send(result)
})
app.patch('/orders/:id', verifyJWT, async(req, res)=> {
  const id = req.params.id;
  const status = req.body.status
  const query = {_id:ObjectId(id)}
  const updatedDoc = {
    $set: {
      status: status
    }
  }
  const result = await orderCollection.updateOne(query, updatedDoc)
  res.send(result)
})




app.delete('/orders/:id', verifyJWT, async(req, res)=> {
  const id = req.params.id;
  const query = {_id:ObjectId(id)}

  const result = await orderCollection.deleteOne(query);
  res.send(result)
  })}
  finally{

  }
}
run().catch(err => console.err(err))









app.get('/', (req, res)=> {
    res.send('Hello World')
})


app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})
