export interface TimelinesSettings {
	timelineTag: string;
	sortDirection: boolean;
}

export interface TimelineArgs {
	[key: string]: string;
}

export interface CardContainer {
	startDate: string;
	title: string;
	img: string;
	innerHTML: string;
	path: string;
	endDate: string;
	type: string;
	class: string;
}

export type NoteData = CardContainer[];
export type AllNotesData = NoteData[];