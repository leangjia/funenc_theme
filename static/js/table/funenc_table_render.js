odoo.define('funenc.fnt_table_render', function (require) {
    "use strict";

    /**
     * render for fnt_table
     */

    var core = require('web.core');
    var ListRenderer = require('web.ListRenderer');

    var _lt = core._lt;

    var fnt_table_render = ListRenderer.extend({
        header_template: 'funenc.fnt_table_header',
        fixed_left_template: 'funenc.fnt_table_header',
        fixed_right_template: 'funenc.fnt_table_header',
        /**
         * 
         */
        _renderView: function () {
            var self = this;

            this.$el
                .removeClass('table-responsive')
                .empty();

            // destroy the previously instantiated pagers, if any
            _.invoke(this.pagers, 'destroy');
            this.pagers = [];

            var displayNoContentHelper = !this._hasContent() && !!this.noContentHelp;
            // display the no content helper if there is no data to display
            if (displayNoContentHelper) {
                this.$el.html(this._renderNoContentHelper());
                return this._super();
            }

            var $table = $('<table>').addClass('o_list_view table table-sm table-hover table-striped');
            this.$el.addClass('table-responsive')
                .append($table);
            this._computeAggregates();
            $table.toggleClass('o_list_view_grouped', this.isGrouped);
            $table.toggleClass('o_list_view_ungrouped', !this.isGrouped);
            this.hasHandle = this.state.orderedBy.length === 0 ||
                this.state.orderedBy[0].name === this.handleField;
            if (this.isGrouped) {
                $table
                    .append(this._renderHeader(true))
                    .append(this._renderGroups(this.state.data))
                    .append(this._renderFooter());
            } else {
                if (this.hasLeftFixedPart()) {
                    // left side
                    this.renderLeftFixedPart();
                } else if (this.hasRightFixedPart()) {
                    // right side
                    this.renderRightFixedPart();
                }
                $table
                    .append(this._renderHeader())
                    .append(this._renderBody())
                    .append(this._renderFooter());
            }
            if (this.selection.length) {
                var $checked_rows = this.$('tr').filter(function (index, el) {
                    return _.contains(self.selection, $(el).data('id'));
                });
                $checked_rows.find('.o_list_record_selector input').prop('checked', true);
            }
            return this._super();
        },

        /**
         * check have fixed left
         */
        hasLeftFixedPart: function () {
            return _.find(this.arch.children, function (item) {
                if (item.attrs.fixed_left) {
                    return true;
                }
                return false;
            })
        },

        /**
         * check have fixed right column
         */
        hasRightFixedPart: function () {
            return _.find(this.arch.children, function (item) {
                if (item.attrs.fixed_right) {
                    return true;
                }
                return false;
            })
        },

        /**
         * the left fixed part
         */
        renderLeftFixedPart: function () {
            var container = $(core.qweb.render('funenc.fnt_table_fixed_l', { widget: this }).trim());
            var header = this._renderHeader(true, false);
            var body = this._renderBody(true, false);
        },

        /**
         * the right fixed part
         */
        renderRightFixedPart: function () {
            var container = $(core.qweb.render('funenc.fnt_table_fixed_r', { widget: this }).trim());
            var header = this._renderHeader(false, true);
            var body = this._renderBody(false, true);
        },

        /**
         * render the ungroup header
         * @param {Boolean} bLeft 
         * @param {Boolean} bRight 
         */
        _renderUnGroupHeader: function (bLeft, bRight) {
            var self = this;
            var $tr = $('<tr>')
            if (bLeft) {
                _.map(self.columns, function (node) {
                    if (node.attrs.fixed_left) {
                        var th = self._renderHeaderCell.apply(self, node);
                        $tr.append(th);
                    }
                })
            } else if (bRight) {
                _.map(self.columns, function (node) {
                    if (node.attrs.fixed_right) {
                        var th = self._renderHeaderCell.apply(self, node);
                        $tr.append(th);
                    }
                })
            } else {
                _.map(self.columns, function (node) {
                    if (!node.attrs.fixed_right && !node.attrs.fixed_left) {
                        var th = self._renderHeaderCell.apply(self, node);
                        $tr.append(th);
                    }
                })
            }
            return $tr;
        },

        /**
         * render the ungroup body
         * @param {Boolean} bLeft 
         * @param {Boolean} bRight 
         */
        _renderUnGroupBody: function (bLeft, bRight) {
            var $rows = undefined;
            if (bLeft) {
                $rows = this._renderUnGroupRows(true, false);
            } else if (bRight) {
                $rows = this._renderUnGroupRows(false, true);
            } else {
                $rows = this._renderUnGroupRows(false, false);
            }
            return $('<tbody>').append($rows);
        },

        /**
         * render ungroup rows
         */
        _renderUnGroupRows: function(bLeft, bRight) {
            var self = this;
            var $trs = []
            return _.map(this.state.data, function(record, bLeft, bRight) {
                self._renderUnGroupRow(record, bLeft, bRight);
            });
        },

        /**
         * group row
         * @param {record} record 
         * @param {Boolean} bLeft 
         * @param {Boolean} bRight 
         */
        _renderUnGroupRow: function (record, bLeft, bRight) {
            if(bLeft && bRight) {
                console.log('left and right can not all be true')
                return
            }
            var self = this;
            this.defs = []; // TODO maybe wait for those somewhere ?
            var $cells = [];
            _.each(this.columns, function(node, index) {
                if(bLeft) {
                    if(node.attrs.fixed_left) {
                        var cell = self._renderBodyCell(record, node, index, { mode: 'readonly' });
                        $cells.append(cell)
                    }
                } else if(bRight) {
                    if(node.attrs.fixed_right) {
                        var cell = self._renderBodyCell(record, node, index, { mode: 'readonly' });
                        $cells.append(cell)
                    }
                } else {
                    if(!node.attrs.fixed_left && !node.attrs.fixed_right) {
                        var cell = self._renderBodyCell(record, node, index, { mode: 'readonly' });
                        $cells.append(cell)
                    }
                }
            })
            delete this.defs;
            var $tr = $('<tr/>', { class: 'o_data_row' })
                .data('id', record.id)
                .append($cells);
            this._setDecorationClasses(record, $tr);
            return $tr;
        }
    });

    return fnt_table_render;

});
