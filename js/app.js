
let map, 
bounds,
content,
infowindow,
markers=[];

function initMap(){
	let greenwich = new google.maps.LatLng(51.48, -0.00);
	let mapOptions = {
		center: greenwich,
		zoom:15,
		mapTypeControl:true,
		mapTypeControlOptions: {
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
	bounds = new google.maps.LatLngBounds();
	infowindow = new google.maps.InfoWindow();
	/*== Adjust the map bounds when the infowindow is closed in order to ensure that the sure can see all the markers in the map ==*/
	infowindow.addListener('closeclick', ()=>map.fitBounds(bounds));
}

function mapError(event){
	let message = `${event.type} \nGoogle Map can\'t be loaded `;
	alert(message);
	console.log(event);
}	

/*== Try to ensure that this function won't be executed before the google map and DOM is ready as this function depends on google map,
 but I don't know if I did it correctly==*/
$.when($.ready).then(function(){
	fetch('js/Data.json',{
		method:'get'
	}).then(response => response.json()
		).then(data =>{
			let Places = data;
			function appViewModel(){
				let self = this;
				/*== hide or show the list view ==*/
				self.toggle = ko.observable(true);
				self.toggleMenu = function(){
					self.toggle(!self.toggle());
				};
				/*== store the input string typed by users ==*/
				self.inputPlace = ko.observable();
				/*== the places displayed in the list view ==*/
				self.selectedPlaces = ko.observableArray(Places);
				/*== the marker matching the clicked location name==*/
				self.currentmarker = {};
				/*== update the list view and markers in real time at each keystroke ==*/
				self.search = function(data,event){
					if(event.key === 'Backspace'){
						self.reset();
					}else{
				     	if(self.inputPlace()){
							self.filter();
							self.animateMarkers(markers);
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
					self.updateMarkers(markers, self.selectedPlaces());
				};
				/*== reset the list view and markers when user press backspace button ==*/
				self.reset = function(){
					self.selectedPlaces(Places);
					self.filter();
				};
				/*== zoom in to the selected place ==*/
				self.zoom = function(){
					let latlng = self.selectedPlaces()[0].coor;
					map.setCenter(latlng);
					map.setZoom(18);
				};
				/*== update list view and marker, open the infowindow when user click the list view ==*/
				self.defineSelectedPlace = function(place){
					self.updateMarkers(markers, place.place);
					self.animateMarkers(markers);
					self.getInfo(self.currentmarker.getPosition(),infowindow,self.currentmarker);
				};
				/*== create markers ==*/
				Places.forEach(place=>{
					let marker = new google.maps.Marker({
						position:place.coor,
						map:map,
						title:place.place
					});
					markers.push(marker);
				});
				/*== add handlers for events in map ==*/
				markers.forEach(marker =>{
					bounds.extend(marker.position);
					/*== a click in the marker will animate the marker and open an infowindow ==*/
					marker.addListener('click', function(){
						marker.setAnimation(google.maps.Animation.BOUNCE);
						self.getInfo(marker.getPosition(),infowindow,marker);
					});
					/*== mouseout will stop the animation==*/
					marker.addListener('mouseout', function(){
						this.setAnimation(null);
					});
					map.fitBounds(bounds);
				});
				google.maps.event.addDomListener(window, 'resize', ()=>{map.fitBounds(bounds);});
				/*== filter and change visibility of markers according to the search result ==*/
				self.updateMarkers = function(markerArray,selectedPlaces){
					markerArray.forEach(marker=>marker.setMap(null));
					if(selectedPlaces instanceof Array){
						for(let i=0; i<selectedPlaces.length; i++){
							let selectedPlace = selectedPlaces[i];
							for(let j=0; j<markerArray.length; j++){
								let marker = markerArray[j];
								if(marker.title === selectedPlace.place){
									marker.setMap(map);
									break;
								}
							}
						}
					}else{
						for(let j=0; j<markerArray.length; j++){
							let marker = markerArray[j];
							if(marker.title === selectedPlaces){
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
				/*== asychronous API Requests to Fousquare API ==*/
				self.getInfo = function(position,win,mar){
					win.setMap(null);
					content = "";
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
						success: function(response,status){
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
												content += `<div><a href="${venue.url}"><h4>${venue.name}<h4></a>`;
											}else{
												content += `<div><h4>${venue.name}</h4>`;
											}		
										}
										if (venue.contact.formattedPhone) {
											content += `<p>Contact Num: ${venue.contact.formattedPhone}</p>`;
										}
										if (venue.contact.twitter) {
											content +=`<p>Twitter: ${venue.contact.twitter}</p>`;
										}
										if (venue.contact.facebookName) {
											content += `<p>Facebook: ${venue.contact.facebookName}</p>`;
										}
										if (venue.hours) {
											let openhours = `Openhours:<ul>`;
											for(let i=0; i<venue.hours.timeframes.length; i++){
												openhours += `<li>${venue.hours.timeframes[i].days} <span>  <span> ${venue.hours.timeframes[i].open[0].renderedTime}</li>`;
											}
											openhours +=`</ul>`;
											content += openhours;
										}
										if (venue.rating) {
											content += `<p>Rating: ${venue.rating}</p>`;
										}
										if (venue.bestPhoto) {
											let url = venue.bestPhoto.prefix + '300x300' + venue.bestPhoto.suffix;
											content += `<img src="${url}">`;
										}
										content += `<p><img src="img/foursquare.png"><span style="color:blue;font-weight:900;font-size:1.2em;">Foursquare<span><p></div>`;
										win.setContent(content);
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
				       		if (jqXHR.status === 0){
				            	msg += 'Not connect. Verify Network.';
				       	 	} else if (jqXHR.status == 404){
				            	msg += 'Requested page not found. [404]';
				        	} else if (jqXHR.status == 500){
				            	msg += 'Internal Server Error [500].';
				        	} else if (textStatus === 'parsererror'){
				            	msg += 'Requested JSON parse failed.';
				        	} else if (textStatus === 'timeout'){
				            	msg += 'Time out error.';
				        	} else if (textStatus === 'abort'){
				           	 msg += 'Ajax request aborted.';
				        	} else{
				            	msg += 'Uncaught Error.\n' + jqXHR.responseJSON.meta.errorDetail + textStatus;
				        	}
				        	alert(msg);
						}
					});
				};
			}
			const vm = new appViewModel();
			ko.applyBindings(vm);
		}).catch(err => {
			$('nav').append("<p>Oh!Places information can't be fetched!</p>")
		});
});


		




