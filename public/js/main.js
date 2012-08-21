require.config({
    shim: {
        'public/js/bootstrap/bootstrap.min.js': ['jquery'],
        'public/js/backbone/backbone-0.9.2-min.js': [
				'public/js/underscore/underscore-1.3.3-min.js'
			],
        'public/js/stackmob/stackmob-js-0.5.5-min.js': [
				'jquery',
				'public/js/backbone/backbone-0.9.2-min.js',
				'public/js/oauth/2.5.3-crypto-sha1-hmac.js'
			],
        'public/js/app/nls.js': [
				'public/js/bootstrap/bootstrap.min.js',
         	'public/js/backbone/backbone-0.9.2-min.js',
				'public/js/stackmob/stackmob-js-0.5.5-min.js',
         	'public/js/app/namespace.js',
			],
        'public/js/app/router.js': [
         	'public/js/app/nls.js',
				'public/js/app/login.js',
				'public/js/app/home.js'
			],
			'public/js/app/login.js': [
				'public/js/app/nls.js'
			],
			'public/js/app/home.js': [
				'public/js/app/nls.js'
			]
    }
});

require(["jquery",
         "public/js/jquery/json2-min.js",
         "public/js/underscore/underscore-1.3.3-min.js",
         "public/js/backbone/backbone-0.9.2-min.js",
			"public/js/stackmob/stackmob-js-0.5.5-min.js",
			"public/js/oauth/2.5.3-crypto-sha1-hmac.js",
         "public/js/bootstrap/bootstrap.min.js",
         "public/js/app/namespace.js",
         "public/js/app/nls.js",
         "public/js/app/router.js",
         "public/js/app/login.js",
         "public/js/app/home.js"
      ], function($) {

});
