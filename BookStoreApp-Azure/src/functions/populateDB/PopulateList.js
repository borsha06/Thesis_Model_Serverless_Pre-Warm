const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");

const url = "mongodb+srv://<username>:<password>.06@bookstoredb.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";
const client = new MongoClient(url);

let resetList = [
  {
    _id: uuidv4(),
    bookName:"S",
    author:"S",
    price:"5",
    genre:"S",
    rating:"S"
  },
   {
    _id: uuidv4(),
    bookName:"S",
    author:"S",
    price:"5",
    genre:"S",
    rating:"S"
  },
   {
    _id: uuidv4(),
    bookName:"S",
    author:"S",
    price:"5",
    genre:"S",
    rating:"S"
  },
];

module.exports = async function (context, req) {
  await client.connect();
  const database = client.db("crud");
  const collection = database.collection("Bookstore");
  await collection.deleteMany({});
  await collection.insertMany(resetList);

  return (context.res = {
    status: 200,
    body: "Initialization successful",
  });
};