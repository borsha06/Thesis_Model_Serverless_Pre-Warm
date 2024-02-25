import {DynamoDBClient, PutItemCommand, UpdateItemCommand} from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});

export const handler = async (event: { body: string }): Promise<{ statusCode: number, body: string }> => {
    const { bookId,bookName ,author, price, genre, rating  } = JSON.parse(event.body) as { content?: string, bookId?: string, bookName?: string, author?: string, price?: string, genre?: string, rating?: string };
  //  const { userId } = event.pathParameters ?? {};

    if ( bookName === undefined) {
        return {
            statusCode: 400,
            body: "bad request"
        }
    }


    if (bookId !== undefined) {
        console.log(bookId);
        let updateExpression = 'SET noteContent = :content';
        const expressionAttributeValues: Record<string, any> = {};

        updateExpression += ', bookName = :bookName';
        expressionAttributeValues[':bookName'] = {S: bookName};

        if (author !== undefined) {
            updateExpression += ', author = :author';
            expressionAttributeValues[':author'] = {S: author};
        }

        if (price !== undefined) {
            updateExpression += ', price = :price';
            expressionAttributeValues[':price'] = {N: price};
        }

        if (genre !== undefined) {
            updateExpression += ', genre = :genre';
            expressionAttributeValues[':genre'] = {S: genre};
        }
        if (rating !== undefined) {
            updateExpression += ', rating = :rating';
            expressionAttributeValues[':rating'] = {S: rating};
        }
        const updateParams = {
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': {S: 'book'},
                'SK': {S: bookId},
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues
        };

        try {
            await client.send(new UpdateItemCommand(updateParams));
            return {
                statusCode: 200,
                body: JSON.stringify({bookId: bookId, operation: 'update'})
            };
        }
        catch (error) {
            console.error('Error updating note:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({message: 'Internal server error'}),
            };
        }
    } else {
        // Create logic here
        console.log(1);
        const bookId = uuidv4();
        // ...
        await client.send(new PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                PK: { S: 'book' },
                SK: { S: bookId },
                bookName: { S: bookName! },
                author: { S : author! },
                price: { S : price! },
                genre: { S : genre! },
                rating: { S: rating!}
            },
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ bookId })
        };
    }


}