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
	markers:[],
	getInfo: function(position,win,mar){
		win.setMap(null);
		Model.content = "";
		//win.setContent("");
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
				console.log(response);
				if (response.response.venues[0].id){           
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
								Model.content += `<img src="${url}">`
							}
							Model.content += `<p><img src="img/foursquare.png"> <span style="color:blue;font-weight:900;font-size:1.2em;">Foursquare<span> <p></div>`
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
		        console.log(textStatus);
			}
		});
	},
	content:"",
	window:[]
};

function appViewModel(){
	let self = this;
	self.toggleMenu = function(){
		$('body').toggleClass('menu-hidden');
	};
	self.inputPlace = ko.observable();
	self.selectedPlaces = ko.observableArray(Model.places);
	self.currentmarker;
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

	self.reset = function(){
		console.log('back')
		self.selectedPlaces(Model.places);
		self.filter();
		map.setCenter({lat:51.48, lng:-0.00});
		map.setZoom(15);
	}

	self.zoom = function(){
		let latlng = self.selectedPlaces()[0].coor;
		console.log(latlng)
		map.setCenter(latlng);
		map.setZoom(18);
	}

	self.standardString = function(string){
		let stringArray = string.toLowerCase().split(" ");
		stringArray.forEach((string,index) => {
			let smallArray = string.split("");
			smallArray.splice(0,1,smallArray[0].toUpperCase());
			stringArray.splice(index,1,smallArray.join(""));
		})
		return stringArray;
	};

	self.defineSelectedPlace = function(place){
		self.selectedPlaces([place]);
		self.inputPlace(place.place);
		self.updateMarkers(Model.markers, self.selectedPlaces());
		self.animateMarkers(Model.markers);
		console.log(self.currentmarker);
		Model.getInfo(self.currentmarker.getPosition(),Model.window[0],self.currentmarker);
	};

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
	}
};

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
	Model.window.push(new google.maps.InfoWindow());
	Model.markers.forEach(marker =>{
		bounds.extend(marker.position);
		marker.addListener('click', function(){
			marker.setAnimation(google.maps.Animation.BOUNCE);
			Model.getInfo(marker.getPosition(),Model.window[0],marker);
		});
		marker.addListener('mouseout', function(){
			this.setAnimation(null);
		})
		map.fitBounds(bounds);
	})
};
