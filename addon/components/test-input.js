import Ember from 'ember';

const {
    TextField,
    $ : Ember$,
    computed,
    get,
    isNone,
    isPresent,
    isBlank,
    observer,
    isArray,
    isEmpty,
    run,
    RSVP
} = Ember;

/**
    Selection control that allows for constant arrays or load on demand

    Supports the following properties See Select2 for more information

    placeholder - placeholder text
    allowClear - (true) Allows the selection to be reset
    closeOnSelect - (true)
    idProperty - ("id")
    labelProperty - ("text")
    caseSensitive - (false) Used with the builtin query when you supply content
    multiple - (false)
    minimumInputLength - (undefined) number of characters before a search will occur
    minimumResultsForSearch - (undefined)
    searchDelayMS - (750 ms) Time to wait after last keystroke to perform search


    content - Assign if you want an array to supply the data.
    query - if you want the load on demand. query must take following function.
    ```javascript
    function(options)
    ```
    value - Will contain the ID of the selected item
    data - Will contain the object of the selected item

    containerCssClass -
    dropdownCssClass -
    formatResultCssClass - default is to apply the resultCssClass property if defined
    dropdownAutoWidth - (true)
    selectOnBlur - (false)
    loadMorePadding - (0)

    searchBeginsWith - (false) set to try to change from contains to begins with

 Events:
    focusAction -
    openAction -
    closeAction -
    blurAction -

 */
