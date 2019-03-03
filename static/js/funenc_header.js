odoo.define('funenc.AppHeader', function (require) {
    "use strict";

    var Widget = require('web.Widget');
    var SystrayMenu = require('web.SystrayMenu');

    /**
     * app header
     */
    var AppHeader = Widget.extend({
        template: 'Funenc.app_header',
        tray_box: undefined,

        /**
         * add app menu and systray menu
         */
        start: function () {
            this._super.apply(this, arguments);

            this.tray_box = this.$('.header-part-right')

            // Systray Menu
            this.systray_menu = new SystrayMenu(this);
            this.systray_menu.appendTo(this.tray_box);

            // $("[data-fullscreen]").on("click", function() {
            //     var e = document.body;
            //     return document.fullScreenElement && null !== document.fullScreenElement || document.mozFullScreen || document.webkitIsFullScreen ? function(e) {
            //         var n = e.cancelFullScreen || e.webkitCancelFullScreen || e.mozCancelFullScreen || e.exitFullscreen;
            //         if (n) n.call(e);
            //         else if (void 0 !== window.ActiveXObject) {
            //             var l = new ActiveXObject("WScript.Shell");
            //             null !== l && l.SendKeys("{F11}")
            //         }
            //     }(document) : function(e) {
            //         var n = e.requestFullScreen || e.webkitRequestFullScreen || e.mozRequestFullScreen || e.msRequestFullscreen;
            //         if (n) n.call(e);
            //         else if (void 0 !== window.ActiveXObject) {
            //             var l = new ActiveXObject("WScript.Shell");
            //             null !== l && l.SendKeys("{F11}")
            //         }
            //     }(e), !1
            // })
        }
    });

    return AppHeader;
});
