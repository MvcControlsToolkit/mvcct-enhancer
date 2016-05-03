(function () {
    var DEBUG = true;
    (function (undefined) {
        var window = this || (0, eval)('this');
        (function (factory) {
            if (typeof define === 'function' && define['amd']) {
                // [1] AMD anonymous module
                define(["../mvcct.enhancer"], factory);
            } else if (typeof exports === 'object' && typeof module === 'object') {
                // [2] CommonJS/Node.js
                module["exports"] = factory(require("mvcct-enhancer"));  // module.exports is for Node.js
            } else {
                // [3] No module loader (plain <script> tag) - put directly in global namespace
                var mvcct = window["mvcct"]  = window["mvcct"] || {};
                factory(mvcct['enhancer'], window["globalize"]);
            }
        }(

            (function (Enhancer) {
                
                //Start actual code
                var defaults = {
                    "dateFormat": { "date": "short" },
                    "timeFormat": { "skeleton": "Hms" },
                    "timeFormat1": { "skeleton": "Hm" },
                    "datetimeFormat": { "skeleton": "yMdHms" },
                    "datetimeFormat1": { "skeleton": "yMdHm" },
                    "monthFormat": { "date": "short" },
                    "weekFormat": { "date": "short" }
                };
                var options={};
                var initialized = false;
                function getType(node) {
                    var type = node.getAttribute("data-val-correcttype-type") || "3";
                    return parseInt(type);
                }
                function getDateOfISOWeek(cw) {
                    var parts=cw.split('-W');
                    
                    var y=parseInt(parts[0]);
                    var w = parseInt(parts[1]);
                    
                    var simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
                    var dow = simple.getDay();
                    var ISOweekStart = simple;
                    if (dow <= 4)
                        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
                    else
                        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
                    return ISOweekStart;
                }
                function initialize(toptions, Globalize){
                    if(initialized) return;
                    var userOptions=toptions["editFormats"] || {};
                    for(var prop in defaults){
                        options[prop]=userOptions[prop] === undefined ? defaults[prop] : userOptions[prop];
                    }
                    var locale = Globalize["locale"]()["attributes"]["language"];
                    var nInfos = Globalize["cldr"]["get"]('main/' + locale)["numbers"]["symbols-numberSystem-latn"];
                    
                    function numericInputCharHandler(charCode, el, decimalSeparator, plus, minus) {
                        var type = getType(el);
                        var canDecimal = type==3, canNegative = type != 1;
                        var min = el.getAttribute("min");
                        if (!min) min = el.getAttribute("data-val-range-min");
                        if (min && parseFloat(min) >= 0) canNegative = false;
                        if (charCode == 0 || charCode == 13 || charCode == 9 || charCode == 8 || (charCode >= 48 && charCode <= 57)) return true;
                        if (canNegative && (charCode == plus.charCodeAt(0) || charCode == minus.charCodeAt(0))) {
                            var value = el.value;
                            return value.indexOf(plus) < 0 && value.indexOf(minus) < 0;
                        }
                        if (canDecimal && charCode == decimalSeparator.charCodeAt(0)) {
                            var value = el.value;
                            return value.indexOf(decimalSeparator) < 0;
                        }
                        return false;
                    }
                    // event.type must be keypress
                    function getChar(event) {
                        if (event.which == null) {
                                return event.keyCode // IE
                        } else if (event.which!=0 && event.charCode!=0) {
                                return event.which   // the rest
                        } else {
                            return null; // special key
                        }
                    }

                    function enhanceNumeric(input) {
                        if (input.getAttribute("type") != "text") return;
                        input.addEventListener('keypress', function (event) {
                            event = event || window.event;
                            if (!numericInputCharHandler(getChar(event), input, nInfos["decimal"], nInfos["plusSign"], nInfos["minusSign"]))
                                event.preventDefault();
                        });  
                    }
                    if (!toptions["browserSupport"]) toptions["browserSupport"] = {};
                    var handlers = toptions["browserSupport"]["handlers"];
                    if (!handlers) handlers = toptions["browserSupport"]["handlers"] = {};
                    if (!handlers["enhance"]) handlers["enhance"] = {};
                    if (!handlers["enhance"]["number"]) handlers["enhance"]["number"] = enhanceNumeric;
                    if (!handlers["enhance"]["range"]) handlers["enhance"]["range"] = enhanceNumeric;
                    if (!handlers["translateVal"]) {
                
                        var neutralTimeParser = Globalize["dateParser"]({ raw: "HH:mm:ss" });
                        var sTimeParser = Globalize["dateParser"]({ raw: "HH:mm" });
                        var gtimeParser = function (x) { return neutralTimeParser(x) || sTimeParser(x); };
                        var neutralDateTimeParser = Globalize["dateParser"]({ raw: "yyyy-MM-ddTHH:mm:ss" });
                        var sDateTimeParser = Globalize["dateParser"]({ raw: "yyyy-MM-ddTHH:mm" });
                        var gDatetimeParser = function (x) { return neutralDateTimeParser(x) || sDateTimeParser(x);};
                        var neutralDateParser = Globalize["dateParser"]({ raw: "yyyy-MM-dd" });
                        var neutralMonthParser = Globalize["dateParser"]({ raw: "yyyy-MM" });
                        
                        var numberFormatter = Globalize["numberFormatter"]();
                        var timeFormatter =  Globalize["dateFormatter"](options["timeFormat"]);
                        var dateTimeFormatter = Globalize["dateFormatter"](options["datetimeFormat1"]);
                        var dateFormatter = Globalize["dateFormatter"](options["dateFormat"]);
                        
                        var dict = {
                            "range": function (x) { return x ? numberFormatter(parseFloat(x)) : ""; },
                            "number": function (x) { return x ? numberFormatter(parseFloat(x)) : ""; },
                            "time": function (x) { return x ? timeFormatter(gtimeParser(x)) : ""; },
                            "datetime": function (x) { return x ? dateTimeFormatter(gDatetimeParser(x)) : ""; },
                            "date": function (x) { return x ? dateFormatter(neutralDateParser(x)) : ""; },
                            "month": function (x) { return x ? dateFormatter(neutralMonthParser(x)) : ""; },
                            "week": function (x) {
                                return dateFormatter(getDateOfISOWeek(x));
                            }

                        };
                        handlers["translateVal"] = function (value, type, input) {
                            var tr = dict[type];
                            if (tr) return tr(value, type, input);
                            else return value;
                        };
                    }
                    
                    
                    initialized = true;
                }
                
                Enhancer["addBasicInput"]=function(Globalize){
                    Enhancer["register"](null, false, function(x) {initialize(x, Globalize);}, "html5 globalized fallback", true);
                }

                //Finish actual code
                return Enhancer;
            })
        ));
    }());
})();