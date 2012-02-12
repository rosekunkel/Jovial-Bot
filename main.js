var Jovial_Bot	= require( './jovial_bot.js' ),
	fs 			= require( 'fs' ),
	xml2js		= require( 'xml2js' );

var parser = new xml2js.Parser();
var bot = null;

fs.readFile(__dirname + '/bot_settings.xml', function( error, data ) {
	parser.parseString(data, function( error, result ) {
		console.log(result);
		bot = new Jovial_Bot( result.auth , result.userid, result.roomid, result.admin );
	} );
} );