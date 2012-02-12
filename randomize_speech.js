//Randomized speech
var greetings = [	['Hi, ', '.'],
					['Salutations, ', '.'],
					['What up, ', '?'],
					['Sup, ', '.']
				];
var upvote_messages = [ 'Thweet.  Upvoted.',
						'I love this song!',
						'<3 this song',
						'This song is so good.'
					  ];
var rem_moderator_messages = [ 	"Hey!  Who de-modded me?  You've got a lot of nerve, buddy!",
								'Whoa.  Whoa.  No.  You did NOT just remove my moderator status.',
								"Why'd you remove my moderator status?  What did I ever do to you?",
								"I'm not a mod anymore?  Screw you guys, I'm going home."
							 ];
var exit_messages = [	'Bye, everybody!',
						'See ya!',
						'Oh, got to go!',
						'See you later!',
						'Goodbye!'
					];
var downvote_messages = [ 	"Hey!  Downvoting isn't allowed in this room.  Please read and obey the rules, or we'll have to kick you.",
							"Whoa man, don't, like, downvote.  It's bad karma.",
							'Seriously, downvoting is not cool.  Read the rules, please.'
						];
var thanks = [	"Thanks!" ]

//Randomize phrases given an array of phrases, data to be included, and whether the phrase is in two parts
module.exports = function ( phrases_name, inserted_data, is_two_parts ) {
	var phrases = '';
	switch( phrases_name ) {
		case 'greetings':
			phrases = greetings;
			break;
		case 'upvote_messages':
			phrases = upvote_messages;
			break;
		case 'rem_moderator_messages':
			phrases = rem_moderator_messages;
			break;
		case 'exit_messages':
			phrases = exit_messages;
			break;
		case 'downvote_messages':
			phrases = downvote_messages;
			break;
		default:
			return ( 'Error: Invalid input ' + phrases_name );
			break;
	}
	var random_phrase = Math.floor( Math.random() * phrases.length );
	if ( inserted_data ) {
		if ( is_two_parts )
			return ( phrases[random_phrase][0] + inserted_data + phrases[random_phrase][1] );
		else
			return ( phrases[random_phrase] + inserted_data );
	}
	else
		return phrases[random_phrase];
}
