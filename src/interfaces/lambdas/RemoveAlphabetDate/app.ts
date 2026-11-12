import { APIGatewayEvent } from "aws-lambda";
import { z } from "zod";
import { EnvService } from "../../../application/services/envService";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { Responses } from "../../../helpers/responses";
import { ResponsesFromError } from "../../../helpers/responses/fromError";
import { parseValidate } from "../../../helpers/validation";
import { AlphabetDynamoDBRepository } from "../../../infraestructure/persistence/repositories/alphabetDynamoDB.repository";
import { logStartLambda } from "../../../utils/logLambda";

const TABLE_NAME = EnvService.getRequiredEnv("ALPHABETS_TABLE_NAME");

const dateRepo = new AlphabetDynamoDBRepository(TABLE_NAME);

const schema = z.object({
	userId: z.string().min(1),
	dateId: z.string().min(1),
});

export const handler = async (event: APIGatewayEvent) => {
	logStartLambda(event);

	try {
		console.log("userId: ", event.requestContext?.authorizer?.userId);
		console.log("dateId: ", event.pathParameters?.dateId);

		const { userId, dateId } = parseValidate(schema, {
			userId: event.requestContext?.authorizer?.userId,
			dateId: event.pathParameters?.dateId,
		});

		const sDate = await dateRepo.getAlphabetByUserIdAndDateId(userId, dateId);

		if (!sDate) {
			console.log("Date not found");
			throw new NotFoundError("Date");
		}

		console.log("sDate: ", sDate);

		await dateRepo.removeAlphabetByUserIdAndDateId(userId, dateId);

		return Responses.noContent();
	} catch (e) {
		console.error("Error: ", e);
		return ResponsesFromError(e);
	}
};
