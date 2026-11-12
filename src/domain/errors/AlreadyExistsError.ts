export class AlreadyExistsError extends Error {
	constructor(value: string) {
		super(`${value} already exists`);
	}
}
