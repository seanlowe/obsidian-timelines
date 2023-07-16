import type { TimelinesSettings, TimelineArgs, AllNotesData } from './types';
import type { TFile, MarkdownView, MetadataCache, Vault } from 'obsidian';

import { RENDER_TIMELINE } from './settings';
import { FilterMDFiles, createDate, getImgUrl, parseTag } from './utils';

// Horizontal (Vis-Timeline) specific imports
import { Timeline } from "vis-timeline/esnext";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.css";

export class TimelineProcessor {
	args: TimelineArgs;
	settings: TimelinesSettings;

	constructor(settings: TimelinesSettings) {
		this.settings = settings;
		this.args = {
			tags: '',
			divHeight: '400',
			startDate: '-1000',
			endDate: '3000',
			minDate: '-3000',
			maxDate: '3000'
		};
	}

	/**
	 * Insert the statically generated timeline into the current note
	 * 
	 * @param sourceView 
	 * @param vaultFiles 
	 * @param fileCache 
	 * @param appVault 
	 */
	async insertTimelineIntoCurrentNote(sourceView: MarkdownView, vaultFiles: TFile[], fileCache: MetadataCache, appVault: Vault) {
		// @ts-ignore
		let editor = sourceView.sourceMode.cmEditor;

		if (!editor) return;

		const source = editor.getValue();
		let match = RENDER_TIMELINE.exec(source);

		if (!match || match.length === 1) return;

		let tagList = match[1];

		let div = document.createElement('div');
		let rendered = document.createElement('div');
		rendered.addClass('timeline-rendered');
		rendered.setText(new Date().toString());

		div.appendChild(document.createComment(`TIMELINE BEGIN tags='${match[1]}'`));
		await this.run(tagList, div, vaultFiles, fileCache, appVault, false);

		div.appendChild(rendered);
		div.appendChild(document.createComment('TIMELINE END'));

		editor.setValue(source.replace(match[0], div.innerHTML));
	};

	/**
	 * Read the arguments from the codeblock
	 * 
	 * @param visTimeline - whether or not we're rendering a vis-timeline
	 * @param source - the codeblock source string
	 */
	async readArguments(visTimeline: boolean, source: string) {
		if (!visTimeline) {
			// Parse the tags to search for the proper files
			let lines = source.trim();
			this.args.tags = lines;

			return;
		}

		source.split('\n').map(entry => {
			if (!entry) return;
			
			entry = entry.trim();
			let [tag, value] = entry.split('=');
			this.args[tag] = value.trim();
		});

		return;
	}

	/**
	 * Parse the list of files from the vault and extract the timeline data
	 * 
	 * @param fileList 
	 * @param appVault 
	 * @param timelineNotes - notes which have our timeline tags
	 * @param timelineDates - dates we parse from event data
	 */
	async parseFiles(fileList: TFile[], appVault: Vault, timelineNotes: AllNotesData, timelineDates: number[]) {
		for (let file of fileList) {
			const domParser = new DOMParser();
			const doc = domParser.parseFromString(await appVault.read(file), 'text/html');
			let timelineData = doc.getElementsByClassName('ob-timelines');

			for (let event of timelineData as any) {
				if (!(event instanceof HTMLElement)) continue;

				const {
					dataset: {
						startDate,
						// if no title is specified, use the note's name
						title: noteTitle = file.name,
						class: noteClass = "",
						type = "box",
						endDate = null,
						img: eventImg = null
					}
				} = event;
				const notePath = '/' + file.path;

				// check if a valid date is specified
				let noteId = (startDate[0] === '-') 
					? -parseInt(startDate.substring(1).split('-').join('')) 
					: parseInt(startDate.split('-').join(''));

				if (!Number.isInteger(noteId)) continue;

				const defaultNoteData = {
					startDate,
					title: noteTitle,
					img: getImgUrl(appVault.adapter, eventImg),
					innerHTML: event.innerHTML,
					path: notePath,
					class: noteClass,
					type,
					endDate
				}

				if (!timelineNotes[noteId]) {
					timelineNotes[noteId] = [];
					timelineNotes[noteId][0] = defaultNoteData;

					timelineDates.push(noteId);
				} else {
					let note = defaultNoteData;

					// if note_id already present prepend or append to it
					timelineNotes[noteId][this.settings.sortDirection ? 'unshift' : 'push'](note);

					console.log("Repeat date: %o", timelineNotes[noteId]);
				}
			}
		}
	}

