import { APIGatewayEvent } from "aws-lambda";
import z from "zod";
import { EnvService } from "../../../application/services/envService";
import { AlreadyExistsError } from "../../../domain/errors/AlreadyExistsError";
import { Responses } from "../../../helpers/responses";
import { ResponsesFromError } from "../../../helpers/responses/fromError";
import { parseValidate } from "../../../helpers/validation";
import { AlphabetDynamoDBRepository } from "../../../infraestructure/persistence/repositories/alphabetDynamoDB.repository";
import { logStartLambda } from "../../../utils/logLambda";

const TABLE_NAME = EnvService.getRequiredEnv("ALPHABETS_TABLE_NAME");

const dateRepo = new AlphabetDynamoDBRepository(TABLE_NAME);

const schema = z.object({
	userId: z.string().min(1),
	body: z
		.string()
		.transform((value) => JSON.parse(value))
		.pipe(
			z.object({
				title: z.string().min(3),
				description: z.string().min(3),
				tags: z.array(z.string()).optional().default([]),
			}),
		),
});

export const handler = async (event: APIGatewayEvent) => {
	logStartLambda(event);

	try {
		console.log("userId: ", event.requestContext?.authorizer?.userId);
		console.log("body?: ", Boolean(event.body));

		const {
			userId,
			body: { title, description, tags },
		} = parseValidate(schema, {
			userId: event.requestContext?.authorizer?.userId,
			body: event.body,
		});

		const existsDate = await dateRepo.getAlphabetByUserIdAndTitle(
			userId,
			title,
		);

		if (existsDate) {
			console.log("Date already exists");
			throw new AlreadyExistsError(title);
		}

		const nDateId = await dateRepo.createAlphabateDate(
			userId,
			title,
			description,
			tags,
		);
		console.log("nDateId: ", nDateId);

		return Responses.created({
			message: "Date created",
			dateId: nDateId,
		});
	} catch (e) {
		console.error("Error: ", e);
		return ResponsesFromError(e);
	}
};
