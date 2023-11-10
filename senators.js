
//call the getJSON function after the webpage loads.
document.addEventListener("DOMContentLoaded", function() {
	getJSON()
		//since getJSON is an async function, we determine what happens when the returned promise is resolved or rejected using .then and .catch blocks.
		.then(senatorArray => {
			totalSenators(senatorArray);
			leadershipSenators(senatorArray);
			let lists = createDropdowns(senatorArray);
			populateDropDowns(lists)
			getUserSelections(senatorArray);
			moreInfoOnClick();
		})
		.catch(error => {
			//print the error to the console. just here for debugging. will be executed if there is an error in any of the functions called above in the .then block.
			//Network and Fetch errors are handeled in the getJSON function.
			console.error('There was a problem:', error);
		});
});


async function getJSON() {
	try {
		const url = "json/senators.json";
		const promise = await fetch(url);

		// Check if request successful
		if (!promise.ok) {
			throw new Error(
				`HTTP error! status: ${promise.status} <br> The Page/file You Are Looking For Does NOT Exist.`
			);
		}
		const data = await promise.json(); // Data containing both meta info and senators array
		// Validate that data.objects is an array
		if (!Array.isArray(data.objects)) {
			throw new Error("Fetched Data Is Not In The Expected Format.");
		}

		const senatorArray = data.objects; // Take only objects from array
		return senatorArray;

	} catch (error) {
		hideContent(error);
		return; // Exit the function if error
	}
}


// Function to hide content in case of an error 
function hideContent(error) {
	document.querySelector('.main').classList.add('infoHidden');
	document.querySelector('aside').classList.add('infoHidden');
	document.getElementById('error').classList.remove('infoHidden');
	document.getElementById('error').innerHTML = error.message;
}

// Total number of senators in each party.
function totalSenators(arr) {
	// Function that takes array of objects with info about senators as argument and returns the total number of senators in each party.
	// Retrieves the unique parties from all objects.
	let allParties = []
	for (let i = 0; i < arr.length; i++) {
		let senator = arr[i];
		if (!allParties.includes(senator.party)) {
			allParties.push(senator.party);
		}
	}

	// Loop through the json data to count the number of senators in each party.
	// Data object has all info about senators. data[i] has info about a particular senator.
	let summary = "";
	for (let i = 0; i < allParties.length; i++) {
		let party = allParties[i];
		let totalSenatorsInThatParty = 0;
		for (let j = 0; j < arr.length; j++) {
			let senator = arr[j];

			if (senator.party == party) {
				totalSenatorsInThatParty += 1;
			}

		}
		//add the results to the HTML page.
		summary += `<p><span>${totalSenatorsInThatParty}</span><br>Senators are<br><span>${party}<span></div>`;
		document.getElementById("summary").innerHTML = summary;
	}
}


// Step 1B. Senators by Leadership Role
function leadershipSenators(arr) {
	// Function to populate the senator leaders section 
	let sortedSenators = sortSenators(arr)

	// Define lists to hold senate leaders
	let leaders = "";
	sortedSenators.forEach(senator => { // forEach used since only returning side effects
		if (senator.leadership_title) { // Show only senators with a valid leadership title
			leaders += `
					<p>
					<span class="leader">${senator.leadership_title}:</span> 
					<span class="name">${senator.person.firstname} ${senator.person.lastname}</span> 
					<span class="party">(${senator.party})</span>
					</p>
					<hr>`;
		}
	});

	document.getElementById("roles").innerHTML = leaders; // Add leaders to their HTML div 
}


function sortSenators(arr) {
	// Sort JSON array in place by party then state
	// Compares unicode values for array elements, rearranges by return value 
	arr.sort((currentSenator, nextSenator) => {
		if (currentSenator.party < nextSenator.party) { // Sort by party 
			return -1; 	// Keep order 
		}
		if (currentSenator.party > nextSenator.party) {
			return 1; 	// Swap order  
		}
		if (currentSenator.state < nextSenator.state) { // Sort by state
			return -1;
		}
		if (currentSenator.state > nextSenator.state) {
			return 1;
		}
		return 0;
	});

	return arr; // Returns the sorted array
}