	/**
	 * Create an internal link on the a timeline's event "note" card
	 * 
	 * @param event 
	 * @param noteCard 
	 */
	createInternalLinkOnNoteCard(event: any, noteCard: HTMLElement) {
		noteCard
			.createEl('article')
			.createEl('h3')
			.createEl('a', {
				cls: 'internal-link',
				attr: { href: `${event.path}` },
				text: event.title
			});

			return;
	}

	/**
	 * Build a vertical timeline
	 * 
	 * @param timelineDiv - the timeline html element
	 * @param timelineNotes - notes which have our timeline tags
	 * @param timelineDates - dates we parsed from event data
	 * @param el - the element to append the timeline to
	 */
	async buildVerticalTimeline(timelineDiv:HTMLElement, timelineNotes: AllNotesData, timelineDates: number[], el: HTMLElement) {
		let eventCount = 0;
		// Build the timeline html element
		for (let date of timelineDates) {
			let noteContainer = timelineDiv.createDiv({ cls: 'timeline-container' });
			let eventContainer = noteContainer.createDiv({ cls: 'timeline-event-list', attr: { 'style': 'display: block' } });
			let noteHeader = noteContainer.createEl('h2', { 
				text: timelineNotes[date][0].startDate.replace(/-0*$/g, '').replace(/-0*$/g, '').replace(/-0*$/g, '') 
			});

			noteContainer.addEventListener('click', event => {
				event.preventDefault();
				const currentStyle = eventContainer.style
				if (currentStyle.getPropertyValue('display') === 'none') {
					currentStyle.setProperty('display', 'block');
					return;
				}
				currentStyle.setProperty('display', 'none');
			});

			let alignment = eventCount % 2 == 0 ? 'left' : 'right';
			noteContainer.addClass(`timeline-${alignment}`);
			noteHeader.setAttribute('style', `text-align: ${alignment};`);

			if (!timelineNotes[date]) {
				continue;
			}

			for (let eventAtDate of timelineNotes[date]) {
				let noteCard = eventContainer.createDiv({ cls: 'timeline-card' });
				// add an image only if available
				if (eventAtDate.img) {
					noteCard.createDiv({ cls: 'thumb', attr: { style: `background-image: url(${eventAtDate.img});` } });
				}
				if (eventAtDate.class) {
					noteCard.addClass(eventAtDate.class);
				}

				this.createInternalLinkOnNoteCard(eventAtDate, noteCard)
				noteCard.createEl('p', { text: eventAtDate.innerHTML.trim() });
			}
			eventCount++;
		}

		// Replace the selected tags with the timeline html
		el.appendChild(timelineDiv);
		return;
	}

