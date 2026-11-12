export class Responses {
	private static readonly template = (code: number, body: any) => ({
		statusCode: code,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true,
		},
		body: JSON.stringify(body),
	});

	public static readonly ok = (body: any) => Responses.template(200, body);
	public static readonly created = (body: any) => Responses.template(201, body);
	public static readonly noContent = () => ({
		statusCode: 204,
	});
	public static readonly badRequest = (body: any) =>
		Responses.template(400, body);
	public static readonly unauthorized = (body: any) =>
		Responses.template(401, body);
	public static readonly forbidden = (body: any) =>
		Responses.template(403, body);
	public static readonly notFound = (body: any) =>
		Responses.template(404, body);
	public static readonly conflict = (body: any) =>
		Responses.template(409, body);
	public static readonly internalServerError = (body: any) =>
		Responses.template(500, body);
}