// Step 3. Filters
function createDropdowns(arr) {
	//a function that gets the unique parties, states, and ranks from the json data.

	document.getElementById('part2-3').insertAdjacentHTML('afterbegin', '<h1>Details of All Senators</h1>'); //add a new header to html page.

	let parties = ["Show All"];
	let states = [];
	let ranks = ["Show All"];
	for (let i = 0; i < arr.length; i++) {
		let senator = arr[i];
		if (!parties.includes(senator.party)) {
			parties.push(senator.party);
		}
		if (!states.includes(senator.state)) {
			states.push(senator.state);
		}
		if (!ranks.includes(senator.senator_rank)) {
			ranks.push(senator.senator_rank);
		}
	}

	states.sort(); //sort the states alphabetically in the drop-down list.
	states.unshift("Show All") //add the show all option to the states.
	return [parties, states, ranks];


}


function populateDropDowns(lists) {
	// a function that populates the dropdown menus with the unique values stores in the lists argument
	//lists argument is an array of arrays.
	let partiesDropdown = document.getElementById('parties-dropdown');
	let statesDropdown = document.getElementById('states-dropdown');
	let ranksDropdown = document.getElementById('ranks-dropdown');

	let dropdowns = [partiesDropdown, statesDropdown, ranksDropdown];
	// Populate the ranks dropdown from the array
	let counter = 0;
	for (let list of lists) {
		for (let i = 0; i < list.length; i++) {
			let option = document.createElement('option');
			option.value = list[i];
			option.textContent = list[i];
			let dropdown = dropdowns[counter];
			dropdown.appendChild(option);
		}
		counter += 1;
	}

}


function getUserSelections(arr) {
	// Get what the user selected from the dropdown menus, it also calls the filter function when the user selects a new value from the dropdown.
	let selectedParty = "Show All";
	let selectedState = "Show All";
	let selectedRank = "Show All";

	filterSenators(arr, selectedParty, selectedState, selectedRank);

	//add event listeners to each dropdown. after each selection, call the filter function.
	let partyDropdown = document.getElementById('parties-dropdown');
	partyDropdown.addEventListener('change', function() {
		selectedParty = this.value;
		filterSenators(arr, selectedParty, selectedState, selectedRank);
	});

	let statesDropdown = document.getElementById('states-dropdown');
	statesDropdown.addEventListener('change', function() {
		selectedState = this.value;
		filterSenators(arr, selectedParty, selectedState, selectedRank);
	});

	let ranksDropdown = document.getElementById('ranks-dropdown');
	ranksDropdown.addEventListener('change', function() {
		selectedRank = this.value;
		filterSenators(arr, selectedParty, selectedState, selectedRank);
	});

}


