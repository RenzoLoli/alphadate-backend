export interface UserModel {
	email: string;
	provider: string;
	cognitoId: string;
	createdAt: string;
	uniqueId: string;
}

export interface UserGSIModel {
	uniqueId: string;
}
