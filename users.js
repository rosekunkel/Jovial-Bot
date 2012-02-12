var Users = function( users ) {
	var self = this;
	if ( users ) {
		self.users = users;
	}
	else {
		self.users = [];
	}
};

Users.prototype.init = function( users_data ) {
	for ( var i in users_data ) {
		this.users[i] = [users_data[i].userid, users_data[i].name];
	}
};
		
Users.prototype.add = function( id, name, blacklist, modes ) {
	if ( blacklist.check( id ) &&  modes.get_mode( 'hostile' ) ) {
		return false;
	}
	else {
		this.users.push( [id, name] );
		return true;
	}
};

Users.prototype.remove = function( id ) {
	var self = this;
	for( var i in self.users ) {
		if ( self.users[i][0] === id ) { 
			self.users.splice( i, 1 );
			break; 
		}
	}
};

Users.prototype.clear = function() {
	this.users = [];
};

Users.prototype.get_users = function() {
	return this.users;
};

Users.prototype.get_user = function( id ) {
	var self = this;
	for( var i in self.users ) {
		if( self.users[i][0] === id ) {
			return self.users[i];
		}
	}
	return false;
};

Users.prototype.get_user_by_name = function( name ) {
	var self = this;
	for( var i in self.users ) {
		if( self.users[i][1] === name ) {
			return self.users[i];
		}
	}
	return false;
};

module.exports = Users;