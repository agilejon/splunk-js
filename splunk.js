
splunk = (function($) {
	var sessionKey;
	
	var splunkRequest = function(action, data, options) {
		var result = $.Deferred(),
			options = options || {},
			type = options.type || 'POST',
			headers = options.headers || {},
			key = options['sessionKey'] || sessionKey,
			addy = options.address || '';
		
		if (key) {
			headers.Authorization = 'Splunk ' + key;
		}
		$.ajax(addy + action, { type: type, data: data, headers: headers })
			.success(function(resp) {
				if ($.isPlainObject(resp)) {
					result.resolve(resp);
				} else if ($.isXMLDoc(resp)) {
					// it returned XML, convert it to an object
					var resultObj = {};
					$.each($(resp.firstChild).children(), function(index, elem) {
						resultObj[elem.nodeName] = $(elem).text();
					});
					result.resolve(resultObj);
				} else {
					// hopefully it's a string
					result.resolve($.parseJSON(resp));
				}
			});
		return result.promise();
	}
	
	return {
		login: function(username, password, options) {
			return splunkRequest('services/auth/login', {username:username, password:password}, options)
				.done(function(resp) { sessionKey = resp.sessionKey; });
		},
		search: function(query, from, to, options) {
			var finalResults = $.Deferred();
			var initSearch = splunkRequest('services/search/jobs', { search:'search ' + query, earliest_time:from, latest_time:to }, options);
			initSearch.done(function(sid) {
				var statusOptions = $.extend({type:'GET'}, options);
				var checkStatus = function() {
					splunkRequest('services/search/jobs/' + sid.sid, {output_mode:'json'}, statusOptions).done(function(progress) {
						if (progress.data[0].doneProgress < 1.0) {
							setTimeout(checkStatus, 1000);
							return;
						}
						splunkRequest('services/search/jobs/' + sid.sid + '/results', {count:0, output_mode:'json'}, statusOptions).done(function(results) {
							finalResults.resolve(results);
						});
					})
				};
				setTimeout(checkStatus, 1000);
			});
			return finalResults.promise();
		}
	};
})(jQuery);

var baseOpts = { address: 'http://splunk:8089/' };
splunk.login('username', 'password', baseOpts)
	.done(function(obj) {
		splunk.search('Audit Func=Insert Op=Cutup', '-15m', 'now', baseOpts)
			.done(function(s) {
				console.log('all done!');
				console.log(s);
			});
	});