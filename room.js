var Users = function( users ) {
	if ( users ) {
		this.users = users;
	}
	else {
		this.users = [];
	}
};

Users.prototype = {
	users: [],
	
	init: function( users_data ) {
		for ( var i in users_data ) {
			this.users[i] = [users_data[i].userid, users_data[i].name];
		}
	},
		
	add: function( id, name, blacklist, modes ) {
		if ( blacklist.check( id ) &&  modes.get_mode( 'hostile' ) ) {
			return false;
		}
		else {
			this.users.push( [id, name] );
			return true;
		}
	},

	remove: function( id ) {
		for( var i in this.users ) {
			if ( this.users[i][0] === id ) { 
				this.users.splice( i, 1 );
				break; 
			}
		}
	},

	clear: function() {
		this.users = [];
	},

	get_users: function() {
		return this.users;
	},

	get_user: function( id ) {
		for( var i in this.users ) {
			if( this.users[i][0] === id ) {
				return this.users[i];
			}
		}
		return false;
	},

	get_user_by_name: function( name ) {
		for( var i in this.users ) {
			if( this.users[i][1] === name ) {
				return this.users[i];
			}
		}
		return false;
	}
};


var Moderators = function( moderators ) {
	if ( moderators ) {
		this.moderators = moderators;
	}
	else {
		this.moderators = [];
	}
};

Moderators.prototype = {
	moderators:	[],
	
	add: function( id ) {
		this.moderators.push( id );
	},

	remove: function( id ) {
		for( var i in this.moderators ) {
			if ( this.moderators[i] === id ) { 
				this.moderators.splice( i, 1 );
				break; 
			}
		}
	},

	clear: function() {
		this.moderators = [];
	},

	set_moderators: function( moderators_data ) {
		this.moderators = moderators_data;
	},

	get_moderators: function() {
		return this.moderators;
	},

	check: function( id ) {
		for ( var i in this.moderators ) {
			if ( id === this.moderators[i] )
				return true;
		}
		return false;
	}
};


var Votes = function() {
	this.votes = [0,0];
	this.has_voted = false;
}

Votes.prototype = {
	votes: [0,0],
	has_voted: false,
	
	set_votes: function( upvotes, downvotes ) {
		this.votes = [upvotes, downvotes];
	},

	clear: function() {
		this.votes = [0,0];
	},

	get_votes: function() {
		return this.votes;
	},

	set_has_voted: function( voted ) {
		this.has_voted = voted;
	},

	get_has_voted: function() {
		return this.has_voted;
	}
}

var Room = function( room_id, users, moderators ) {
	this.users = new Users(users);
	this.moderators = new Moderators(moderators);
	this.votes = new Votes();
	this.room_id = room_id;
	this.is_dj = false;
}

Room.prototype = {
	users: null,
	moderators: null,
	votes: null,
	room_id: '',
	is_dj: false,
	set_is_dj: function( is_dj ) {
		this.is_dj = is_dj;
	},

	get_is_dj: function() {
		return this.is_dj;
	},

	get_room_id: function() {
		return this.room_id;
	}
}

module.exports = Room;