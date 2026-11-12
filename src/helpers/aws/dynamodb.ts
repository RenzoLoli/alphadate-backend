import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DeleteCommand,
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";

export class DynamoDB {
	private static client: DynamoDBDocumentClient;
	private tableName: string;

	constructor(tableName: string) {
		if (!DynamoDB.client) {
			const baseClient = new DynamoDBClient({});
			DynamoDB.client = DynamoDBDocumentClient.from(baseClient);
		}

		this.tableName = tableName;
	}

	async getItem(key: string) {
		const params = {
			TableName: this.tableName,
			Key: {
				key: key,
			},
		};

		const data = await DynamoDB.client.send(new GetCommand(params));

		return data.Item ?? null;
	}

	async queryItems(
		conditionExpression: string,
		filterExpression: string | undefined,
		expressionAttributeValues: any,
		indexName?: string,
	) {
		const params = {
			TableName: this.tableName,
			KeyConditionExpression: conditionExpression,
			FilterExpression: filterExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			IndexName: indexName,
		};

		const data = await DynamoDB.client.send(new QueryCommand(params));

		return data.Items ?? [];
	}

	async putItem(item: any) {
		const params = {
			TableName: this.tableName,
			Item: item,
		};

		await DynamoDB.client.send(new PutCommand(params));
	}

	async deleteItem(key: any) {
		const params = {
			TableName: this.tableName,
			Key: key,
		};

		await DynamoDB.client.send(new DeleteCommand(params));
	}
}
