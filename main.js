var Jovial_Bot	= require( './jovial_bot.js' ),
	Room		= require( './room.js' ),
	speech		= require( './speech.js' ),
	fs 			= require( 'fs' ),
	xml2js		= require( 'xml2js' )

var parser = new xml2js.Parser();
var bot = null;

fs.readFile(__dirname + '/bot_settings.xml', function( error, data ) {
	parser.parseString(data, function( error, result ) {
		console.log(result);
		bot = new Jovial_Bot( result.auth , result.userid, result.roomid, result.admin );
	} );

	bot.on( 'ready', function( data ) { //Join the room
		bot.tcp.log_put('Bot ready');
		bot.roomRegister(bot.roomId);
	} );

	 bot.on( 'newsong', function( data ) { //Reset counters on a new song
		bot.room.votes.clear();
		bot.room.votes.set_has_voted( false );
		bot.tcp.log_put( bot.room.users.get_user( data.room.metadata.current_dj )[1] + ', ' +
						data.room.metadata.current_dj + '\r\n\tstarted playing: ' +
						data.room.metadata.current_song.metadata.song + ', ' + 
						data.room.metadata.current_song._id + "\r\n\tby: " +
						data.room.metadata.current_song.metadata.artist + "\r\n\ton: " +
						data.room.metadata.current_song.metadata.album );
	} );

	 bot.on( 'speak', function( data ) {
		var said = data.text;
		var user = data.userid;
		bot.tcp.log_put( data.name + ', ' + user + ' said: ' + said );
		if ( user === bot.userid ) {
			return;
		}
		
		if ( said.match(/^#/) ) {
			bot.do_command( said, 'turntable', user );
		}
		
		//Memes
		else if ( bot.modes.get_mode( 'meme' ) ) { //meme_mode
			if ( said.match(/herp/i) ) { //Say "herp" for derp
				 bot.speak( 'Derp' );
			}

			else if ( said.match(/nope/i) ) { //Say "nope" for Chuck Testa
				 bot.speak( 'Chuck Testa' );
			}

			else if ( said.match(/sup son/i) ) { //Say "sup son" for ¯\_(ツ)_/¯
				 bot.speak( '¯\\_(ツ)_/¯' );
			}

			else if ( said.match(/flip/i) ) { //Say "flip" for (╯°□°）╯︵ ┻━┻
				 bot.speak( '(╯°□°）╯︵ ┻━┻' );
			}
		}
	} );
			
	 bot.on( 'update_votes', function( data ) {
		vote_info = data.room.metadata;
		bot.tcp.log_put( 'Downvotes: ' + vote_info.downvotes );
		bot.tcp.log_put( 'Upvotes: ' + vote_info.upvotes );

		if ( vote_info.downvote_total > bot.room.votes.get_votes()[0] ) { //If someone downvotes, give them a stern lecture.
			 bot.speak( speech.randomize( 'downvote_messages' ) );
		}

		else if ( vote_info.downvote_total < bot.room.votes.get_votes()[0] ) { //If downvotes are removed, thank the user and update the downvote count.
			 bot.speak( speech.randomize( 'thanks' ) );
		}

		if ( ( vote_info.upvotes >= ( ( bot.room.users.get_users().length - 2 ) / 2 ) ) && !bot.room.votes.get_has_voted ) { //Upvote if 50% or more of the room has upvoted
			bot.vote( 'up' );
			bot.speak( speech.randomize( 'upvote_messages' ) );
			bot.room.votes.set_has_voted( true );
		}

		if ( vote_info.upvotes >= bot.room.users.get_users().length - 1 ) { //Give a heart if the whole room has upvoted.
			 bot.snag();
		}
		
		bot.room.votes.set_votes( [vote_info.upvotes, vote_info.downvote_total] );
	} );

	 bot.on( 'registered', function( data ) {
		if( bot.room !== null ) {
			var username = data.user[0].name;
			bot.tcp.log_put( username + ', ' + data.user[0].userid );
			bot.room.users.add( data.user[0].userid, username, bot.blacklist, bot.modes );
			if ( data.user[0].userid !== bot.userId ) { //Say hello
				 bot.speak( speech.randomize( 'greetings', username, true ) );
			}
		}
	} );

	 bot.on( 'roomChanged', function( data ) {
		bot.tcp.log_put( 'Joined ' + data.room.name );
		bot.speak( speech.randomize( 'greetings', data.room.name, true ) ); //Greet the new room
		bot.room = new Room( data.room.roomid );
		bot.room.users.init( data.users );
	} );

	 bot.on( 'deregistered', function( data ) {
		bot.tcp.log_put( data.user[0].name + ', ' + data.user[0].userid + ' left' );
		bot.room.users.remove( data.user[0].userid );
	} );

	 bot.on( 'new_moderator', function( data ) {
		bot.room.moderators.add( data.userid );
	} );
		
	bot.on( 'rem_moderator', function( data ) {
		bot.room.moderators.remove( data.userid );
		if( data.userid === bot.userId ) { //Alert when the  bot's moderator status has been removed
			 bot.speak( speech.randomize( 'rem_moderator_messages' ) );
		}
		else if( data.userid === bot.bot_admin ) { //Make sure the  bot admin remains a moderator
			bot.addModerator(  bot.bot_admin );
		}
	} );

	bot.tcp.on( 'cl_data', function( data ) {
		bot.do_command( data, 'tcp' );
	} );
} );