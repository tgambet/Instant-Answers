/**
 * This is your main app file. Please refer to the documentation for more information.
 */

/**
 * If you need to import extra node_modules, use "npm install xxx --save" and place them there.
 */

var Promise = require("bluebird");
var _ = require('@qwant/front-i18n')._;

module.exports = {

    /**
     * (NEEDED)
     *	This function uses 3 parameters :
     *	- values : This is an array of values caught by regex.
     *	For example, if you use the keyword "test" with the trigger "start", and you type "test working?",
     *  values would be like this :
     *  	* values[0] = "test working?"
     *  	* values[1] = "test"
     *  	* values[2] = "working?"
     *  But, if you use the trigger "strict", there will be only one value in this array (values[0] = "test working?")
     *  - proxyURL : If you need to call an external API, use the package "request" with proxyURL as value for
     *  "proxy" attribute (you can refer to weather IA to check how to use it properly)
     *  - language : Current language called
     * @returns data to be displayed.
     */

    getData: function (values, proxyURL, language, i18n) {
        const _ = i18n._;
        return new Promise(function (resolve, reject) {
            if (values && values[0]) {
                // Declare redisTools
                const CACHE_KEY = 'citybikes-cache';
                const CACHE_EXPIRE = 7200;
                const redisTools = require('../../redis_tools');
                redisTools.initRedis();

                // Checking the cache to avoid requesting the API

                redisTools.getFromCache(CACHE_KEY).then((cached) => {
                    if (cached) { // we already have a recent answer
                        cached = JSON.parse(cached);
                        if (cached) {
                            cached.fromCache = true;
                            resolve(cached);
                        } else {
                            reject("Error: something went wrong while fetching cached response");
                        }
                    } else { // no cache
                        // Declares the API Caller
                        var apiCaller = require('../../api_caller');
                        // Your request
                        var api_request = 'https://api.citybik.es/v2/networks';

                        // Defines the structure of the answer
                        var structure = {
                            "networks": [
                                {
                                    "company": "Array,String",
                                    "href": "String",
                                    "id": "String",
                                    "@_gbfs_href": "String",
                                    "@_license": {
                                        "@_name": "String",
                                        "@_url": "String"
                                    },
                                    "location": {
                                        "city": "String",
                                        "country": "String",
                                        "latitude": "number",
                                        "longitude": "number"
                                    },
                                    "name": "String"
                                }
                            ]
                        };

                        // Call the API and get back data
                        apiCaller.call(api_request, structure, proxyURL, this.timeout, redisTools).then((apiRes) => {
                            // ... treat apiRes

                            // save response to cache
                            redisTools.saveToCache(CACHE_KEY, apiRes, CACHE_EXPIRE);
                            apiRes.fromCache = false;
                            resolve(apiRes);
                        }).catch((error) => {
                            reject(error);
                        });
                    }
                });
            } else {
                reject("Couldn't process query.")
            }
        });
    },

    /**
     * (OPTIONAL/NEEDED)
     * If your name needs to be translated, use this function getName().
     * @returns the tab name translated
     */

    getName: function (i18n) {
        const _ = i18n._;
        return _("citybikes", "citybikes");
    },

    /**
     * (OPTIONAL/NEEDED)
     * Otherwise, if your name doesn't need to be translated, use this attribute.
     */

    name: "citybikes",

    /**
     * (OPTIONAL/NEEDED)
     * If your keyword needs to be translated, use this function getKeyword().
     * @returns keyword translated
     */
    getKeyword: function (i18n) {
        const _ = i18n._;
        return _("bikes", "citybikes");
    },

    /**
     * (OPTIONAL/NEEDED)
     * Otherwise, if your keyword doesn't need to be translated, use this attribute.
     * The keyword can be a regex. If you need help for your regex, use this https://regex101.com/#javascript
     */

    keyword: "bikes",

    /**
     * (OPTIONAL)
     * script : If your IA includes a script, place it under public/javascript/xxx.js and replace "hello" by "xxx".
     */

    

    /**
     * (NEEDED)
     * triggers : Depending on the trigger, the keyword needs to be placed at a specific point in the query.
     * It has 4 different values :
     * 			start  : keyword + string
     *          end    : string + keyword
     *          any    : string + keyword + string
     *          strict : perfect match with keyword
     */

    trigger: "strict",

    /**
     * (NEEDED)
     * flag : Only 3 flags allowed : (default : i)
     * 			- g : global
     * 			- m : multi-line
     * 			- i : insensitive
     */

    flag: "gi",

    /**
     * (NEEDED)
     * timeout : Time before your response is considered as canceled (in milliseconds)
     */

    timeout: 3600,

    /**
     * (NEEDED)
     * cache : Duration of the data cached (in seconds)
     */

    cache: 10800
};
