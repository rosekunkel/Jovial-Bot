var Moderators = function( moderators ) {
	var self = this;
	if ( moderators ) {
		self.moderators = moderators;
	}
	else {
		self.moderators = [];
	}
};

Moderators.prototype.add = function( id ) {
	this.moderators.push( id );
};

Moderators.prototype.remove = function( id ) {
	var self = this;
	for( var i in self.moderators ) {
		if ( self.moderators[i] === id ) { 
			self.moderators.splice( i, 1 );
			break; 
		}
	}
};

Moderators.prototype.clear = function() {
	this.moderators = [];
};

Moderators.prototype.set_moderators = function( moderators_data ) {
	this.moderators = moderators_data;
};

Moderators.prototype.get_moderators = function() {
	return this.moderators;
};

Moderators.prototype.check = function( id ) {
	var self = this;
	for ( var i in self.moderators ) {
		if ( id === self.moderators[i] )
			return true;
	}
	return false;
};

module.exports = Moderators;