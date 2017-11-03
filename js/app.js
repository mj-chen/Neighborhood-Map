const Model ={
	places:[
			{place:"Greenwich Pier", coor:{lat:51.483653,lng:-0.009482}},
			{place:"Nauticalia Greenwich", coor:{lat:51.481008, lng:-0.008228}},
			{place:"Greenwich Market", coor:{lat:51.481557, lng:-0.009097}},
			{place:"Better Gym Greenwich Center ", coor:{lat:51.485568, lng:0.008575}},
			{place:"The Gipsy Moth Restaurant&Bar", coor:{lat:51.482191, lng:-0.009745}},
			{place:"O2", coor:{lat:51.502118,lng:0.004838}},
			{place:"Cutty Sark", coor:{lat:51.482847,lng:-0.009589}},
			{place:"Royal Observatory Greenwich", coor:{lat:51.477819,lng:-0.001520}},
			{place:"Paul Rhodes Bakery", coor:{lat:51.482037, lng:-0.008915}},
			{place:"Greenwich Park", coor:{lat:51.476916,lng:0.001443}},
			{place:"Island Gardens Park",coor:{lat:51.486911,lng:-0.008402}},
			{place:"Pure Gym", coor:{lat:51.476164,lng:-0.018393}}
		],
    /* Array to store the markers */
	markers:[],
    /*== asychronous API Requests to Fousquare API ==*/
	getInfo: function(position,win,mar){
		win.setMap(null);
		Model.content = "";
		/*== First request to get the place ID ==*/
		$.ajax({
			method:"GET",
			url:"https://api.foursquare.com/v2/venues/search",
			data:{
				client_id: 'FMFZ44MJ13REDKQWZ50WY11KGIFHNU50DD1JZQCOLYRLY2BZ',
    			client_secret: '4ESYZKTK124LY5ATDXALNVB024SQILBMELDOQUMXL02ERJW4',
    			ll:`${position.lat()},${position.lng()}`,
    			v:'20170801',
    			limit:1
			},
			success: function(response,status) {
				if (response.response.venues[0].id){  
				    /*== Second request to get detailed information with place ID==*/            
					$.ajax({
						method:'GET',
						url:'https://api.foursquare.com/v2/venues/'+ response.response.venues[0].id,
						data:{
							client_id: 'FMFZ44MJ13REDKQWZ50WY11KGIFHNU50DD1JZQCOLYRLY2BZ',
	    					client_secret: '4ESYZKTK124LY5ATDXALNVB024SQILBMELDOQUMXL02ERJW4',
	    					v:'20170801',
	    					limit:1
						},
						success: function(response,status){
							let venue = response.response.venue;
							if (venue.name) {
								if (venue.url) {
									Model.content += `<div><a href="${venue.url}"><h4>${venue.name}<h4></a>`;
								}else{
									Model.content += `<div><h4>${venue.name}</h4>`;
								}		
							}
							if (venue.contact.formattedPhone) {
								Model.content += `<p>Contact Num: ${venue.contact.formattedPhone}</p>`;
							}
							if (venue.contact.twitter) {
								Model.content +=`<p>Twitter: ${venue.contact.twitter}</p>`;
							}
							if (venue.contact.facebookName) {
								Model.content += `<p>Facebook: ${venue.contact.facebookName}</p>`;
							}

							if (venue.hours) {
								let openhours = `Openhours:<ul>`;
								for(i=0; i<venue.hours.timeframes.length; i++){
									openhours += `<li>${venue.hours.timeframes[i].days} <span>  <span> ${venue.hours.timeframes[i].open[0].renderedTime}</li>`;
								}
								openhours +=`</ul>`;
								Model.content += openhours;
							}
							if (venue.rating) {
								Model.content += `<p>Rating: ${venue.rating}</p>`;
							}
							if (venue.bestPhoto) {
								let url = venue.bestPhoto.prefix + '300x300' + venue.bestPhoto.suffix;
								Model.content += `<img src="${url}">`;
							}
							Model.content += `<p><img src="img/foursquare.png"><span style="color:blue;font-weight:900;font-size:1.2em;">Foursquare<span><p></div>`;
							win.setContent(Model.content);
							win.open(map,mar);
						},
						error:function(jqXHR){
							let msg = 'The information about this place can\'t be loaded!\n\n';
							msg += jqXHR.responseJSON.meta.errorDetail;
							alert(msg);
						}
					});
				}
			},
			error:function(jqXHR,textStatus){
				 let msg = 'The information about this place can\'t be loaded!\n\n';
		        if (jqXHR.status === 0) {
		            msg += 'Not connect. Verify Network.';
		        } else if (jqXHR.status == 404) {
		            msg += 'Requested page not found. [404]';
		        } else if (jqXHR.status == 500) {
		            msg += 'Internal Server Error [500].';
		        } else if (textStatus === 'parsererror') {
		            msg += 'Requested JSON parse failed.';
		        } else if (textStatus === 'timeout') {
		            msg += 'Time out error.';
		        } else if (textStatus === 'abort') {
		            msg += 'Ajax request aborted.';
		        } else {
		            msg += 'Uncaught Error.\n' + jqXHR.responseJSON.meta.errorDetail + textStatus;
		        }
		        alert(msg);
			}
		});
	},
	content:"",
	/*== an object for containing the unique infowindow created in google map ==*/
	window:{}
};

