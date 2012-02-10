var Modes = function() {
	this.modes = [	['meme', false],
				['hostile', false]];
};

Modes.prototype = {
	modes: [	['meme', false],
				['hostile', false]],

	toggle_mode: function( mode ) {
		for( var i = 0; i < this.modes.length; i++ ) {
			if ( mode === this.modes[i][0] ) {
				this.modes[i][1] = !this.modes[i][1];
				return ( this.modes[i][0] + ' is now ' + this.modes[i][1].toString() );
			}
		}
		return ( 'No such mode: ' + mode );
	},

	get_mode: function( mode ) {
		for( var i = 0; i < this.modes.length; i++ ) {
			if ( mode === this.modes[i][0] ) {
				return this.modes[i][1];
			}
		}
		return ( 'No such mode: ' + mode );
	},

	get_modes: function() {
		return this.modes;
	},
}

module.exports = Modes;