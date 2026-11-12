import { APIGatewayEvent } from "aws-lambda";
import { z } from "zod";
import { EnvService } from "../../../application/services/envService";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { CustomDate } from "../../../domain/model/entities/customDate";
import { DateStatus } from "../../../domain/model/enums/dateStatus";
import { Responses } from "../../../helpers/responses";
import { ResponsesFromError } from "../../../helpers/responses/fromError";
import { parseValidate } from "../../../helpers/validation";
import { AlphabetDynamoDBRepository } from "../../../infraestructure/persistence/repositories/alphabetDynamoDB.repository";
import { DateService } from "../../../utils/date/dateService";
import { logStartLambda } from "../../../utils/logLambda";

const TABLE_NAME = EnvService.getRequiredEnv("ALPHABETS_TABLE_NAME");

const dateRepo = new AlphabetDynamoDBRepository(TABLE_NAME);
const dateService = DateService.fromEnv();

const schema = z.object({
	userId: z.string().min(1),
	dateId: z.string().min(1),
	body: z
		.string()
		.transform((value) => JSON.parse(value))
		.pipe(
			z.object({
				title: z.string().min(3),
				description: z.string().min(3),
				tags: z.array(z.string()).optional().default([]),
				status: z.enum(["finish", "refresh"]).optional(),
			}),
		),
});

export const handler = async (event: APIGatewayEvent) => {
	logStartLambda(event);

	try {
		console.log("userId: ", event.requestContext?.authorizer?.userId);
		console.log("dateId: ", event.pathParameters?.dateId);
		console.log("body?: ", Boolean(event.body));

		const {
			userId,
			dateId,
			body: { title, description, tags, status },
		} = parseValidate(schema, {
			userId: event.requestContext?.authorizer?.userId,
			dateId: event.pathParameters?.dateId,
			body: event.body,
		});

		const sDate = await dateRepo.getAlphabetByUserIdAndDateId(userId, dateId!);

		if (!sDate) {
			console.log("Date not found");
			throw new NotFoundError("Date");
		}

		const nDate = new CustomDate(
			sDate.title,
			sDate.description,
			sDate.creationDate,
			sDate.updatedAt,
			sDate.tags,
			(sDate.status || DateStatus.PUBLISHED) as DateStatus,
			dateService,
		);
		console.log("nDate: ", nDate);

		tryUpdateDate(nDate, { title, description, tags, status });
		console.log("updated nDate: ", nDate);

		await dateRepo.updateAlphabateDate(userId, dateId, nDate);

		return Responses.ok({
			message: "Date updated",
		});
	} catch (e) {
		console.error("Error: ", e);
		return ResponsesFromError(e);
	}
};

const tryUpdateDate = (eDate: CustomDate, parsed: any) => {
	if (parsed.title) {
		eDate.updateTitle(parsed.title);
	}

	if (parsed.description) {
		eDate.updateDescription(parsed.description);
	}

	if (parsed.tags) {
		eDate.updateTags(parsed.tags);
	}

	if (parsed.status) {
		if (parsed.status == "finish") {
			eDate.finishDate();
		}
		if (parsed.status == "refresh") {
			eDate.refreshDate();
		}
	}
};
