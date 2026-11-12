import { randomUUID } from "crypto";
import { CustomDate } from "../../../domain/model/entities/customDate";
import { DateStatus } from "../../../domain/model/enums/dateStatus";
import { DynamoDB } from "../../../helpers/aws/dynamodb";
import { DateService } from "../../../utils/date/dateService";
import { Letter } from "../../../utils/letters";
import { CustomDateModel } from "../model/entities/customDate.entity";

export class AlphabetDynamoDBRepository {
	private client: DynamoDB;

	constructor(
		private readonly tableName: string,
		private readonly dates: DateService = DateService.fromEnv(),
	) {
		this.client = new DynamoDB(this.tableName);
	}

	async getAlphabetByUserId(userId: string): Promise<CustomDateModel[]> {
		const items = await this.client.queryItems("userId = :userId", undefined, {
			":userId": userId,
		});

		return items.map((item) => this.formatItemDate(item));
	}

	async getAlphabetByUserIdAndDateId(
		userId: string,
		dateId: string,
	): Promise<CustomDateModel | null> {
		const items = await this.client.queryItems(
			"userId = :userId and dateId = :dateId",
			undefined,
			{
				":userId": userId,
				":dateId": dateId,
			},
		);

		if (items.length === 0) {
			return null;
		}

		return this.formatItemDate(items[0]);
	}

	async getAlphabetByUserIdAndTitle(userId: string, title: string) {
		const items = await this.client.queryItems(
			"userId = :userId",
			"title = :title",
			{
				":userId": userId,
				":title": title,
			},
		);

		if (items.length === 0) {
			return null;
		}

		return this.formatItemDate(items[0]);
	}

	async createAlphabateDate(
		userId: string,
		title: string,
		description: string,
		tags: string[],
	) {
		const params = {
			userId,
			dateId: randomUUID(),
			title,
			description,
			tags: tags ?? [],
			status: DateStatus.PUBLISHED,
			creationDate: this.dates.toISO(),
			updatedAt: this.dates.toISO(),
		};

		await this.client.putItem(params);

		return params.dateId;
	}

	async removeAlphabetByUserIdAndDateId(userId: string, dateId: string) {
		const params = {
			userId,
			dateId,
		};

		await this.client.deleteItem(params);
	}

	async updateAlphabateDate(userId: string, dateId: string, date: CustomDate) {
		const params = {
			userId,
			dateId,
			title: date.title,
			description: date.description,
			tags: date.tags,
			status: date.status.toString(),
			creationDate: this.dates.toISO(date.creationDate),
			updatedAt: this.dates.toISO(date.updatedAt),
		};

		await this.client.putItem(params);
	}

	private formatItemDate(item: any): CustomDateModel {
		return {
			userId: item.userId,
			dateId: item.dateId,

			letter: item.title[0] as Letter,
			title: item.title,
			description: item.description,
			status: item.status || DateStatus.PUBLISHED,

			creationDate: this.dates.parse(item.creationDate),
			updatedAt: this.dates.parse(item.updatedAt),

			tags: item.tags,
		} as CustomDateModel;
	}
}
