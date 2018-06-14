

App overview - what is it? 
	Created on Nov 9 2017, Neighborhood Map APP is a single page application featuring a map of Greenwich in London and listing some interesting places to visit in this neighborhood such as restaurant, gym, attraction and leisure park. It allows you to easily and quickly know Greenwich neighborhood and obtain detailed information about various places you are interested in. You save time by not needing to search information from many different sites. It can be used in both your PC and smartphone. 

APP installation - how to get it?
	. Either download or clone a zip of this repository at https://github.com/mj-chen/Neighborhood-Map
	. In a terminal window
		cd into Neighborhood map directory 
		npm install 
		npm start 

APP functions - how to use it?
	. The application will load by default a Google map with a bunch of markers indicating all the interesting places in Greenwich London. 
	. If you use the application in your PC, a list featuring the name of all the marked places will be loaded instantly. If you are on your smart phone with small screen, the list will be hide by defaut. Click the hamburger menu icon to hide or show the list. 
	. Type the name or a key word of the place you want to search in the text input area. The application will filter and update in real time both the list and the markers according to your input, displaying only the search results. 
	. By clicking either the place name in the list view or the corresponding marker on the map, an information window will be opened just above the marker. We utilise here Foursquare API to retrieve detailed information about this place.
	. The zoom button will bring you closer to a selected location. Click the place name in the list view and then click the zoom button, the map will be zoomed into that place. If you click directly the zoom button without clicking a name place first, it's the first place in the list view that will be selected automatically. 




