import { Responses } from ".";
import { AlreadyExistsError } from "../../domain/errors/AlreadyExistsError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";

export const ResponsesFromError = (e: any) => {
	if (e instanceof ValidationError) {
		return Responses.badRequest({
			message: e.message,
		});
	} else if (e instanceof NotFoundError) {
		return Responses.notFound({
			message: e.message,
		});
	} else if (e instanceof AlreadyExistsError) {
		return Responses.conflict({
			message: e.message,
		});
	} else {
		return Responses.internalServerError({
			message: "Something went wrong",
		});
	}
};
