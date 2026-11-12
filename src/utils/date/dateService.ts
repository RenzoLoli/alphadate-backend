import { Clock } from "./clock";

const DEFAULT_TIMEZONE = "America/Lima";

const ISO_WITH_OFFSET = /([zZ]|[+-]\d{2}:\d{2})$/;

type ZonedParts = {
	year: string;
	month: string;
	day: string;
	hour: string;
	minute: string;
	second: string;
	offsetMinutes: number;
};

export class DateService implements Clock {
	private readonly formatter: Intl.DateTimeFormat;

	constructor(private readonly timezone: string) {
		DateService.assertValidTimezone(timezone);

		this.formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hourCycle: "h23",
		});
	}

	static fromEnv(): DateService {
		return new DateService(process.env.TIMEZONE ?? DEFAULT_TIMEZONE);
	}

	now(): Date {
		return new Date();
	}

	toISO(date: Date = this.now()): string {
		const p = this.zonedParts(date);

		return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${DateService.formatOffset(p.offsetMinutes)}`;
	}

	parse(iso: string): Date {
		if (!ISO_WITH_OFFSET.test(iso)) {
			throw new Error(`Date string has no timezone offset: ${iso}`);
		}

		const date = new Date(iso);

		if (Number.isNaN(date.getTime())) {
			throw new Error(`Invalid date string: ${iso}`);
		}

		return date;
	}

	format(value: Date | string): string {
		return this.toISO(typeof value === "string" ? this.parse(value) : value);
	}

	private zonedParts(date: Date): ZonedParts {
		const parts = this.formatter.formatToParts(date);
		const value = (type: Intl.DateTimeFormatPartTypes) =>
			parts.find((p) => p.type === type)?.value ?? "00";

		const year = value("year");
		const month = value("month");
		const day = value("day");
		const hour = value("hour");
		const minute = value("minute");
		const second = value("second");

		const zonedWallMs = Date.UTC(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
			Number(minute),
			Number(second),
		);
		const instantSec = Math.floor(date.getTime() / 1000) * 1000;
		const offsetMinutes = Math.round((zonedWallMs - instantSec) / 60000);

		return { year, month, day, hour, minute, second, offsetMinutes };
	}

	private static formatOffset(offsetMinutes: number): string {
		const sign = offsetMinutes >= 0 ? "+" : "-";
		const abs = Math.abs(offsetMinutes);
		const hours = String(Math.floor(abs / 60)).padStart(2, "0");
		const minutes = String(abs % 60).padStart(2, "0");

		return `${sign}${hours}:${minutes}`;
	}

	private static assertValidTimezone(timezone: string): void {
		try {
			new Intl.DateTimeFormat("en-US", { timeZone: timezone });
		} catch {
			throw new Error(`Invalid timezone: ${timezone}`);
		}
	}
}
