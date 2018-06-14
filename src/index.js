
import './main.css'
import foursquare from './img/foursquare.png'

let map, 
bounds,
content,
infowindow,
markers=[];

const places = 
[
	{ "place": "Greenwich Pier", "coor": { "lat": 51.483653, "lng": -0.009482 } },
	{ "place": "Nauticalia Greenwich", "coor": { "lat": 51.481008, "lng": -0.008228 } },
	{ "place": "Greenwich Market", "coor": { "lat": 51.481557, "lng": -0.009097 } },
	{ "place": "Better Gym Greenwich Center", "coor": { "lat": 51.485568, "lng": 0.008575 } },
	{ "place": "The Gipsy Moth Restaurant&Bar", "coor": { "lat": 51.482191, "lng": -0.009745 } },
	{ "place": "O2", "coor": { "lat": 51.502118, "lng": 0.004838 } },
	{ "place": "Cutty Sark", "coor": { "lat": 51.482847, "lng": -0.009589 } },
	{ "place": "Royal Observatory Greenwich", "coor": { "lat": 51.477819, "lng": -0.001520 } },
	{ "place": "Paul Rhodes Bakery", "coor": { "lat": 51.482037, "lng": -0.008915 } },
	{ "place": "Greenwich Park", "coor": { "lat": 51.476916, "lng": 0.001443 } },
	{ "place": "Island Gardens Park", "coor": { "lat": 51.486911, "lng": -0.008402 } },
	{ "place": "Pure Gym", "coor": { "lat": 51.476164, "lng": -0.018393 } }
]


class appViewModel{
	constructor(){
		this.toggle = ko.observable(true)
		this.inputPlace = ko.observable();
		this.selectedPlaces = ko.observableArray();
		places.forEach(loc=>this.selectedPlaces.push(new Location(loc)))
		map.fitBounds(bounds)
		this.filteredLocations = ko.computed(()=>{
			if(!this.inputPlace()|| this.inputPlace().trim() === ''){
				this.selectedPlaces().forEach(loc=>loc.marker.setVisible(true))
				map.fitBounds(bounds);
				return this.selectedPlaces();
			}else{
				return ko.utils.arrayFilter(this.selectedPlaces(), (loc)=>{
					let isMatch = loc.name.toLowerCase().indexOf(this.inputPlace().toLowerCase()) !== -1;
					loc.marker.setVisible(isMatch)
					return isMatch
				})
			}
		})
		this.defineFilteredLocation=(loc)=>{
			this.inputPlace(loc.name)
			google.maps.event.trigger(loc.marker, 'click')
		}
	}
	toggleMenu(){
		this.toggle(!this.toggle())
	}
	zoom(){
		const latlng = this.filteredLocations()[0].marker.getPosition()
		map.setCenter(latlng);
		map.setZoom(18);
	}
}

