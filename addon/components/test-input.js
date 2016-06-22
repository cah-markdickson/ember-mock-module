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
var textField = TextField.extend({
});

export default textField;
