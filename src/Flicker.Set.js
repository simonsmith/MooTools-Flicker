	
	/*
	---
	
	description: Extends Flicker. Loads a specific photoset, adds album link

	author:
	- Simon Smith

	requires:
	- core/1.3.0:*
	- more:1.3.0.1:Request.JSONP
	- Flicker

	provides: [Flicker.Set]

	...
	*/

	Flicker.Set = new Class(function() {

		'use strict';

		var insertAlbumLink = function( data ) {
		
			var url = this.options.photosetURL.substitute({
			
				user : data.ownername.toLowerCase(),
				
				photoset : this.photoset
				
			});
			
			new Element('p.photoset-url').grab(
				
				new Element('a', { 
				
					href : url,
				
					text : this.options.photosetLinkText
				
				})
				
			)
			.fade('hide')
			.inject( $(this), this.options.photosetLinkPos )
			.fade('in');
			
		};

		return {

			Extends : Flicker,

			initialize : function( container, userId, photoset, apiKey, options ) {

				this.photoset = photoset;
				this.apiKey = apiKey;

				this.parent( container, userId, options );

			},
		
			options : {
			
				url : 'http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&photoset_id={photoset}&api_key={key}&lang={lang}&extras={extras}&user_id={id}&format=json',
				
				// Additional data to request from Flickr API
				// http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
				extras : 'date_taken,url_sq,url_m',
				
				photosetURL : 'http://www.flickr.com/photos/{user}/sets/{photoset}/',
				
				photosetLinkText : 'View this set on Flickr',	
				
				photosetLinkPos : 'after'			
			
			},
			
			getPhotos : function() {
			
				$$('.photoset-url').destroy();
				
				this.parent();
				
			},
			
			formatURL : function() {

				this.url = this.options.url.substitute({
					 
					id : this.userId,
					
					lang : this.options.lang,
					
					photoset : this.photoset,
					
					key : this.apiKey,
					
					extras : this.options.extras
					 
				});
				
			},
			
			transformToHTML : function( json ) {
			
				var photos = this.organisePhotos( json.photoset.photo ),
					elementType = this.options.element,
					className = this.options.className,
					container = new Element('div');

				photos.each(function( item, index ) {
					
					var link, element;
					
					link = new Element( 'a', { href : item.url_m } ).grab(
							
						new Element('img', {

							src : item.url_sq,

							alt : item.title,
						
							width : item.width_sq,
						
							height : item.height_sq

						})
					);
					
					element = new Element( elementType, {
						
						'class' : className
						
					})
					.addClass( 'photo' + (index + 1) )
					.grab( link );	
					
					element.inject( container );
					
				}, this );
				
				this.fireEvent( 'imagesReady', [ $$(container.getChildren()) ] );
				
				insertAlbumLink.call( this, json.photoset );
				
			} 
		
		}
	
	}());