class Location{
	constructor(loc){
		this.name = loc.place;
		this.lat = loc.coor.lat;
		this.lng = loc.coor.lng;
		this.marker = this.createMarker(loc)
	}
	createMarker(loc){
		let latLng = new google.maps.LatLng(this.lat, this.lng);
		let marker = new google.maps.Marker({
			map:map,
			title:this.name,
			position:latLng,
			animation:google.maps.Animation.DROP
		});
		marker.addListener('click',()=>{
			marker.setAnimation(google.maps.Animation.BOUNCE);
			this.getInfo(latLng, infowindow, marker);
		})
		marker.addListener('mouseout', () =>{
			 marker.setAnimation(null);
		});
		bounds.extend(latLng);
		map.fitBounds(bounds);
		return marker
	};
	getInfo(position, win, mar){
		win.setMap(null);
		content = "";
		/*== First request to get the place ID ==*/
		$.ajax({
			method: "GET",
			url: "https://api.foursquare.com/v2/venues/search",
			data: {
				client_id: 'FMFZ44MJ13REDKQWZ50WY11KGIFHNU50DD1JZQCOLYRLY2BZ',
				client_secret: '4ESYZKTK124LY5ATDXALNVB024SQILBMELDOQUMXL02ERJW4',
				ll: `${position.lat()},${position.lng()}`,
				v: '20170801',
				limit: 1
			}
		})
			.done((response, status) => {
				if (response.response.venues[0].id) {
					/*== Second request to get detailed information with place ID==*/
					$.ajax({
						method: 'GET',
						url: 'https://api.foursquare.com/v2/venues/' + response.response.venues[0].id,
						data: {
							client_id: 'FMFZ44MJ13REDKQWZ50WY11KGIFHNU50DD1JZQCOLYRLY2BZ',
							client_secret: '4ESYZKTK124LY5ATDXALNVB024SQILBMELDOQUMXL02ERJW4',
							v: '20170801',
							limit: 1
						}
					})
						.done((response, status) => {
							let venue = response.response.venue;
							if (venue.name) {
								if (venue.url) {
									content += `<div><a href="${venue.url}"><h4>${venue.name}<h4></a>`;
								} else {
									content += `<div><h4>${venue.name}</h4>`;
								}
							}
							if (venue.contact.formattedPhone) {
								content += `<p>Contact Num: ${venue.contact.formattedPhone}</p>`;
							}
							if (venue.contact.twitter) {
								content += `<p>Twitter: ${venue.contact.twitter}</p>`;
							}
							if (venue.contact.facebookName) {
								content += `<p>Facebook: ${venue.contact.facebookName}</p>`;
							}
							if (venue.hours) {
								let openhours = `Openhours:<ul>`;
								for (let i = 0; i < venue.hours.timeframes.length; i++) {
									openhours += `<li>${venue.hours.timeframes[i].days} <span>  <span> ${venue.hours.timeframes[i].open[0].renderedTime}</li>`;
								}
								openhours += `</ul>`;
								content += openhours;
							}
							if (venue.rating) {
								content += `<p>Rating: ${venue.rating}</p>`;
							}
							if (venue.bestPhoto) {
								let url = venue.bestPhoto.prefix + '300x300' + venue.bestPhoto.suffix;
								content += `<img src="${url}">`;
							}
							content += `<p><img src="${foursquare}"><span style="color:blue;font-weight:900;font-size:1.2em;">Foursquare<span><p></div>`;
							win.setContent(content);
							win.open(map, mar);
						})
						.fail(jqXHR =>this.errorHandler(jqXHR));
				}
			})
			.fail(jqXHR =>this.errorHandler(jqXHR));
	};
	errorHandler(errorObject) {
		let msg = '\nThe information about this place can\'t be loaded!\n\n';
		if (errorObject.status === 0) {
			msg += 'Not connect. Verify Network.';
		} else if (errorObject.status == 404) {
			msg += 'Requested page not found. [404]';
		} else if (errorObject.status == 500) {
			msg += 'Internal Server Error [500].';
		} else if (errorObject === 'parsererror') {
			msg += 'Requested JSON parse failed.';
		} else if (errorObject === 'timeout') {
			msg += 'Time out error.';
		} else if (errorObject === 'abort') {
			msg += 'Ajax request aborted.';
		} else {
			msg += 'Uncaught Error.\n';
		}
		alert(msg);
	};	
}

window.onload = function initMap() {
	let greenwich = new google.maps.LatLng(51.48, -0.00);
	let mapOptions = {
		center: greenwich,
		zoom: 15,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			position: google.maps.ControlPosition.RIGHT_TOP
		},
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_CENTER
		},
		scaleControl: true,
		streetViewControl: true,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.RIGHT_CENTER
		},
		fullscreenControl: true
	};
	map = new google.maps.Map(document.querySelector('#map'), mapOptions);
	bounds = new google.maps.LatLngBounds();
	infowindow = new google.maps.InfoWindow();

	ko.applyBindings(new appViewModel());
}

function mapError(event) {
	let message = `${event.type} \nGoogle Map can\'t be loaded `;
	alert(message);
	console.log(event);
}	



		



		




