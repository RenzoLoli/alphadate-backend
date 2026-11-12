import { Clock } from "../../../utils/date/clock";
import { DateStatus } from "../enums/dateStatus";

export class CustomDate {
	constructor(
		public title: string,
		public description: string,
		public creationDate: Date,
		public updatedAt: Date,
		public tags: string[],
		public status: DateStatus,
		public readonly clock: Clock,
	) {}

	updateTitle(title: string) {
		this.title = title;
		this.postUpdate();
	}

	updateDescription(description: string) {
		this.description = description;
		this.postUpdate();
	}

	updateTags(tags: string[]) {
		this.tags = tags;
		this.postUpdate();
	}

	finishDate() {
		if (this.status === DateStatus.DONE) {
			return;
		}

		this.status = DateStatus.DONE;
		this.postUpdate();
	}

	refreshDate() {
		this.status = DateStatus.PUBLISHED;
		this.postUpdate();
	}

	private postUpdate() {
		this.updatedAt = this.clock.now();
	}
}
