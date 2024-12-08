// This code uses conditional checking to ONLY execute code for certain body IDs.
//---------------------------------------------------------------------//
// Initializing the calendar on the website-calendar.html page for service days each month.
$(document).ready(function () {
	if (document.body.id === "calendar-page") {
		$('#calendar-widget').datepicker({
			showOtherMonths: true,
			selectOtherMonths: true,
			firstDay: 0, // Week starts on Sunday
			dateFormat: 'mm-dd-yy',
			beforeShowDay: function (date) {
				const dayOfWeek = date.getDay();
				const dayOfMonth = date.getDate();
				const isChurchService = dayOfWeek === 0 && (dayOfMonth <= 7 || dayOfMonth >= 15);
				const isBibleStudy = dayOfWeek === 3;
				if (isChurchService) {
					return [true, 'church-service-event', 'Church Service'];
				} else if (isBibleStudy) {
					return [true, 'bible-study-event', 'Bible Study'];
				}
				return [true, '', ''];
			},
		});
	}
//---------------------------------------------------------------------//
// Code for the meetings page left-column map begins here.
	if (document.body.id === "meeting-page") { 
		console.log("Starting OpenStreetMap..");
		// This makes the OpenStreetMap iframe.
		const mapIframe = $('<iframe>', {
			id: 'mapFrame',
			src: 'https://www.openstreetmap.org/export/embed.html?bbox=-77.562969%2C35.263174%2C-77.560969%2C35.264374&layer=mapnik&marker=35.263774%2C-77.561969',
			allowfullscreen: true,
			loading: 'lazy',
		});
		$('#mapContainer').append(mapIframe);
	}
//---------------------------------------------------------------------//
// Code for the verses page begins here.
	if (document.body.id === "reading-page") {
		console.log("Setting up bible verse function...");
		
		$('.fetch-verse').on('click', function () {
			const version = $(this).data('version');
			const book = $(this).data('book');
			const chapter = $(this).data('chapter');
			const verse = $(this).data('verse');
			const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${book}/chapters/${chapter}/verses/${verse}.json`;
			
			const verseDisplay = $(this).siblings('.verse-display');
			verseDisplay.html('<p>Loading a verse...</p>').show();
			
			fetch(apiUrl)
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response failed.');
					}
					return response.json();
				})
				.then(data => {
					console.log("API response:", data);
					
					verseDisplay.html(`
						<h3>${book.charAt(0).toUpperCase() + book.slice(1)} ${chapter}:${verse} ${version.toUpperCase()}</h3>
						<p>${data.text || "No verse text available"}</p>
					`);
				})
				.catch(error => {
					console.error('Error fetching the verse:', error);
					verseDisplay.html(`
						<p style="color: red;">Could not load the verse. Please try again later.</p>
					`);
				});
		});
	}
//---------------------------------------------------------------------//
// Code for the index/home page begins here.
	if (document.body.id === "home-page") {
		console.log("Starting event calendar for addition..");
		
		$('.add-event').on('click', function () {
			const title=$(this).data('title');
			const date = $(this).data('date');
			const duration = $(this).data('duration');
			
			if (!title || !date || !duration) {
				console.error('Missing date attributes for event.');
				alert('Error: Event details missing.');
				return;
			}
			
			// Make the .ics file.
			const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formatDateForICS(date)}
DTEND:${calculateEndDate(date, duration)}
DESCRIPTION:Join us for ${title}.
LOCATION:Emmanuel Hill Free Will Baptist Church
END:VEVENT
END:VCALENDAR
`;
			
			//Helper function to make and trigger the calendar download.
			const blob= new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${title.replace(/\s+/g, `_`)}.ics`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});
		
		//Helper for making the .ics file.
		function formatDateForICS(dateString) {
			const date = new Date(dateString);
			return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
		}
		
		//Helper function to calculate the end date of events.
		function calculateEndDate(startDate, duration) {
			const [hours, minutes] = duration.split(':').map(Number);
			const date = new Date(startDate);
			date.setHours(date.getHours() + hours);
			date.setMinutes(date.getMinutes() + minutes);
			return formatDateForICS(date.toISOString());
		}
	}
//---------------------------------------------------------------------//
});