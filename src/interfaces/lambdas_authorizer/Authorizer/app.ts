import { CognitoJwtVerifier } from "aws-jwt-verify";
import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { EnvService } from "../../../application/services/envService";
import { UserDynamoDBRepository } from "../../../infraestructure/persistence/repositories/userDynamoDB.repository";
import { logStartLambda } from "../../../utils/logLambda";
import { allow, deny } from "./permissions";

const USER_POOL_ID = EnvService.getRequiredEnv("USER_POOL_ID");
const CLIENT_ID = EnvService.getRequiredEnv("CLIENT_ID");
const ENVIRONMENT = EnvService.getRequiredEnv("ENVIRONMENT");
const USERS_TABLE_NAME = EnvService.getRequiredEnv("USERS_TABLE_NAME");

const verifier = CognitoJwtVerifier.create({
	userPoolId: USER_POOL_ID,
	tokenUse: "access",
	clientId: CLIENT_ID,
});

const usersRepo = new UserDynamoDBRepository(USERS_TABLE_NAME);

export const handler = async (event: APIGatewayRequestAuthorizerEvent) => {
	logStartLambda(event);

	try {
		const authorizationHeader =
			event.headers?.Authorization ?? event.headers?.authorization;

		if (!authorizationHeader) {
			console.log("No authorization header");
			return deny("anonymous");
		}

		const token = authorizationHeader.replace(/^Bearer\s+/i, "");

		console.log("Token: ", token);

		const payload = await verifier.verify(token);
		console.log("Payload: ", payload);

		const sub = payload.sub;

		if (!sub) {
			console.log(
				"Deny access because sub does not exist on payload from token",
			);
			return deny("anonymous");
		}

		const uniqueId = await usersRepo.getUniqueIdByCognitoId(sub);

		if (!uniqueId) {
			console.log("Deny access because user dynamodb does not exist");
			return deny("anonymous");
		}

		const userId = uniqueId;

		if (!userId) {
			console.log("Deny access because userId does not exist");
			return deny("anonymous");
		}

		console.log("User ID: ", userId);

		const requestedUserId = event.pathParameters?.userId;

		if (requestedUserId && requestedUserId !== userId) {
			console.log("Deny access because userId does not match requestedUserId");
			return deny(userId);
		}

		console.log("User authorization granted");
		return allow(userId, { userId });
	} catch (e) {
		console.error("Authorization failed: ", e);
		return deny("anonymous");
	}
};
