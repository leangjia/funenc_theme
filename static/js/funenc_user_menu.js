odoo.define('funenc.UserMenu', function (require) {
    "use strict";

    var core = require('web.core');
    var Dialog = require('web.Dialog');
    var UserMenu = require('web.UserMenu');

    var _t = core._t;
    var QWeb = core.qweb;

    var FuenncUserMenu = UserMenu.include({
        template: 'Funenc.user_menu',

        /**
         * @override
         * @returns {Deferred}
         */
        start: function () {
            console.log('the user menu is inited');
            
            var self = this;
            var session = this.getSession();
            // 绑定事件
            this.$el.on('click', '[data-menu]', function (ev) {
                ev.preventDefault();
                var menu = $(this).data('menu');
                self['_onMenu' + menu.charAt(0).toUpperCase() + menu.slice(1)]();
            });
            return this._super.apply(this, arguments).then(function () {
                var $avatar = self.$('.oe_topbar_avatar');
                if (!session.uid) {
                    $avatar.attr('src', $avatar.data('default-src'));
                    return $.when();
                }
                var avatar_src = session.url('/web/image', {
                    model: 'res.users',
                    field: 'image_small',
                    id: session.uid,
                });
                $avatar.attr('src', avatar_src);
            });
        },

        /**
         * @private
         */
        _onMenuLogout: function () {
            this.trigger_up('clear_uncommitted_changes', {
                callback: this.do_action.bind(this, 'logout'),
            });
        },
        /**
         * @private
         */
        _onMenuSettings: function () {
            var self = this;
            var session = this.getSession();
            this.trigger_up('clear_uncommitted_changes', {
                callback: function () {
                    self._rpc({
                        route: "/web/action/load",
                        params: {
                            action_id: "base.action_res_users_my",
                        },
                    })
                        .done(function (result) {
                            result.res_id = session.uid;
                            self.do_action(result);
                        });
                },
            });
        },
        /**
         * @private
         */
        _onMenuSupport: function () {
            window.open('https://www.funenc.com', '_blank');
        },

        /**
         * @private
         */
        _onMenuShortcuts: function () {
            new Dialog(this, {
                size: 'large',
                dialogClass: 'o_act_window',
                title: _t("Keyboard Shortcuts"),
                $content: $(QWeb.render("UserMenu.shortcuts"))
            }).open();
        },
    });

    return FuenncUserMenu;

});
