const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");

const url = ""; 
const client = new MongoClient(url);


module.exports = async function (context, req) {

    if (req.body && req.body.isWarmer) {
        context.res = {
            status: 200,
            body: 'Function warmed up'
        };
        return;
    }
    else {
        await client.connect();
        const database = client.db("crud");
        const collection = database.collection("Bookstore");
        let data = { _id: uuidv4(), ...req.body };
        await collection.insertOne(data);

        return (context.res = {
            status: 200,
            body: data,
        });
    }
};