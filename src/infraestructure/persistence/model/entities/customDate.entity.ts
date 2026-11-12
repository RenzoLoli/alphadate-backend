import { Letter } from "../../../../utils/letters";

export interface CustomDateModel {
	userId: string;
	dateId: string;

	status: string;

	letter: Letter;
	title: string;
	description: string;

	tags: string[];

	creationDate: Date;
	updatedAt: Date;
}
