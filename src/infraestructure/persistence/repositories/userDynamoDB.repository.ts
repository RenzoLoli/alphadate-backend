import { DynamoDB } from "../../../helpers/aws/dynamodb";

export class UserDynamoDBRepository {
	private client: DynamoDB;

	constructor(private readonly tableName: string) {
		this.client = new DynamoDB(this.tableName);
	}

	async getUniqueIdByCognitoId(cognitoId: string): Promise<string | null> {
		const items = await this.client.queryItems(
			"cognitoId = :cognitoId",
			undefined,
			{
				":cognitoId": cognitoId,
			},
			"cognitoId-index",
		);

		if (!items) {
			return null;
		}

		return items[0].uniqueId;
	}
	//
	// private formatItem(item: any): UserModel {
	// 	return {
	// 		email: item.email,
	// 		provider: item.provider,
	// 		cognitoId: item.cognitoId,
	// 		createdAt: item.createdAt,
	// 		uniqueId: item.uniqueId,
	// 	} as UserModel;
	// }
}
