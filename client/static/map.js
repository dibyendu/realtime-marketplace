require([
	'esri/map',
	'esri/dijit/Search',
	'esri/tasks/locator',
	'esri/geometry/Point',
	'esri/InfoTemplate',
	'esri/graphic',
	'esri/symbols/PictureMarkerSymbol',
	'dojo/domReady!'
], function(
	Map,
	Search,
	Locator,
	Point,
	InfoTemplate,
	Graphic,
	PictureMarkerSymbol
) {
	var isMarkerClicked = false,
		mapClickIndex = 0,
		userInfo;

	const infoTemplateJson = {
			title: "Item Posted by <b>${Name}</b>",
			content: "<b>Name</b>: ${Product}<br>\
					  <b>Email</b>: <span><a href='#' data-email='${Email}' onclick='this.parentNode.innerHTML = this.dataset.email'>click here to reveal</a></span><br>\
					  <b>Phone</b>: <span><a href='#' data-phone='${Phone}' onclick='this.parentNode.innerHTML = this.dataset.phone'>click here to reveal</a></span><br>\
					  <b>Price</b>: <b><font color='red'>${Price}</font>$</b><br>\
					  <b>Address</b>: <i>${Address}</i><br><br>\
					  <img src=${Image} style='width: 200px; height: auto'/>"
		  },
		  infoTemplate = new InfoTemplate(infoTemplateJson);

	String.prototype.toTitleCase = function () {
		return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
	}

	var map = new Map('map', {
		basemap: 'streets',
		center: [-73.1409, 40.9257], //lon, lat
		zoom: 14
	})

	putMarker = function (data, id) {
		mergeImages([{ src: data.image, x: 30, y: 25 }, { src: '/static/frame.png', x: 0, y: 0 }]).then(b64 => {
			var point = new Point(data.map_x, data.map_y, map.spatialReference),
				pictureMarkerSymbol = new PictureMarkerSymbol(b64, 50, 60),
				attributes = {
					ID: id,
					Name: data.first.toTitleCase() + ' ' + data.last.toTitleCase(),
					Product: data.product,
					Phone: data.contact,
					Email: data.email,
					Price: data.price,
					Image: data.image,
					Address: data.address,
					X: data.map_x,
					Y: data.map_y
				},
				graphic = new Graphic(point, pictureMarkerSymbol, attributes, infoTemplate)
			map.graphics.add(graphic)
		})	
	}

	window.addMarker = function (data, id) {
		if (data.map_x >= map.extent.xmin && data.map_x <= map.extent.xmax &&
			data.map_y >= map.extent.ymin && data.map_y <= map.extent.ymax)
			putMarker(data, id);
	}

	window.updateMarker = function (data, id) {
		var toBeUpdated;
		map.graphics.graphics.every(function(element, index){
			if (element.attributes && element.attributes.ID === id) {
				toBeUpdated = element;
				return false;
			}
			return true;
		});
		if (toBeUpdated.attributes.X >= map.extent.xmin && toBeUpdated.attributes.X <= map.extent.xmax &&
			toBeUpdated.attributes.Y >= map.extent.ymin && toBeUpdated.attributes.Y <= map.extent.ymax) {
			const attrs = {
				ID: id,
				Name: data.first.toTitleCase() + ' ' + data.last.toTitleCase(),
				Product: data.product,
				Phone: data.contact,
				Email: data.email,
				Price: data.price,
				Image: data.image,
				Address: toBeUpdated.attributes.address,
				X: toBeUpdated.attributes.X,
				Y: toBeUpdated.attributes.Y
			}
			toBeUpdated.hide();
			toBeUpdated.setAttributes(attrs);
			toBeUpdated.draw();
			toBeUpdated.show();
		}
	}

	window.removeMarker = function (id) {
		var toBeRemoved;
		map.graphics.graphics.every(function(element, index){
			if (element.attributes && element.attributes.ID === id) {
				toBeRemoved = element;
				return false;
			}
			return true;
		});

		if (toBeRemoved.attributes.X >= map.extent.xmin && toBeRemoved.attributes.X <= map.extent.xmax &&
			toBeRemoved.attributes.Y >= map.extent.ymin && toBeRemoved.attributes.Y <= map.extent.ymax)
			map.graphics.remove(toBeRemoved);
	}

	window.moveMap = function (lat, lng) {
		map.centerAt(new Point(lng, lat))
	}

	window.addItem = function (item) {
		$('#user .products ul').append(
			$(`<li>
				<a class='photo' href='#' onclick='moveMap(${item.latitude}, ${item.longitude})'>
					<img src='${item.image}'/>
				</a>
				<span>${item.product}</span>&nbsp;&nbsp;<span style='color: gold'>${item.price}$</span>
				<a href='/edit/${item['_id']}'>
					<img class='icon' src='static/pencil.png'/>
				</a>
			</li>`)
		)
	}

	function putMarkers(extent, email=null) {
		$.ajax({
			type: 'GET',
			url: '/loader',
			data: {extent, email},
			contentType: 'application/json; charset=utf-8',
			dataType: 'json'
		}).done(function(data, textStatus, jqXHR) {
			data['points'].forEach(function(element, index, array) {
				var alreadyMarked = false;
				map.graphics.graphics.every(function(el, idx){
					if (el.attributes && el.attributes.ID === element['_id']) {
						alreadyMarked = true;
						return false;
					}
					return true;
				})
				if (!alreadyMarked)
					putMarker(element, element['_id'])
			})
			if ('items' in data) {
				data.items.forEach(function(element, _, _) {
					$('#user .products ul').append(
						$(`<li>
							<a class='photo' title='Navigate' href='#' onclick='moveMap(${element.latitude}, ${element.longitude})'>
								<img src='${element.image}'/>
							</a>
							<span>${element.product}</span>&nbsp;&nbsp;<span style='color: gold'>${element.price}$</span>
							<a href='/edit/${element['_id']}' title='Edit'>
								<img class='icon' src='static/pencil.png'/>
							</a>
						</li>`)
					)
				})
			}
		})
	}

	var search = new Search({
		map: map
	}, 'search');

	search.startup();

	var locator = new Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");

	locator.on("location-to-address-complete", function(evt) {
		if (evt.address.address)
			userInfo['address'] = evt.address.address['Match_addr'] || evt.address.address['Address'];
	});

	map.on('load', function(evt) {
		var mapClick = map.on('click', clickHandler),
			mapExtent = map.on('extent-change', showExtent),
			currentExtent = {
				xmin: map.extent.xmin,
				xmax: map.extent.xmax,
				ymin: map.extent.ymin,
				ymax: map.extent.ymax,
			}

		putMarkers(currentExtent, $('#email').val())

		map.graphics.on('click', function(e) {
			if (!e.graphic['attributes']) {
				e.stopPropagation();
				return;
			}
			else if (!e.graphic.attributes.Name) {
				e.stopPropagation();
				map.graphics.remove(e.graphic);
			}
			console.log('clicked a graphic with Name: ' + e.graphic.attributes.Name);
			isMarkerClicked = true;
		});

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				map.centerAndZoom(new Point(position.coords.longitude, position.coords.latitude), 14);
			});
		}
	});

	function showExtent(evt) {
		var extent = {
			xmin: evt.extent.xmin,
			xmax: evt.extent.xmax,
			ymin: evt.extent.ymin,
			ymax: evt.extent.ymax,
		}
		putMarkers(extent)
	}

	function clickHandler(event) {
		if (isMarkerClicked) {
			isMarkerClicked = false;
			return;
		}

		locator.locationToAddress(event.mapPoint, 100);

		userInfo = {
			'latitude': event.mapPoint.getLatitude(),
			'longitude': event.mapPoint.getLongitude(),
			'map_x': event.mapPoint.x,
			'map_y': event.mapPoint.y
		}

		showModal(mapClickIndex++, userInfo);

		// in some cases, you may want to disconnect the event listener
		//mapClick.remove();
	}
});