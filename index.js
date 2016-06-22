/* jshint node: true */
'use strict';

module.exports = {
    name: 'ember-fuse-select2',

    included: function (app) {
        this._super.included(app);

        var addonAppConfig = app.options[this.name];

        app.import({
            development: app.bowerDirectory + '/select2/select2.js',
            production: app.bowerDirectory + '/select2/select2.min.js'
        });
        app.import(app.bowerDirectory + '/select2/select2.css');
        app.import(app.bowerDirectory + '/select2/select2.png', {destDir: 'assets'});
        app.import(app.bowerDirectory + '/select2/select2x2.png', {destDir: 'assets'});
        app.import(app.bowerDirectory + '/select2/select2-spinner.gif', {destDir: 'assets'});
    }
};

