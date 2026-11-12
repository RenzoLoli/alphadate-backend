import { Responses } from "../../../helpers/responses";
import { logStartLambda } from "../../../utils/logLambda";

export const handler = async (event: any) => {
	logStartLambda(event);

	return Responses.ok({
		message: "Healthy",
	});
};
