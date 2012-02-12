var Votes = function() {
	var self = this;
	self.votes = [0,0];
	self.has_voted = false;
};

Votes.prototype.set_votes = function( upvotes, downvotes ) {
	this.votes = [upvotes, downvotes];
};

Votes.prototype.clear = function() {
	this.votes = [0,0];
};

Votes.prototype.get_votes = function() {
	return this.votes;
};

Votes.prototype.set_has_voted = function( voted ) {
	this.has_voted = voted;
};

Votes.prototype.get_has_voted = function() {
	return this.has_voted;
};

module.exports = Votes;