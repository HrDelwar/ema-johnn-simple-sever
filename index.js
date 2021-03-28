const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5000;

const app = express();
app.use(bodyParser.json());
app.use(cors());


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vzza0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productsCollection = client.db(process.env.DB_NAME).collection("products");
    const orderCollection = client.db(process.env.DB_NAME).collection("orders");
    //root page response
    app.get('/', (req, res) => {
        res.send("Yap it's working....!!")
    })


    //add product in database
    app.post('/addProduct', (req, res) => {
        const product = req.body;
        productsCollection.insertOne(product)
            .then(result => {
                console.log(result.insertedCount);
                res.status(200).send(result.insertedCount.toString())
            })
            .catch(err => res.send(err))
    });

    //add product in database
    app.post('/cartProducts', (req, res) => {
        const productsKey = req.body;
        productsCollection.find({ key: { $in: productsKey } })
            .toArray((err, docs) => {
                res.status(200).send(docs)
            })
    });

    //get products from database
    app.get('/products', (req, res) => {
        productsCollection.find({}).limit(20)
            .toArray((err, docs) => {
                res.send(docs)
            })
    })

    //get single product from database
    app.get('/product/:key', (req, res) => {
        productsCollection.find({ key: req.params.key })
            .toArray((err, docs) => {
                res.send(docs[0])
            })
    })

    //add order in database
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
            .catch(err => res.send(err))
    });
});


app.listen(process.env.PORT || port);