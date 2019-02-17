odoo.define('funenc.AppHeader', function (require) {
    "use strict";

    var Widget = require('web.Widget');
    var SystrayMenu = require('web.SystrayMenu');

    /**
     * app header
     */
    var AppHeader = Widget.extend({
        template: 'funenc.app_header',

        init: function (parent, menu_data) {
            this._super.apply(this, arguments);
        },

        /**
         * add app menu and systray menu
         */
        start: function () {
            this._super.apply(this, arguments);

            // Systray Menu
            // this.systray_menu = new SystrayMenu(this);
            // this.systray_menu.attachTo(this.$('.funenc_menu_systray'));
        }
    });

    return AppHeader;
});
