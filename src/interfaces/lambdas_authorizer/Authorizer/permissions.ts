import { APIGatewayAuthorizerResult } from "aws-lambda";

export const allow = (
	principalId: string,
	context: Record<string, string>,
): APIGatewayAuthorizerResult => {
	return {
		principalId,
		policyDocument: {
			Version: "2012-10-17",
			Statement: [
				{
					Action: "execute-api:Invoke",
					Effect: "Allow",
					Resource: "*",
				},
			],
		},
		context,
	};
};

export const deny = (principalId: string) => {
	return {
		principalId,
		policyDocument: {
			Version: "2012-10-17",
			Statement: [
				{
					Action: "execute-api:Invoke",
					Effect: "Deny",
					Resource: "*",
				},
			],
		},
	};
};
