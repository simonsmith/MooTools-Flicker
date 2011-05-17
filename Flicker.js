	
	/*
	---
	
	description: Flicker Class. Loads latest photos from specific user and renders in page

	author:
	- Simon Smith

	requires:
	- core/1.3.0:*
	- more:1.3.0.1:Request.JSONP

	provides: [Flicker]

	...
	*/
	
	var Flicker = new Class(function() {
			
		/**
		* Loop through object and delete passed properties
		*
		* @private
		* @param	{Object}	object
		* @param	{Array}		keys
		*/
		var deleteProps = function( object, keys ) {

			var newObj = Object.clone( object );

			keys.each(function( item ) {

				delete newObj[item];

			});

			return newObj;

		};
		
		if ( !Array.shuffle ) {
			
			Array.implement({

				/**
				* Shuffles an array - http://jsfromhell.com/array/shuffle
				*
				* @public
				*/
				shuffle : function() {

					var a = this;

					for ( var j, x, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x );

					return a;

				}

			});
			
		} 
	
		return {
			
			Implements : [ Options, Events ],

			initialize : function( container, userId, options ) {

				this.setOptions( options );
				
				this.container = document.id( container );
				this.userId = userId;
				this.insertElements = this.options.insertElements;

				this.formatURL();
				
				this.request = new Request.JSONP({

					callbackKey: 'jsoncallback',

					url: this.url,

					onRequest : function() {

						this.fireEvent( 'request' );

					}.bind( this ),

					onComplete: function( json ) {

						this.fireEvent( 'complete', json );

						this.transformToHTML( json );

					}.bind( this )

				});

			},

			options : {

				num : 6,
				
				url : 'http://api.flickr.com/services/feeds/photos_public.gne?&id={id}&lang={lang}&format=json',
				
				element : 'li',
				
				lang : 'en-uk',
				
				className : 'flickr-photo',
				
				imgType : '_m',
				
				random : false,
				
				onImagesReady : function( elements ) {
					
					elements.fade('hide').inject( $(this) );
					elements.fade('in');

				}

			},
			
			/**
			* Sends JSONP request
			*
			* @public
			*/
			getPhotos : function() {
			
				$(this).empty();
			
				this.request.send();
				
			},
			
			/**
			* Replaces values in Flickr API url
			*
			* @protected
			*/
			formatURL : function() {
			
				this.url = this.options.url.substitute({
					 
					id : this.userId,
					
					lang : this.options.lang
					 
				});
				
			}.protect(),
			
			/**
			* Returns amount of items from photos array. Optionally shuffles array
			*
			* @protected
			*/
			organisePhotos : function( photos ) {
				
				if ( this.options.random ) photos = photos.shuffle();
				
				return Array.clone( photos.splice( 0, this.options.num ) );
				
			}.protect(),

			transformToHTML : function( json ) {

				var photos = this.organisePhotos( json.items ),
					imgType = this.options.imgType,
					elementType = this.options.element,
					className = this.options.className,
					container = new Element('div');
				
				// Construct photo markup
				photos.each(function( item, index ) {
					
					var meta = deleteProps( item, [ 'title', 'link', 'media' ] ),

						link = new Element('a', { href : item.link } ).grab(
							
							new Element('img', {
						
								src : item.media.m.replace( '_m', imgType ),
						
								alt : item.title
						
							})
						);
					
					var element = new Element( elementType, {
						
						'class' : className
						
					})
					.addClass( 'photo' + (index + 1) )
					.store( 'image-meta', meta )
					.grab( link );
					
					element.inject( container );
					
				}, this );	
				
				this.fireEvent( 'imagesReady', [ container.getChildren() ] );

			},
			
			toElement : function() {

				return this.container;

			}
			
		}
		
	}());
