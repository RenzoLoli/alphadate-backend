import { APIGatewayEvent } from "aws-lambda";
import z from "zod";
import { EnvService } from "../../../application/services/envService";
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
});

export const handler = async (event: APIGatewayEvent) => {
	logStartLambda(event);

	try {
		console.log("userId: ", event.requestContext?.authorizer?.userId);

		const { userId } = parseValidate(schema, {
			userId: event.requestContext?.authorizer?.userId,
		});

		const dates = await dateRepo.getAlphabetByUserId(userId);
		console.log("dates.length: ", dates.length);

		const formattedDates = (dates ?? []).map((date) => ({
			...date,
			creationDate: dateService.format(date.creationDate),
			updatedAt: dateService.format(date.updatedAt),
		}));

		console.log("formattedDates: ", formattedDates.slice(0, 5));

		return Responses.ok({
			message: "Dates retrieved",
			length: formattedDates.length ?? 0,
			dates: formattedDates.sort((a, b) => a.letter.localeCompare(b.letter)),
		});
	} catch (e) {
		console.error("Error: ", e);
		return ResponsesFromError(e);
	}
};
