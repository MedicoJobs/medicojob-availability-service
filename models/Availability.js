import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_AVAILABILITY_TABLE || 'medicojobs-availability';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const normalize = (item) => {
  if (!item) {
    return null;
  }

  const userId = item.userId || item.id;

  return {
    ...item,
    id: userId,
    userId,
  };
};

class Availability {
  static async findOne(query = {}) {
    const userId = query.userId || query.id;

    if (!userId) {
      return null;
    }

    const response = await client.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: userId },
    }));

    return normalize(response.Item);
  }

  static async findOneAndUpdate(query = {}, update = {}) {
    const userId = query.userId || update.userId || query.id || update.id;

    if (!userId) {
      throw new Error('userId is required');
    }

    const existing = await Availability.findOne({ userId });
    const now = new Date().toISOString();
    const item = normalize({
      ...existing,
      ...update,
      id: userId,
      userId,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });

    await client.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  }
}

export default Availability;