function appViewModel(){
	let self = this;
	/*== hide or show the list view ==*/
	self.toggleMenu = function(){
		$('body').toggleClass('menu-hidden');
	};
	/*== store the input string typed by users ==*/
	self.inputPlace = ko.observable();
	/*== the places displayed in the list view ==*/
	self.selectedPlaces = ko.observableArray(Model.places);
    /*== the marker matching the clicked location name==*/
	self.currentmarker;
	/*== update the list view and markers in real time at each keystroke ==*/
	self.search = function(data,event){
		if(event.key === 'Backspace'){
			self.reset();
		}else {
	     	if(self.inputPlace()){
				self.filter();
				self.animateMarkers(Model.markers);
			}
		}
	   	return true;
	};
    /*== filter the list view and markers when user type the name of place ==*/
	self.filter = function(){
		let temp = [];
		let searchedplace = self.inputPlace();
			for (let i=0; i<self.selectedPlaces().length; i++){
				let place = self.selectedPlaces()[i];
				let str = place.place;
				let n = str.search(searchedplace);
				if(n !== -1){
					temp.push(place);
				}
			}
		self.selectedPlaces(temp);
		self.updateMarkers(Model.markers, self.selectedPlaces());
	};
    /*== reset the list view and markers when user press backspace button ==*/
	self.reset = function(){
		self.selectedPlaces(Model.places);
		self.filter();
		map.setCenter({lat:51.48, lng:-0.00});
		map.setZoom(15);
		map.fitBounds()
	};
    /*== zoom in to the selected place ==*/
	self.zoom = function(){
		let latlng = self.selectedPlaces()[0].coor;
		map.setCenter(latlng);
		map.setZoom(18);
	};
    /*== update list view and marker, open the infowindow when user click the list view ==*/
	self.defineSelectedPlace = function(place){
		self.selectedPlaces([place]);
		self.inputPlace(place.place);
		self.updateMarkers(Model.markers, self.selectedPlaces());
		self.animateMarkers(Model.markers);
		Model.getInfo(self.currentmarker.getPosition(),Model.window,self.currentmarker);
	};
    /*== create markers ==*/
	self.makeMarkers = function(markerArray,placeArray){
		Model.places.forEach(place=>{
			let marker = new google.maps.Marker({
				position:place.coor,
				map:map,
				title:place.place
			});
			markerArray.push(marker);
		});
	};
    /*== filter and change visibility of markers according to the search result ==*/
	self.updateMarkers = function(markerArray,selectedPlacesArray){
		markerArray.forEach(marker=>marker.setMap(null));
		for(let i=0; i<selectedPlacesArray.length; i++){
			let selectedPlace = selectedPlacesArray[i];
			for(let j=0; j<markerArray.length; j++){
				let marker = markerArray[j];
				if(marker.title === selectedPlace.place){
					marker.setMap(map);
					self.currentmarker=marker;
					break;
				}
			}
		}
	};

	self.animateMarkers = function(markerArray){
		markerArray.forEach(marker=>{
			if(marker.getMap()){
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}
		});
	};
}

let map;
function initMap(){
	let greenwich = new google.maps.LatLng(51.48, -0.00);

	let mapOptions = {
		center: greenwich,
		zoom:15,
			mapTypeControl:true,
		mapTypeControlOptions:{
			style:google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			position: google.maps.ControlPosition.RIGHT_TOP
		},
		zoomControl:true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_CENTER
		},
		scaleControl:true,
		streetViewControl:true,
		streetViewControlOptions: {
			position:google.maps.ControlPosition.RIGHT_CENTER
		},
		fullscreenControl:true
	};

	map = new google.maps.Map(document.querySelector('#map'), mapOptions);

	let bounds = new google.maps.LatLngBounds();

	new appViewModel().makeMarkers(Model.markers, Model.places);

    /*== create an infowindow and put it in the window array in Model ==*/
	Model.window = new google.maps.InfoWindow();

    /*== add handlers for events in map ==*/
	Model.markers.forEach(marker =>{
		bounds.extend(marker.position);
		/*== a click in the marker will animate the marker and open an infowindow ==*/
		marker.addListener('click', function(){
			marker.setAnimation(google.maps.Animation.BOUNCE);
			Model.getInfo(marker.getPosition(),Model.window,marker);
		});
		/*== mouseout will stop the animation==*/
		marker.addListener('mouseout', function(){
			this.setAnimation(null);
		});
		map.fitBounds(bounds);
	});
}

