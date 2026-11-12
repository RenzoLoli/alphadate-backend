import { APIGatewayEvent } from "aws-lambda";
import { EnvService } from "../../../application/services/envService";
import { Responses } from "../../../helpers/responses";
import { ResponsesFromError } from "../../../helpers/responses/fromError";
import { AlphabetDynamoDBRepository } from "../../../infraestructure/persistence/repositories/alphabetDynamoDB.repository";
import { DateService } from "../../../utils/date/dateService";
import { logStartLambda } from "../../../utils/logLambda";

const TABLE_NAME = EnvService.getRequiredEnv("ALPHABETS_TABLE_NAME");
const TABLE_GLOBAL_PK = EnvService.getRequiredEnv("ALPHABETS_GLOBAL_PK");

const dateRepo = new AlphabetDynamoDBRepository(TABLE_NAME);
const dateService = DateService.fromEnv();

export const handler = async (event: APIGatewayEvent) => {
	logStartLambda(event);

	try {
		const dates = await dateRepo.getAlphabetByUserId(TABLE_GLOBAL_PK);
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
