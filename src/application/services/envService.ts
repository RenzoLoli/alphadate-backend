export class EnvService {
	static getRequiredEnv(name: string) {
		const value = process.env[name];

		if (!value) {
			console.error(`Missing required environment variable: ${name}`);
			throw new Error(`${name} not set`);
		}

		return value;
	}
}