function filterSenators(arr, partyFilter, stateFilter, rankFilter) {
	// a function that filters the data based on the user selection.

	// Apply the filters one after the other.
	let partyFilteredArray = [];
	let stateFilteredArray = [];
	let rankFilteredArray = [];
	let filteredArray = [];


	//Only include senators who are in the selected party
	if (partyFilter == "Show All") {
		partyFilteredArray = arr;
	} else {
		for (let k = 0; k < arr.length; k++) {
			let senator = arr[k];
			if (senator.party == partyFilter) {
				partyFilteredArray.push(senator);
			}
		}
	}

	// Only include senators who are from the selected state and selected party.
	if (stateFilter == "Show All") {
		stateFilteredArray = partyFilteredArray;
	} else {
		for (let k = 0; k < partyFilteredArray.length; k++) {
			let senator = partyFilteredArray[k];
			if (senator.state == stateFilter) {
				stateFilteredArray.push(senator);
			}
		}
	}

	// Only include senators with the selected rank, state and party.
	if (rankFilter == "Show All") {
		rankFilteredArray = stateFilteredArray;
	} else {
		for (let k = 0; k < stateFilteredArray.length; k++) {
			let senator = stateFilteredArray[k];
			if (senator.senator_rank == rankFilter) {
				rankFilteredArray.push(senator);
			}
		}
	}

	filteredArray = rankFilteredArray;

	//sort the data if the users wishes to do so.
	// clicking on the field for the first time sorts it in ascending order and the second click reverses it and so on.
	//this object keeps track of the sorting direction (ascending, descending) for each field.
	let sortOrderTracker = {
		"person.firstname": 1,
		"party": 1,
		"state": 1,
		"person.gender": 1,
		"senator_rank": 1,
	};

	let selections = [document.getElementById("empty")]; //keep track of all selections, first element is a non-usable header just for data consistency.
	document.getElementById('head').addEventListener('click', function(event) {
		// Check if the clicked element is a TH (table header) cell
		if (event.target && event.target.nodeName === 'TH') {
			let headerName = event.target.textContent;		//get the name of the header cell clicked.
			selections.push(event.target);					//keep record of all selections.
			let pureName = headerName.split(" ");
			//use switch to map the name of the header to how it appears in the json data.
			switch (pureName[0]) {
				case "Senator":
					headerName = "person.firstname";
					break;
				case "Party":
					headerName = "party";
					break;
				case "State":
					headerName = "state";
					break;
				case "Gender":
					headerName = "person.gender";
					break;
				case "Rank":
					headerName = "senator_rank";
					break;
			}

			//add arrows to the header that indicates the sorting direction (ascending, descending).
			if (sortOrderTracker[headerName] == 1 && pureName[0] !== "US") {
				event.target.innerHTML = pureName[0] + " &#x2B06";

			} else if (sortOrderTracker[headerName] == -1 && pureName[0] !== "US") {
				event.target.innerHTML = pureName[0] + " &#x2B07";

			}

			//sort by the column selected from the table
			sortSenatorsByAttribute(filteredArray, headerName, sortOrderTracker[headerName]);
			sortOrderTracker[headerName] *= -1;	//switch the direction of sorting for the column selected for next click on it.

			//reset the visual indicators if the user selects a new field for sorting.
			let previousSelection = selections[selections.length - 2];
			let currentSelection = selections[selections.length - 1];

			if (previousSelection !== currentSelection) {
				let text = previousSelection.textContent.split(" ")
				if (previousSelection !== document.getElementById("empty")) {
					previousSelection.innerHTML = text[0] + " &#x2195;";

				}
			}
		}
	});

	displaySenators(filteredArray);
}


// 
function sortSenatorsByAttribute(filteredArray, attribute, sortOrder) {
	//a function that sorts the data by a given attribute.
	attribute = attribute.split(".");	//the value of the needed attribute might be nested (senator.person.firstname) so we split it to be able to track it.
	//use sort function
	filteredArray.sort((currentSenator, nextSenator) => {
		//determine the attribute that will be used in sorting.
		let currentSenatorTopAttribute = currentSenator[attribute[0]];
		let nextSenatorTopAttribute = nextSenator[attribute[0]];

		//if statement used for the case when the value of the attribute is nested (e.g. senator.person.firstname).
		if (attribute.length == 2) {
			if (currentSenatorTopAttribute[attribute[1]] < nextSenatorTopAttribute[attribute[1]]) {
				return -1 * sortOrder;	//multiply by sortOrder to reverse the direciton of sorting on every other click.
			}
			if (currentSenatorTopAttribute[attribute[1]] > nextSenatorTopAttribute[attribute[1]]) {
				return 1 * sortOrder;
			}
			return 0;
		} else { //this is for the case when there is no nesting (e.g. senator.state).
			if (currentSenatorTopAttribute < nextSenatorTopAttribute) {
				return -1 * sortOrder;
			}
			if (currentSenatorTopAttribute > nextSenatorTopAttribute) {
				return 1 * sortOrder;
			}
			return 0;
		}
	}

	);
	displaySenators(filteredArray);

}

