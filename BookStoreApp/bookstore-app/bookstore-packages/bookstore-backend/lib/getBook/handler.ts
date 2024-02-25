import {DynamoDBClient, GetItemCommand, QueryCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler =  async (event: { pathParameters: { id?: string }}): Promise<{ statusCode: number, body: string }> => {
    const {  id: bookId } = event.pathParameters ?? {};

    const { Item } = await client.send(new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
            PK: { S: 'book' },
            SK: { S: bookId! },
        },
    }));

    if (Item === undefined) {
        return {
            statusCode: 404,
            body: "not found"
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: bookId,
            bookName: Item.bookName?.S,
            author: Item.author?.S,
            price: Item.price?.S,
            genre: Item.genre?.S,
            rating: Item.rating?.S
        }),
    };
}