export class NotFoundError extends Error {
	constructor(value: string) {
		super(`${value} not found`);
	}
}