	/**
	 * Build a horizontal timeline
	 * 
	 * @param timelineDiv - the timeline html element
	 * @param timelineNotes - notes which have our timeline tags
	 * @param timelineDates - dates we parsed from event data
	 * @param el - the element to append the timeline to
	 */
	async buildHorizontalTimeline(timelineDiv: HTMLElement, timelineNotes: AllNotesData, timelineDates: number[], el: HTMLElement) {
		// Create a DataSet
		let items = new DataSet([]);

		if (!timelineDates) {
			console.log('No dates found for the timeline')
			return;
		}

		timelineDates.forEach(date => {
			// add all events at this date
			Object.values(timelineNotes[date]).forEach(event => {
				let noteCard = document.createElement('div');
				noteCard.className = 'timeline-card';

				// add an image only if available
				if (event.img) {
					noteCard.createDiv({ cls: 'thumb', attr: { style: `background-image: url(${event.img});` } });
				}

				if (event.class) {
					noteCard.addClass(event.class);
				}

				this.createInternalLinkOnNoteCard(event, noteCard)
				noteCard.createEl('p', { text: event.innerHTML });

				let startDate = event.startDate?.replace(/(.*)-\d*$/g, '$1');
				let start, end;
				if (startDate[0] == '-') {
					// handle negative year
					let startComp = startDate.substring(1, startDate.length).split('-');
					start = new Date(+`-${startComp[0]}`, +startComp[1], +startComp[2]);
				} else {
					start = new Date(startDate);
				}

				let endDate = event.endDate?.replace(/(.*)-\d*$/g, '$1');
				if (endDate && endDate[0] == '-') {
					// handle negative year
					let endComp = endDate.substring(1, endDate.length).split('-');
					end = new Date(+`-${endComp[0]}`, +endComp[1], +endComp[2]);
				} else {
					end = new Date(endDate);
				}

				if (start.toString() === 'Invalid Date') {
					return;
				}

				if ((event.type === "range" || event.type === "background") && end.toString() === 'Invalid Date') {
					return;
				}

				// Add Event data
				items.add({
					id: items.length + 1,
					content: event.title ?? '',
					title: noteCard.outerHTML,
					start: start,
					className: event.class ?? '',
					type: event.type,
					end: end ?? null
				});
			});
		});

		// Configuration for the Timeline
		let options = {
			start: createDate(this.args.startDate),
			end: createDate(this.args.endDate),
			min: createDate(this.args.minDate),
			max: createDate(this.args.maxDate),
			minHeight: Number(this.args.divHeight),
			showCurrentTime: false,
			showTooltips: false,
			template: function (item: any) {
				let eventContainer = document.createElement('div');
				eventContainer.setText(item.content);

				let eventCard = eventContainer.createDiv();
				eventCard.outerHTML = item.title;

				eventContainer.addEventListener('click', event => {
					let el = (eventContainer.getElementsByClassName('timeline-card')[0] as HTMLElement);
					el.style.setProperty('display', 'block');
					el.style.setProperty('top', `-${el.clientHeight + 10}px`);
				});

				return eventContainer;
			}
		};

		// Create a Timeline
		timelineDiv.setAttribute('class', 'timeline-vis');
		new Timeline(timelineDiv, items, options);

		// Replace the selected tags with the timeline html
		el.appendChild(timelineDiv);
	}

	async run(source: string, el: HTMLElement, vaultFiles: TFile[], fileCache: MetadataCache, appVault: Vault, visTimeline: boolean) {
		// read arguments
		await this.readArguments(visTimeline, source);

		let tagList: string[] = [];
		this.args.tags.split(";").forEach((tag: string) => parseTag(tag, tagList));
		tagList.push(this.settings.timelineTag);

		// Filter all markdown files to only those containing the tag list
		let fileList = vaultFiles.filter(file => FilterMDFiles(file, tagList, fileCache));
		if (!fileList) return;

		// Keep only the files that have the time info
		let timelineNotes = [] as AllNotesData;
		let timelineDates = [] as number[];

		await this.parseFiles(fileList, appVault, timelineNotes, timelineDates)

		// Sort events based on setting
		timelineDates = timelineDates.sort((d1, d2) => {
			return this.settings.sortDirection ? d1 - d2 : d2 - d1;
		});

		let timelineDiv = document.createElement('div');
		timelineDiv.setAttribute('class', 'timeline');

		if (!visTimeline) {
			await this.buildVerticalTimeline(timelineDiv, timelineNotes, timelineDates, el);
			return;
		}

		await this.buildHorizontalTimeline(timelineDiv, timelineNotes, timelineDates, el);
		return;
	}
}
