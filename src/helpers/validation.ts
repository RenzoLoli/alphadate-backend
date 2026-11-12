import { z } from "zod";
import { ValidationError } from "../domain/errors/ValidationError";

export const parseValidate = <T extends z.ZodType>(
	schema: T,
	args: unknown,
): z.infer<T> => {
	const result = schema.safeParse(args);

	if (!result.success) {
		console.error("Validation Failed: ", result.error);
		throw new ValidationError(result.error.message);
	}

	console.log("Schema Validated!");
	return result.data;
};
