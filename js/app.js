const Model ={
	places:[
			{place:'Royal Observatory Greenwich', coor:{lat:51.477191, lng:-0.000662}},
			{place:"Bill'\s Greenwich Restaurant", coor:{lat:51.480758, lng:-0.009123}},
			{place:"Greenwich Market", coor:{lat:51.481678, lng:-0.009076}},
			{place:"The Coriander Indian Restaurant",coor:{lat:51.484716,lng:0.016883}},
			{place:"Better Gym", coor:{lat:51.485565, lng:0.008553}},
			{place:"Nova Medi Spa", coor:{lat:51.482191,lng:-0.009745}}
		],
	markers:[]
};


function appViewModel(){
	let self = this;
	self.toggleMenu = function(){
		$('body').toggleClass('menu-hidden');
	};
	self.inputPlace = ko.observable("");
	self.selectedPlaces = ko.observableArray(Model.places);
	self.filter = function(){
		let searchedplace = self.inputPlace();
		let upperCasePlaceArray = self.standardString(searchedplace);
		console.log(upperCasePlaceArray);
		let tempArray = [];
		Model.places.forEach((ele)=>{
			let include = false;
			for (let i=0; i<upperCasePlaceArray.length; i++){
				if (ele.place.includes(upperCasePlaceArray[i])){
					include = true;
					break;
				}	
			}
			if(include){
				tempArray.push(ele);
			}	
		});
		self.selectedPlaces(tempArray);
		self.updateMarkers(Model.markers, self.selectedPlaces());
		self.animateMarkers(Model.markers);
	};

	self.standardString = function(string){
		let stringArray = string.toLowerCase().split(" ");
		stringArray.forEach((string,index) => {
			let smallArray = string.split("");
			smallArray.splice(0,1,smallArray[0].toUpperCase());
			stringArray.splice(index,1,smallArray.join(""));
		})
		return stringArray;
	};
	self.reset = function(){
		self.selectedPlaces(Model.places);
		self.updateMarkers(Model.markers, Model.places);
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
	new appViewModel().makeMarkers(Model.markers, Model.places);

	Model.markers.forEach(marker =>{
		marker.addListener('click', function(){
			this.setAnimation(google.maps.Animation.BOUNCE);
		});

		marker.addListener('mouseout', function(){
			this.setAnimation(null);
		})
	})

	
};
