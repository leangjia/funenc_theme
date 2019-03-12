odoo.define('funenc.web_client', function (require) {
    "use strict";

    var ActionManager = require('web.ActionManager');
    var dom = require('web.dom');
    var session = require('web.session');
    var WebClient = require('web.WebClient');
    var AppHeader = require('funenc.AppHeader');
    var Menu = require('funenc.MainMenu');
    var core = require('web.core');
    
    var FunencWebClient = WebClient.include({
        appHeader: undefined,

        init: function (parent) {
            this._super.apply(this, arguments);
        },

        /**
         *  重写使用 app-admin-wrap 作为容器
         */
        set_action_manager: function () {
            var self = this;
            this.action_manager = new ActionManager(this, session.user_context);
            var fragment = document.createDocumentFragment();
            return this.action_manager.appendTo(fragment).then(function () {
                dom.append(self.$('.main-content-wrap'), fragment, {
                    in_DOM: true,
                    callbacks: [{ widget: self.action_manager }],
                });
            });
        },

        show_application: function () {
            var self = this;
            this.set_title();

            return $.when(this.instanciate_header(), this.instanciate_menu_widgets()).then(function () {
                $(window).bind('hashchange', self.on_hashchange);

                // If the url's state is empty, we execute the user's home action if there is one (we
                // show the first app if not)
                if (_.isEmpty($.bbq.getState(true))) {
                    return self._rpc({
                        model: 'res.users',
                        method: 'read',
                        args: [session.uid, ["action_id"]],
                    })
                        .then(function (result) {
                            var data = result[0];
                            if (data.action_id) {
                                return self.do_action(data.action_id[0]).then(function () {
                                    // 找到相应的菜单
                                    // self.menu.change_menu_section(self.menu.action_id_to_primary_menu_id(data.action_id[0]));
                                });
                            } else {
                                //self.menu.openFirstApp();
                            }
                        });
                } else {
                    return self.on_hashchange();
                }
            });
        },

        instanciate_header: function () {
            this.appHeader = new AppHeader(this);
            var fragment = document.createDocumentFragment();
            // 这样做有什么好处呢?
            return this.appHeader.appendTo(fragment).then(function () {
                dom.append(self.$('.main-header'), fragment);
            });
        },

        instanciate_menu_widgets: function () {
            var self = this;
            var defs = [];
            return this.load_menus().then(function (menuData) {
                self.menu_data = menuData;

                // Here, we instanciate every menu widgets and we immediately append them into dummy
                // document fragments, so that their `start` method are executed before inserting them
                // into the DOM.
                if (self.menu) {
                    self.menu.destroy();
                }
                self.menu = new Menu(self, menuData);
                defs.push(self.menu.prependTo(self.$('.side-content-wrap')));
                return $.when.apply($, defs);
            });
        },

        current_action_updated: function (action, controller) {
            // this._super.apply(this, arguments);
            // var debugManager = _.find(this.menu.systray_menu.widgets, function(item) {
            //     return item instanceof DebugManager;
            // });
            // debugManager.update('action', action, controller && controller.widget);
        },

        on_hashchange: function (event) {
            if (this._ignore_hashchange) {
                this._ignore_hashchange = false;
                return $.when();
            }
    
            var self = this;
            return this.clear_uncommitted_changes().then(function () {
                var stringstate = $.bbq.getState(false);
                if (!_.isEqual(self._current_state, stringstate)) {
                    var state = $.bbq.getState(true);
                    if (state.action || (state.model && (state.view_type || state.id))) {
                        return self.action_manager.loadState(state, !!self._current_state).then(function () {
                            if (state.menu_id) {
                                if (state.menu_id !== self.menu.current_primary_menu) {
                                    core.bus.trigger('change_menu_section', state.menu_id);
                                }
                            } else {
                                var action = self.action_manager.getCurrentAction();
                                if (action) {
                                    var menu_id = self.menu.action_id_to_primary_menu_id(action.id);
                                    core.bus.trigger('change_menu_section', menu_id);
                                }
                            }
                        });
                    } else if (state.menu_id) {
                        var action_id = self.menu.menu_id_to_action_id(state.menu_id);
                        return self.do_action(action_id, {clear_breadcrumbs: true}).then(function () {
                            core.bus.trigger('change_menu_section', state.menu_id);
                        });
                    } else {
                        self.menu.openFirstApp();
                    }
                }
                self._current_state = stringstate;
            }, function () {
                if (event) {
                    self._ignore_hashchange = true;
                    window.location = event.originalEvent.oldURL;
                }
            });
        }
    });

    return FunencWebClient;
});
