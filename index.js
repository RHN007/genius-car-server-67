const express = require('express');
const app = express(); 
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 9000; 
require('dotenv').config(); 

app.use(cors()); 
app.use(express.json())

console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nm1iekw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});









app.get('/', (req, res)=> {
    res.send('Hello World')
})


app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})