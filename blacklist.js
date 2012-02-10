var Blacklist = function() { 
	blacklist = [];
}

Blacklist.prototype = {
	blacklist: [],
	
	get_blacklist: function() {
	return this.blacklist;
	},

	check: function( id ) {
		for ( var i = 0; i < this.blacklist.length; i++ ) {
			if ( id === this.blacklist[i] ) {
				return true;
			}
		}
		return false
	},

	execute: function( users, bot ) {
		for ( var i = 0; i < users.length; i++ ) {
			if ( this.check( users[i][0] ) ) {
				bot.bootUser( users[i][0] );
			}
		}
	}
}

module.exports = Blacklist;