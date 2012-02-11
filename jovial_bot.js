var Bot			= require( 'ttapi' ),
	TCP			= require( './tcp_setup.js' ),
	Room		= require( './room.js' ),
	Modes		= require( './modes.js' ),
	Blacklist	= require( './blacklist.js' ),
	speech		= require( './speech.js' ),
	util		= require( 'util' ),
	events		= require( 'events' );
	
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
				self.speak( speech.randomize( 'exit_messages' ) );
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
				self.speak( speech.randomize( 'upvote_messages' ) );
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
}

util.inherits( Jovial_Bot, Bot);

module.exports = Jovial_Bot;