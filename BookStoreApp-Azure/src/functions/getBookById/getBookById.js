const { MongoClient } = require("mongodb");

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
        let obj = await collection.findOne({ _id: req.params.id });
        console.log(req);
        if (!obj) {
            return context.res = {
                status: 400,
                body: "not found"
            };
        }
        return context.res = {
            status: 200,
            body: obj,
        };

    }

};