var select2field = TextField.extend({
    type: "hidden",

    searchBeginsWith: false,
    idProperty: "id",
    labelProperty: "text",
    caseSensitive: false,

    resultCssClass: undefined,

    openOnFocus: true,

    searchDelayMS: 750,

    value: null,
    data: null,

    // The following are out-of-the-box jQuery select2 properties
    width: Ember$.fn.select2.defaults.width,
    minimumInputLength: Ember$.fn.select2.defaults.minimumInputLength,
    maximumInputLength: Ember$.fn.select2.defaults.maximumInputLength,
    minimumResultsForSearch: Ember$.fn.select2.defaults.minimumResultsForSearch,
    maximumSelectionSize: Ember$.fn.select2.defaults.maximumSelectionSize,
    placeholder: 'Please select...',
    placeholderOption: Ember$.fn.select2.defaults.placeholderOption,
    separator: Ember$.fn.select2.defaults.separator,
    allowClear: true,
    multiple: false,
    closeOnSelect: true,
    openOnEnter: Ember$.fn.select2.defaults.openOnEnter,
    sortResults: Ember$.fn.select2.defaults.sortResults,
    formatResultCssClass: Ember$.fn.select2.defaults.formatResultCssClass,
    formatNoMatches: Ember$.fn.select2.defaults.formatNoMatches,
    formatSearching: Ember$.fn.select2.defaults.formatSearching,
    formatAjaxError: Ember$.fn.select2.defaults.formatAjaxError,
    formatInputTooShort: Ember$.fn.select2.defaults.formatInputTooShort,
    formatInputTooLong: Ember$.fn.select2.defaults.formatInputTooLong,
    formatSelectionTooBig: Ember$.fn.select2.defaults.formatSelectionTooBig,
    formatLoadMore: Ember$.fn.select2.defaults.formatLoadMore,
    createSearchChoice: Ember$.fn.select2.defaults.createSearchChoice,
    createSearchChoicePosition: Ember$.fn.select2.defaults.createSearchChoicePosition,
    initSelection: Ember$.fn.select2.defaults.initSelection,
    tokenizer: Ember$.fn.select2.defaults.tokenizer,
    tokenSeparators: Ember$.fn.select2.defaults.tokenSeparators,
    ajax: Ember$.fn.select2.defaults.ajax,
    tags: Ember$.fn.select2.defaults.tags,
    containerCss: Ember$.fn.select2.defaults.containerCss,
    dropdownCss: Ember$.fn.select2.defaults.dropdownCss,
    dropdownAutoWidth: true,
    adaptContainerCssClass: Ember$.fn.select2.defaults.adaptContainerCssClass,
    adaptDropdownCssClass: Ember$.fn.select2.defaults.adaptDropdownCssClass,
    escapeMarkup: Ember$.fn.select2.defaults.escapeMarkup,
    selectOnBlur: false,
    loadMorePadding: 0,
    nextSearchTerm: Ember$.fn.select2.defaults.nextSearchTerm,

    click: function() {
        this.open();
    },

    /**
     * Format the result
     *
     * default is to just get the label
     */
    formatResult: computed(function() {
        return this._getLabel();
    }),

    /**
     * Format the selection
     *
     * default is to just get the label
     */
    formatSelection: computed(function() {
        return this._getLabel();
    }),

    //    focusIn: function() {
    //        this.open();
    //    },

    open: function(){
        this.$().select2("open");
    },

    close: function() {
        this.$().select2("close");
    },

    init: function() {
        this._super();
    },

    _contains: function(arr, value) {
        var eArr = Ember.A(arr),
            eArrLength = eArr.get("length");
        for (var i=0; i < eArrLength; ++i) {
            if (String(eArr.objectAt(i)) === String(value)) {
                return true;
            }
        }
        return false;
    },

    /**
     *
     * @param valueChosen - number, string, or delimited separated string
     * @returns {Array} must be regular javascript array for jquery
     * @private
     */
    _syncOnValue: function(valueChosen) {
        var data = [];
        var valueArray;
        var contentArray;
        var idProperty = this.get("idProperty");

        // Content could be a promise. If so, unwrap the content of the promise
        var content = this.get("content");
        if(content && content.then) { // Promise
            content = get(content, "content");
        }

        if (isNone(content)) {
            // If no content, then the data should simply be what select2 has set.  We have no way to look up the
            // data from the content array.
            data.push(isEmpty(valueChosen) ? null : this.$().select2("data"));

        } else {
            // Ensure we have a NativeArray
            contentArray = Ember.A(content);
            // Ensure we have NativeArray of values
            valueArray = Ember.A(String(valueChosen).split(this.get("separator")));

            // recursive function
            var search = function(currentContentArray) {
                currentContentArray.forEach(function(item){
                    var id = String(get(item, idProperty));

                    if(valueArray.contains(id)) {
                        data.push(item);
                    }

                    var children = get(item, "children");
                    if(isPresent(children)) {
                        search(children);
                    }

                });

            };

            search(contentArray);

        }

        // if not multi, select the first item or null
        if (this.get("multiple") === false) {
            data = (data.length === 0) ? null : data[0];
        }

        this.set("data", data);
        return data;
    },

    valueChanged: observer("value", function() {
        if (this.$()) {
            this._syncOnValue(this.get("value"), null);
        }
    }),

    dataChanged: observer("data", function(){
        if (this.$()) {
            var obj=this.get("data");
            this.$().select2("data", obj);

            if(isNone(obj)){
                this.$().select2("val", null);
            }
        }
    }),

    disabledChanged: observer("disabled", function() {
        if (this.$()) {
            this.$().select2("enable", ! this.get("disabled"));
        }
    }),

    "select2-closed": false,
    "isClosed": true,

    didInsertElement: function() {
        var self = this;
        if (!this.$().select2) {
            throw new Error('select2 is required for Select2Field control');
        }

        var placeholderText = this.get('placeholder') || '';
        var options = {
            width: this.get("width"),
            minimumInputLength: this.get("minimumInputLength"),
            maximumInputLength: this.get("maximumInputLength"),
            minimumResultsForSearch: this.get("minimumResultsForSearch"),
            maximumSelectionSize: this.get("maximumSelectionSize"),
            placeholder: placeholderText,
            placeholderOption: this.get("placeholderOption"),
            separator: this.get("separator"),
            allowClear: this.get('allowClear'),
            multiple: this.get("multiple"),
            closeOnSelect: this.get('closeOnSelect'),
            openOnEnter: this.get("openOnEnter"),
            id: this.getId(),
            matcher: this.matcher(),
            sortResults: this.get("sortResults"),
            formatSelection: this.get("formatSelection"),
            formatResult: this.get("formatResult"),
            formatResultCssClass: this.get("formatResultCssClass"),
            formatNoMatches: this.get("formatNoMatches"),
            formatSearching: this.get("formatSearching"),
            formatAjaxError: this.get("formatAjaxError"),
            formatInputTooShort: this.get("formatInputTooShort"),
            formatInputTooLong: this.get("formatInputTooLong"),
            formatSelectionTooBig: this.get("formatSelectionTooBig"),
            formatLoadMore: this.get("formatLoadMore"),
            createSearchChoice: this.get("createSearchChoice"),
            createSearchChoicePosition: this.get("createSearchChoicePosition"),
            initSelection: this.get("initSelection"),
            tokenizer: this.get("tokenizer"),
            tokenSeparators: this.get("tokenSeparators"),
            query: this._queryProxy(),
            ajax: this.get("ajax"),
            containerCss: this.get("containerCss"),
            containerCssClass: this.get("containerCssClass"),
            dropdownCss: this.get("dropdownCss"),
            dropdownCssClass: this.get("dropdownCssClass"),
            dropdownAutoWidth: this.get("dropdownAutoWidth"),
            adaptContainerCssClass: this.get("adaptContainerCssClass"),
            adaptDropdownCssClass: this.get("adaptDropdownCssClass"),
            escapeMarkup: this.get("escapeMarkup"),
            selectOnBlur: this.get("selectOnBlur"),
            loadMorePadding: this.get("loadMorePadding"),
            nextSearchTerm: this.get("nextSearchTerm")
        };

        var select2 = this.$().select2(options);

        // set the initial Selection
        var data;
        if ( ! isEmpty(this.get("value"))) {
            // The value is not empty, so sync on it.
            data = this._syncOnValue(this.get("value"));
        }
        else {
            // The value was empty, so push the data in.  The data observer will set the select2 val, which will, in
            // turn, set the component value appropriately.
            data = this.get("data");
            this.$().select2("data", data);
        }

        select2.on('select2-focus', function(event){
            self._sendAction("focusAction", event);

            if( self.get('select2-closed') ){
                self.set('select2-closed', false);
                self.set("isClosed", true);
                return;
            }

            if (self.get("openOnFocus")) {
                run.next(function(){
                    self.open();
                });
            }
        });
        select2.on("select2-open", function(event){
            self.set("isClosed", false);
            self._sendAction("openAction", event);
        });
        select2.on("select2-close", function(event){
            self.set("select2-closed", true);
            self.set("isClosed", true);
            self._sendAction("closeAction", event);
        });
        select2.on("select2-blur", function(event){
            self._sendAction("blurAction", event);
        });
    },

    _sendAction: function(action, event) {
        if(isNone(this.get(action)) === false){
            if (isNone(this.sendAction) === false){
                this.sendAction(action, event);
            }
        }
    },

    /**
     * User function to allow searching of fixed data
     */
    search: null,

    defaultMatcher: function(term, text, option) {

        var hasId = isNone(get(option, this.get("idProperty"))) === false;

        // TODO: Allow for case insensitive match
        // TODO: Convert to regex
        var matchesText = isNone(text) === false && text.toUpperCase().indexOf(term.toUpperCase())>=0;

        return hasId && matchesText;
    },

    matcher: function() {
        var self = this;
        return function(term, text, option) {
            if (isNone(self.search)) {
                return self.defaultMatcher(term, text, option);
            } else {
                return self.search(term, text, option);
            }
        };
    },

    getId: function() {
        var self = this;
        return function(item) {
            return get(item, self.get("idProperty"));
        };
    },

    /**
     * default implementation for formatResult and formatSelection
     *
     * just returns the label
     *
     * @returns {Function}
     * @private
     */
    _getLabel: function() {
        var self = this;
        return function(item) {
            return get(item, self.get("labelProperty"));
        };
    },

    willDestroyElement: function () {
        this.$().select2("destroy");
    },

    queryToPerform: computed("query", function() {
        if (isNone(this.get("query"))) {
            return this._internalQuery;
        } else {
            return this._query;
        }
    }),

    _performQuery: function(options) {
        var queryFunc = this.get("queryToPerform");
        queryFunc.apply(this, [options]);
    },

    _queryProxy: function() {
        var self = this;
        return function(options) {
            run.debounce(self, self._performQuery, options, self.get("searchDelayMS"));
        };
    },

    _query: function(options) {
        // Get the query they provided
        var query = this.get("query");

        // If query is a string, return a function that calls our action
        if (Ember.typeOf(query) === "string") {
            this.sendAction("query", options);
        } else {
            query(options);
        }
    },

    _internalData: computed("content", function() {
        var self = this;
        return new RSVP.Promise(function(resolve /*, reject */){
            var content = self.get("content");
            if (isNone(content)) {
                resolve(Ember.A());
            } else {
                RSVP.Promise.cast(content).then(function(results){
                    if (Ember.typeOf(results) === "instance" && results.toArray) {
                        results = results.toArray();
                    }
                    resolve(results);
                });
            }
        });
    }),

    _internalQuery: function(query) {
        var self = this;
        var text = self._getLabel(); // function used to retrieve the text portion of a data item that is matched against the search

        var process = function(datum, collection) {
            var group,
                attr;

            if (get(datum, "children")) {
                group = {};
                for (attr in datum) {
                    if (datum.hasOwnProperty(attr)) {
                        group[attr]= get(datum, attr);
                    }
                }

                group.children=Ember.A();

                get(datum, "children").forEach(function(childDatum) { process(childDatum, group.children); } );

                if (group.children.length) { // Do not include the header in the search || query.matcher(t, text(group), datum)) {
                    collection.push(group);
                }
            } else {
                if (query.matcher(query.term, text(datum), datum)) {
                    collection.push(datum);
                }
            }
        };

        var content = self.get("_internalData");
        RSVP.Promise.cast(content).then(function(results){
            // If the object no longer exists, dont call the callback.
            // there are times during the destroy that fo some reason
            // it invokes the search function
            if (isNone(self.$())) {
                return;
            }

            var filtered = { results: Ember.A() };

            if (isBlank(query.term)) {
                query.callback({ results: results} );
            } else {

                if (isArray(results)) {
                    results.forEach(function (datum) {
                        process(datum, filtered.results);
                    });
                }

                query.callback(filtered);

            }
        });
    }
});

export default select2field;