function displaySenators(filteredArray) {
	//a function that displays the filtered and sorted senators on the table.
	let displayedSenators = "";

	//show a message if nothing matches the filters.
	if (filteredArray.length == 0) {
		displayedSenators = `
		<tr style="cursor:default;">
		<td colspan="6" style="cursor:default; font-size:1.5rem;">
		No Senators That Match The Above Filters Were Found!
		</td>`
	}

	//loop through the filtered data and create the table structure.
	for (let i = 0; i < filteredArray.length; i++) {

		const birthday = formatDate(filteredArray[i].person.birthday);
		const startDate = formatDate(filteredArray[i].startdate);
		let twitter = "";
		let youtube = "";

		// If twitter or youtube information is included in JSON, add.
		if (filteredArray[i].person.twitterid) {
			twitter = `
						<li>
							Twitter ID: ${filteredArray[i].person.twitterid}
						</li>`;
		}
		if (filteredArray[i].person.youtube) {
			youtube = `
						<li>
							Twitter ID: ${filteredArray[i].person.youtube}
						</li>
						`;
		}
		// This generates the html for the senators table from json
		displayedSenators += `
							<tr>
								<td>\u2795</td>
								<td>
									${filteredArray[i].person.firstname} 
									${filteredArray[i].person.lastname}
								</td> 
								<td>${filteredArray[i].party}</td>
								<td>${filteredArray[i].state}</td>
								<td>${filteredArray[i].person.gender}</td>
								<td>${filteredArray[i].senator_rank}</td>
							</tr>	  
							<tr class="moreInfo infoHidden">
							<td colspan="6">
								<ul>
									<li>
										Office: ${filteredArray[i].extra.office}
									</li>
									<li>
										Senator's birthdate: ${birthday}
									</li>
									<li>
										First day in office: ${startDate}
									</li>
										${twitter}
										${youtube}
									<li>
										<a href="${filteredArray[i].website}" target="_blank"> ${filteredArray[i].website}</a>
									</li>
								</ul>
							</td>
							</tr>`;
	}
	//add the row to the table.
	document.getElementById("senatorListAll").innerHTML = displayedSenators;
}



function formatDate(jsonDate) { // Helper function to format json date

	if (!jsonDate) { // If date is invalid, leave out.
		return '';
	}
	const date = new Date(jsonDate); // Creates date object with built in methods for formatting
	const options = { month: 'long', day: 'numeric', year: 'numeric' };
	return date.toLocaleDateString('en-GB', options); // toLocale... is built in js method for date obj.
}

// PART 4 
function moreInfoOnClick() {
	// Add event listener to the table body. Listen for click on a table cell. 
	const senTableBody = document.getElementById("senatorListAll");

	senTableBody.addEventListener("click", function(event) {
		let clickedElement = event.target; // Target refers to the element where event occurs

		if (clickedElement.nodeName === 'TD') {
			let clickedRow = clickedElement.closest('tr');
			const senatorInfo = clickedRow.nextElementSibling;
			const plusSign = clickedRow.querySelector('td:first-child');

			// Toggle the class to make info visible when clicked, invisible when clicked again
			if (senatorInfo && (senatorInfo.classList.contains("infoHidden") || senatorInfo.classList.contains("infoShow"))) {
				senatorInfo.classList.toggle("infoShow");
				senatorInfo.classList.toggle("infoHidden");
				if (plusSign.textContent === '\u2795') {		//visual indicators for when more info is shown/hidden
					plusSign.textContent = '\u2796';
				} else {
					plusSign.textContent = '\u2795';
				}
			}
		}
	});
}
document.getElementById('s').addEventListener('click', function() {
	window.location.href = '#part1A';
});

document.getElementById('L').addEventListener('click', function() {
	window.location.href = '#part1B';
});

document.getElementById('D').addEventListener('click', function() {
	window.location.href = '#part2-3';
});


