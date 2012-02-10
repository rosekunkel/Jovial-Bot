var net		= require( 'net' ),
	util	= require( 'util' ),
	events	= require( 'events' );

var TCP_setup = function( cl_data_function ) {
    if(!(this instanceof TCP_setup)) {
        return new TCP_setup();
    }
	var self		= this;
	self.cl			= null;
	self.log		= null;
	self.cl_server 	= null;
	self.log_server	= null;
	self.start_cl( cl_data_function );
	self.start_log();
	events.EventEmitter.call(this);
};
util.inherits( TCP_setup, events.EventEmitter );

TCP_setup.prototype.start_cl = function() {
	var self = this;
	self.cl_server = net.createServer(function (stream) {
		var is_first_data = true;
		self.cl = stream;
		self.cl.setEncoding( 'utf8' );
		
		self.cl.on('connect', function () {
			self.cl.write( '>' );
			self.emit( 'cl_connect', self.cl );
		});

		self.cl.on('data', function (data) {
			if ( is_first_data ) {
				is_first_data = false;
				return;
			}
			self.emit( 'cl_data', { data: data,
									stream: self.cl } )
			if ( self.cl.readyState === 'open' ) {
				self.cl.write( '>' );
			}
		});
		
		self.cl.on('end', function () {
			self.emit( 'cl_end', self.cl );
			self.cl.end();
		});
		

	});
	self.cl_server.listen(5001, 'localhost');
};
		
TCP_setup.prototype.start_log = function() {
	var self = this;
	self.log_server = net.createServer(function (stream) {
		self.log = stream;
		self.log.setEncoding('utf8');
		
		self.log.on( 'connect', function () {
			self.log.write( "LOG_START \r\n" );
			self.emit( 'log_connect', self.log );
		});	
		
		self.log.on('end', function () {
			self.log.end();
			self.emit( 'log_end', self.log );
		});			
	});
	self.log_server.listen(5002);
};
	
TCP_setup.prototype.log_put = function( data ) {
	var self = this;
	if ( !( ( self.log === null ) || ( self.log.readyState !== 'open' ) ) ) {
		var string_data = '';
		if(typeof data !== 'string'){
			string_data = data.toString();
		}
		else {
			string_data = data;
		}
		self.log.write(string_data + "\r\n");
	}
};
	
TCP_setup.prototype.cl_out = function( data ) {
	var self = this;
	var string_data = '';
	if ( !( ( self.cl === null ) || ( self.cl.readyState !== 'open' ) ) ) {
		if(typeof data !== 'string'){
			string_data = data.toString();
		}
		else {
			string_data = data;
		}
		self.cl.write(string_data + "\r\n");
	}
};

module.exports = TCP_setup;