/**
 * main menu
 */
odoo.define('funenc.MainMenu', function (require) {
    "use strict";

    var Widget = require('web.Widget');
    var core = require('web.core');

    var FunencMainMenu = Widget.extend({
        template: 'Funenc.Menu',
        _apps: [],

        sideBarLeft: undefined,
        sideBarLeftSecondary: undefined,
        sideBarOverlay: undefined,
        menuToggle: undefined,

        // first level menu
        current_primary_menu: undefined,

        // seccond+ level menu
        current_secondary_menu: undefined,

        events: {
            'click .sidebar-overlay': '_OnSidebarOverlayClick',
            'mouseenter .sidebar-left .nav-item': '_OnMouseEnterMenuItem',
            'click sub_menu_item': '_OnSubMenuItemClick'
        },

        init: function (parent, menu_data) {
            this.menu_data = menu_data || [];
            this._apps = _.map(this.menu_data.children, function (appMenuData) {
                return {
                    actionID: parseInt(appMenuData.action.split(',')[1]),
                    menuID: appMenuData.id,
                    name: appMenuData.name,
                    xmlID: appMenuData.xmlid,
                };
            });
            this._super.apply(this, arguments);
        },

        start: function () {
            this._super.apply(this, arguments);

            // init dom elements
            this.sideBarLeft = this.$(".sidebar-left");
            this.sideBarLeftSecondary = this.$(".sidebar-left-secondary");
            this.mainContainer = $(".main-content-wrap");
            this.sideBarOverlay = $(".sidebar-overlay");
            this.menuToggle = $(".menu-toggle");

            // init the scrollbar
            this.$(".perfect-scrollbar").each(function (e) {
                var n = $(this);
                new PerfectScrollbar(this, {
                    suppressScrollX: n.data("suppress-scroll-x"),
                    suppressScrollY: n.data("suppress-scroll-y")
                })
            })

            // init menu toggle
            var self = this;
            this.menuToggle.on("click", function (e) {
                var mainSideBarOpen = self.sideBarLeft.hasClass("open"),
                    secondSidebarOpen = self.sideBarLeftSecondary.hasClass("open"),
                    data = $(".nav-item.active").data("item");
                if (mainSideBarOpen && secondSidebarOpen && self.isMobile()) {
                    self.main_close(), self.secondary_hide()
                } else if (mainSideBarOpen && secondSidebarOpen) {
                    self.secondary_hide()
                } else if (mainSideBarOpen) {
                    self.main_close()
                } else if (data) {
                    self.main_open(), self.secondary_open()
                } else {
                    self.main_open()
                }
            });

            // Bus event
            core.bus.on('change_menu_section', this, this.change_menu_section);
        },

        /**
         * menu click event handler
         * @param {*} menu_id 
         * @param {*} action_id 
         */
        _trigger_menu_clicked: function (menu_id, action_id) {
            this.trigger_up('menu_clicked', {
                id: menu_id,
                action_id: action_id,
                previous_menu_id: this.current_secondary_menu || this.current_primary_menu,
            });
        },

        _action_id_in_subtree: function (root, action_id) {
            // action_id can be a string or an integer
            if (root.action && root.action.split(',')[1] === String(action_id)) {
                return true;
            }
            var found;
            for (var i = 0; i < root.children.length && !found; i++) {
                found = this._action_id_in_subtree(root.children[i], action_id);
            }
            return found;
        },

        /**
         * change menu section and chose the sub item
         */
        change_menu_section: function (menu_id) {
            var data_id = "main_item_" + menu_id;
            var sub_item = this.$("[data_menu='" + data_id + "']")
            if (!sub_item || !sub_item.length) {
                return;
            }

            var sub_menu_section = sub_item.parents('ul')
            if (!sub_menu_section.length) {
                return;
            }

            this.main_open();
            this.secondary_open();

            var primary_menu = sub_item.data("parent")
            this.current_primary_menu = primary_menu;

            var active_item = this.$('.nav-item.active');
            if (!active_item) {
                this.$("[data-item='" + primary_menu + "']").addClass('active');
            } else {
                var primary = active_item.data('item');
                if (primary == this.current_primary_menu) {
                    return;
                } else {
                    this.$(".nav-item").removeClass("active");
                    this.$("[data-item='" + primary_menu + "']").addClass('active');
                    this.sideBarLeftSecondary.find('[data-parent="' + primary + '"]').show();
                }
            }
        },

        /**
         * open default secondary menu
         */
        default_show: function () {
            var self = this;
            var items = this.$(".nav-item")
            items.each(function (e) {
                var tmp_tiem = $(this);
                if (tmp_tiem.hasClass("active")) {
                    var data = tmp_tiem.data("item");
                    self.sideBarLeftSecondary.find('[data-parent="' + data + '"]').show();
                }
            })
        },

        /**
         * open main menu
         */
        main_open: function () {
            this.sideBarLeft.addClass("open");
            this.mainContainer.addClass("sidenav-open")
        },

        /**
         * hide main menu
         */
        main_close: function () {
            this.sideBarLeft.removeClass("open");
            this.mainContainer.removeClass("sidenav-open")
        },

        /**
         * open scondary menu
         */
        secondary_open: function () {
            this.sideBarLeftSecondary.addClass("open");
            this.sideBarOverlay.addClass("open")
        },

        /**
         * hide secondary menu
         */
        secondary_hide: function () {
            this.sideBarLeftSecondary.removeClass("open");
            this.sideBarOverlay.removeClass("open")
        },

        /**
         * overlay click
         */
        _OnSidebarOverlayClick: function () {
            if (this.isMobile()) {
                this.main_close();
            }
            this.secondary_hide()
        },

        /**
         * check is mobile
         */
        isMobile: function () {
            return window && window.matchMedia("(max-width: 767px)").matches
        },

        /**
         * fist level menuiten enter
         * @param {event} e 
         */
        _OnMouseEnterMenuItem: function (e) {
            var target = $(e.currentTarget),
                tmp_data = target.data("item");
            if (tmp_data) {
                this.$(".nav-item").removeClass("active");
                target.addClass("active");
                this.secondary_open();
            } else {
                this.secondary_hide();
            }
            this.sideBarLeftSecondary.find(".childNav").hide();
            this.sideBarLeftSecondary.find('[data-parent="' + tmp_data + '"]').show()
        },

        /**
         * open first app
         */
        openFirstApp: function () {
            if (!this._apps.length) {
                return
            }
            var firstApp = this._apps[0];
            this.trigger_up('app_clicked', {
                action_id: firstApp.actionID,
                menu_id: firstApp.menuID
            });
        },

        get_main_menu_id: function (menu_id) {
            var self = this;
            var item = _.find(this.menu_data.children, function (menu_data) {
                return self.has_sub_menu_id(menu_data, menu_id);
            })
            return item ? item.id : undefined
        },

        /**
         * action id 转化成为menu id
         */
        action_id_to_menu_id: function (action_id) {
            var self = this;
            var item = _.find(this.menu_data.children, function (menu_data) {
                return self.has_sub_menu_id(menu_data, menu_id);
            })
            return item ? item.id : undefined
        },

        /**
         * 是否有子菜单
         * @param {} root 
         * @param {*} menu_id 
         */
        has_sub_menu_id: function (root, menu_id) {
            var self = this;
            if (root.id == menu_id) {
                return true
            } else if (root.children) {
                for (var i = 0; i < root.children.length; i++) {
                    var tmp = root.children[i];
                    if (self.has_sub_menu_id(tmp, menu_id)) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * find sub menu by action
         */
        find_menu_by_action_id: function (action_id) {
            var self = this;
            for (var i = 0; i < this.menu_data.children.length; i++) {
                var tmp = this.menu_data.children[i];
                var id = self._find_sub_menu_by_acton_id(tmp, action_id)
                if (id) {
                    return id;
                }
            }
            return undefined;
        },

        /**
         * internal method
         * @param {*} root 
         * @param {*} action_id 
         */
        _find_sub_menu_by_acton_id: function (root, action_id) {
            var self = this;
            if (root.action && root.action.split(',')[1] === String(action_id)) {
                return root.id;
            } else if (root.children) {
                for (var i = 0; i < root.children.length; i++) {
                    var tmp = root.children[i];
                    var id = self._find_sub_menu_by_acton_id(tmp, action_id)
                    if (id) {
                        return id;
                    }
                }
            }
            return undefined;
        },

        /**
         * 二级及更深层级菜单点击消息处理
         * @param {event} e 
         */
        _OnSubMenuItemClick: function (ev) {
            ev.preventDefault();
            var target = ev.target;
            var link = $(target).find('a')
            if (!link.length) {
                return;
            }
            var menu_id = link.data('menu');
            var action_id = link.data('action-id');
            if (action_id) {
                self._trigger_menu_clicked(menu_id, action_id);
                //this.current_secondary_menu = menu_id;
            }
        },

        /**
         * get the current primary menu
         */
        getCurrentPrimaryMenu: function () {
            return this.current_primary_menu;
        },

        /**
         * 
         * @param {Integer} menu_id 
         * @param {*} root 
         */
        menu_id_to_action_id: function (menu_id, root) {
            if (!root) {
                root = $.extend(true, {}, this.menu_data);
            }

            if (root.id === menu_id) {
                return root.action.split(',')[1];
            }
            for (var i = 0; i < root.children.length; i++) {
                var action_id = this.menu_id_to_action_id(menu_id, root.children[i]);
                if (action_id !== undefined) {
                    return action_id;
                }
            }
            return undefined;
        },

        /**
         * get first level menu_id by action_id
         * @param {*} action_id 
         */
        action_id_to_primary_menu_id: function (action_id) {
            var primary_menu_id, found;
            for (var i = 0; i < this.menu_data.children.length && !primary_menu_id; i++) {
                found = this._action_id_in_subtree(this.menu_data.children[i], action_id);
                if (found) {
                    primary_menu_id = this.menu_data.children[i].id;
                }
            }
            return primary_menu_id;
        },

        /**
         * get default icon
         */
        get_default_icon: function (menu) {
            var icon = "i-Library"
            switch (menu.name) {
                case 'Apps':
                    icon = "i-Envelope"
                    break;
                case 'Settings':
                    icon = "i-File-Settings"
                    break;
            }
            return icon;
        }
    });

    return FunencMainMenu;
});
