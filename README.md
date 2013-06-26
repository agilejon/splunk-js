Splunk JS SDK
=============

#### Don't use this. Since I wrote it, Splunk has improved their own [SDK for JavaScript](https://github.com/splunk/splunk-sdk-javascript) and it's now a much better option.

* Requires jQuery 1.7+ * (really, just requires the jQuery deferred object)

Splunk has decent support for returning JSON data but, as of 4.3, the Javascript SDK suxors. This just a start on a better JS SDK. To get this to work, I ended up turning off SSL from within the Splunk management console. Our Splunk installation is internal to our network so this didn't seem like a problem.

    splunk.login - returns a Deferred promise object. You must wait until after login is complete to call search.

    splunk.search - executes search queries. Very basic at this point. Makes a best effort to return JSON data. Splunk's REST API is surprisingly inconsistent with JSON.


Usage:

    splunk.login('username', 'password', { address: 'http://splunk.internal:8089/' })
       .done(function(obj) {
          splunk.search('my splunk query', '-15m', 'now', baseOpts)
             .done(function(s) {
                console.log('all done!');
                console.log(s);
             });
       });
	
