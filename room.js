var Users = require( './users.js' ),
	Moderators = require( './moderators.js' ),
	Votes = require( './votes.js' );
	
var Room = function( room_id, users, moderators ) {
	var self = this;
	self.users = new Users(users);
	self.moderators = new Moderators(moderators);
	self.votes = new Votes();
	self.room_id = room_id;
	self.is_dj = false;
}

Room.prototype.set_is_dj = function( is_dj ) {
	this.is_dj = is_dj;
};

Room.prototype.get_is_dj = function() {
	return this.is_dj;
};

Room.prototype.get_room_id = function() {
	return this.room_id;
};

module.exports = Room;