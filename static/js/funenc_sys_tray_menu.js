odoo.define('funenc.systrayMenu', function (require) {
    "use strict";

    var SystrayMenu = require('web.SystrayMenu');

    /**
     * 重写，添加样式
     */
    var SystrayMenu = SystrayMenu.include({
        start: function () {
            this._super.apply(this, arguments);
            this.$el.addClass('funenc_systray_menu')
        }
    });

    return SystrayMenu;
});
