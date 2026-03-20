// Neo-nav API connector
// Plain browser script. No module syntax.

var SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
var SCRIPT_URL_PLACEHOLDER = 'YOUR_APPS_SCRIPT_URL_HERE';

var NeoApi = (function () {
  function isConfigured() {
    return !!SCRIPT_URL && SCRIPT_URL !== SCRIPT_URL_PLACEHOLDER;
  }

  function buildUrl(action, extraParams) {
    if (!isConfigured()) {
      throw new Error('SCRIPT_URL is not configured.');
    }

    var url = SCRIPT_URL + '?action=' + encodeURIComponent(action || 'ping');

    if (extraParams) {
      Object.keys(extraParams).forEach(function (key) {
        var value = extraParams[key];
        if (value !== undefined && value !== null && value !== '') {
          url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }
      });
    }

    return url;
  }

  function requestJson(url, options) {
    return fetch(url, options || {})
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.json();
      })
      .then(function (json) {
        if (json.result && json.result !== 'success') {
          throw new Error(json.message || 'API returned error');
        }
        return json;
      });
  }

  function ping() {
    return requestJson(buildUrl('ping')).then(function () {
      return true;
    });
  }

  function postRecord(roleOrPayload, maybePayload) {
    var role = '';
    var payload = {};

    if (typeof roleOrPayload === 'string') {
      role = roleOrPayload;
      payload = maybePayload || {};
    } else {
      payload = roleOrPayload || {};
      role = payload.role || '';
    }

    var body = {
      action: 'write',
      role: role,
      data: payload
    };

    return requestJson(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  }

  function getTodaySummary() {
    return requestJson(buildUrl('read', { days: 1 })).then(function (json) {
      return {
        records: json.records || [],
        count: json.count || 0
      };
    });
  }

  function getLast7Days() {
    return requestJson(buildUrl('read', { days: 7 })).then(function (json) {
      return {
        records: json.records || [],
        count: json.count || 0
      };
    });
  }

  function getOverviewData() {
    return getLast7Days().then(function (data) {
      return {
        records: data.records || [],
        count: data.count || 0
      };
    });
  }

  return {
    isConfigured: isConfigured,
    ping: ping,
    postRecord: postRecord,
    getTodaySummary: getTodaySummary,
    getLast7Days: getLast7Days,
    getOverviewData: getOverviewData
  };
})();

window.NeoApi = NeoApi;