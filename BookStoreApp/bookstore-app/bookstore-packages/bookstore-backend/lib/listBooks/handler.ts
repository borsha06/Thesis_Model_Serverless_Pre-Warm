import {DynamoDBClient, GetItemCommand, QueryCommand} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const handler =  async (): Promise<{ statusCode: number, body: string }> => {
    const { Items } = await client.send(new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': { S: 'book' },
        },
    }));

    if (Items === undefined) {
        return { statusCode: 500, body: 'No books were found' };
    }

    const books = Items.map(item => ({
        id: item.SK?.S,
        bookName: item.bookName?.S,
        author: item.author?.S,
        price: item.price?.S,
        genre: item.genre?.S,
        rating: item.rating?.S
    }));

    return {
        statusCode: 200,
        body: JSON.stringify({ books }),
    };

}
