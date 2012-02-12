var Bot					= require( 'ttapi' ),
	TCP					= require( './tcp_setup.js' ),
	Room				= require( './room.js' ),
	Modes				= require( './modes.js' ),
	Blacklist			= require( './blacklist.js' ),
	randomize_speech	= require( './randomize_speech.js' ),
	util				= require( 'util' ),
	events				= require( 'events' );
	
var Jovial_Bot = function( auth, userid, roomid, bot_admin ) {
	var self = this;
	self.room		= new Room( roomid );
	self.tcp		= new TCP();
	self.modes		= new Modes();
	self.blacklist	= new Blacklist();
	self.bot_admin	= bot_admin;
	Bot.call( this, auth, userid, roomid );

	self.do_command = function( data, origin, user ) { //Handle commands from the cl or turntable
		var command = '';
		var qualified = false;
		if ( origin === 'turntable' ) {
			command = data.replace( /^#/, '' )
			if ( user === self.bot_admin || self.room.moderators.check( user ) ) {
				qualified = true;
			}
		}
		else if ( origin === 'tcp' ) {
			command = data.data.replace( /\s+$/, '' ); //Trim newlines
			qualified = true;
		}

		if ( command === 'leave' ) { //Leave the room
			if ( user === self.bot_admin || origin === 'tcp' ) {
				self.speak( randomize_speech( 'exit_messages' ) );
				self.roomDeregister();
				self.room = null;
			}
		}
		
		else if ( command.match(/^say/) ) { //Repeat whatever comes after "#say" if the admin or a moderator says it
			if ( qualified ) {
				 self.speak( command.substring(4) );
			}
		}
		
		else if ( command === 'awesome' ) { //Upvote when the admin or a moderator says "#awesome"
			if ( qualified ) {
				self.vote( 'up' );
				self.speak( randomize_speech( 'upvote_messages' ) );
				self.room.votes.set_has_voted( true );
			}
		}
		
		else if ( command === 'up' ) { //Get on the stand if the admin or a moderator says "#up"
			if ( qualified && !self.room.get_is_dj() ) {
				self.addDj();
				self.room.set_is_dj( true );
			}
		}
		
		else if ( command === 'down' ) { //Get off the stand if the admin or a moderator says "#down"
			if ( qualified && self.room.get_is_dj() ) {
				self.remDj();
				self.room.set_is_dj( false );
			}
		}
		
		else if ( command.match(/^toggle/) ) { //Toggle modes
			if ( qualified ) {
				var mode = command.substring(7);
				if ( origin === 'turntable' ) {
					 self.speak( self.modes.toggle_mode( mode ) );
				}
				else if ( origin === 'tcp' ) {
					self.tcp.cl_out( self.modes.toggle_mode( mode ) );
				}
			}
		}

		else if ( command.match(/^fan/) ) { //Have the  self fan the person named, or the speaker if the name is "me"
			var name = command.substring(4);
			if ( name === 'me'  ) {
				 self.becomeFan(user);
			}
			else if ( self.room.users.get_user_by_name( name ) ) {
				 self.becomeFan( self.room.users.get_user_by_name( name )[0] );
			}
			else {
				if ( origin = 'turntable' ) {
					 self.speak( 'There is no one named ' + name + '!' );
				}
				else if ( origin = 'tcp' ) {
					self.tcp.log_put( 'There is no one named ' + name );
				}
			}
		}
		
		else if ( command.match(/^print/) && origin === 'tcp') { //Output environment variables
			var setting = command.substring(6)
			switch( setting ) {
				case 'modes':
					var modes = self.modes.get_modes();
					for ( var i = 0; i < modes.length; i++ ) {
						self.tcp.cl_out( modes[i] );
					}
					break;
				case 'users':
					var users = self.room.users.get_users();
					for ( var i = 0; i < users.length; i++ ) {
						self.tcp.cl_out( users[i] );
					}
					break;
				case 'moderators':
					var moderators = self.room.moderators.get_moderators();
					for ( var i = 0; i < moderators.length; i++) {
						self.tcp.cl_out( moderators[i] );
					}
					break;
				case 'blacklist':
					var blacklist = self.blacklist.get_blacklist();
					for ( var i = 0; i < blacklist.length; i++) {
						self.tcp.cl_out( blacklist[i] );
					}
					break;
				case 'votes':
					var votes = self.room.votes.get_votes();
					self.tcp.cl_out( 'Upvotes: ' + votes[0] );
					self.tcp.cl_out( 'Downvotes: ' + votes[1] );
					break;
				case 'has_voted':
					self.tcp.cl_out( 'Has voted: ' + self.room.votes.get_has_voted() );
					break;
				case 'is_dj':
					self.tcp.cl_out( 'Is a DJ: ' + self.room.get_is_dj() );
					break;
				case 'room_id':
					self.tcp.cl_out( 'Room ID: ' + self.room.get_room_id() );
					break;
				default:
					self.tcp.cl_out( 'No such setting: ' + setting );
			}
		}

		else if ( command.match(/^register/) && origin === 'tcp') { //Register in a new room
			var room = command.substring(9);
			 self.roomRegister(room);
		}
		
		else if ( command === 'exit' && origin === 'tcp') { //Cut off TCP connections
			data.stream.end();
		}
		
		else { //Acknowledge an invalid command
			if ( origin === 'turntable' ) {
				 self.speak( 'Invalid command: ' + command );
			}
			else if ( origin === 'tcp' ) {
				self.tcp.cl_out( 'Invalid command: ' + command );
			}
		}
	};
	
	self.on( 'ready', function( data ) { //Join the room
		self.tcp.log_put('Bot ready');
		self.roomRegister(self.roomId);
	} );

	 self.on( 'newsong', function( data ) { //Reset counters on a new song
		self.room.votes.clear();
		self.room.votes.set_has_voted( false );
		self.tcp.log_put( self.room.users.get_user( data.room.metadata.current_dj )[1] + ', ' +
						data.room.metadata.current_dj + '\r\n\tstarted playing: ' +
						data.room.metadata.current_song.metadata.song + ', ' + 
						data.room.metadata.current_song._id + "\r\n\tby: " +
						data.room.metadata.current_song.metadata.artist + "\r\n\ton: " +
						data.room.metadata.current_song.metadata.album );
	} );

	 self.on( 'speak', function( data ) {
		var said = data.text;
		var user = data.userid;
		self.tcp.log_put( data.name + ', ' + user + ' said: ' + said );
		if ( user === self.userid ) {
			return;
		}
		
		if ( said.match(/^#/) ) {
			self.do_command( said, 'turntable', user );
		}
		
		//Memes
		else if ( self.modes.get_mode( 'meme' ) ) { //meme_mode
			if ( said.match(/herp/i) ) { //Say "herp" for derp
				 self.speak( 'Derp' );
			}

			else if ( said.match(/nope/i) ) { //Say "nope" for Chuck Testa
				 self.speak( 'Chuck Testa' );
			}

			else if ( said.match(/sup son/i) ) { //Say "sup son" for ¯\_(ツ)_/¯
				 self.speak( '¯\\_(ツ)_/¯' );
			}

			else if ( said.match(/flip/i) ) { //Say "flip" for (╯°□°）╯︵ ┻━┻
				 self.speak( '(╯°□°）╯︵ ┻━┻' );
			}
		}
	} );
			
	 self.on( 'update_votes', function( data ) {
		vote_info = data.room.metadata;
		self.tcp.log_put( 'Downvotes: ' + vote_info.downvotes );
		self.tcp.log_put( 'Upvotes: ' + vote_info.upvotes );

		if ( vote_info.downvote_total > self.room.votes.get_votes()[0] ) { //If someone downvotes, give them a stern lecture.
			 self.speak( randomize_speech( 'downvote_messages' ) );
		}

		else if ( vote_info.downvote_total < self.room.votes.get_votes()[0] ) { //If downvotes are removed, thank the user and update the downvote count.
			 self.speak( randomize_speech( 'thanks' ) );
		}

		if ( ( vote_info.upvotes >= ( ( self.room.users.get_users().length - 2 ) / 2 ) ) && !self.room.votes.get_has_voted ) { //Upvote if 50% or more of the room has upvoted
			self.vote( 'up' );
			self.speak( randomize_speech( 'upvote_messages' ) );
			self.room.votes.set_has_voted( true );
		}

		if ( vote_info.upvotes >= self.room.users.get_users().length - 1 ) { //Give a heart if the whole room has upvoted.
			 self.snag();
		}
		
		self.room.votes.set_votes( [vote_info.upvotes, vote_info.downvote_total] );
	} );

	 self.on( 'registered', function( data ) {
		if( self.room !== null ) {
			var username = data.user[0].name;
			self.tcp.log_put( username + ', ' + data.user[0].userid );
			self.room.users.add( data.user[0].userid, username, self.blacklist, self.modes );
			if ( data.user[0].userid !== self.userId ) { //Say hello
				 self.speak( randomize_speech( 'greetings', username, true ) );
			}
		}
	} );

	 self.on( 'roomChanged', function( data ) {
		self.tcp.log_put( 'Joined ' + data.room.name );
		self.speak( randomize_speech( 'greetings', data.room.name, true ) ); //Greet the new room
		self.room = new Room( data.room.roomid );
		self.room.users.init( data.users );
	} );

	 self.on( 'deregistered', function( data ) {
		self.tcp.log_put( data.user[0].name + ', ' + data.user[0].userid + ' left' );
		self.room.users.remove( data.user[0].userid );
	} );

	 self.on( 'new_moderator', function( data ) {
		self.room.moderators.add( data.userid );
	} );
		
	self.on( 'rem_moderator', function( data ) {
		self.room.moderators.remove( data.userid );
		if( data.userid === self.userId ) { //Alert when the  self's moderator status has been removed
			 self.speak( randomize_speech( 'rem_moderator_messages' ) );
		}
		else if( data.userid === self.bot_admin ) { //Make sure the  self admin remains a moderator
			self.addModerator(  self.bot_admin );
		}
	} );

	self.tcp.on( 'cl_data', function( data ) {
		self.do_command( data, 'tcp' );
	} );
}

util.inherits( Jovial_Bot, Bot);

module.exports = Jovial_Bot;