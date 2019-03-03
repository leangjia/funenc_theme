odoo.define('funenc.ListRender', function (require) {
    "use strict";

    var ListRenderer = require('web.ListRenderer');
    var BasicRenderer = require('web.BasicRenderer');
    var config = require('web.config');
    var core = require('web.core');
    var dom = require('web.dom');
    var field_utils = require('web.field_utils');
    var Pager = require('web.Pager');
    var utils = require('web.utils');
    
    var _t = core._t;

    /**
     * list render
     */
    var FunencListrenderer = ListRenderer.include({
        /**
         * rewrite the render function to eanble more option
         */
        _renderView: function () {
            var self = this;
            console.log(this)

            this.$el.removeClass('table-responsive').empty();

            // destroy the previously instantiated pagers, if any
            _.invoke(this.pagers, 'destroy');
            this.pagers = [];

            var displayNoContentHelper = !this._hasContent() && !!this.noContentHelp;
            // display the no content helper if there is no data to display
            if (displayNoContentHelper) {
                this.$el.html(this._renderNoContentHelper());
                return BasicRenderer.prototype._renderView.apply(this);
            }

            // 这里后面添个属性来控制
            // var $table = $('<table>').addClass('o_list_view table table-sm table-hover table-striped');
            var $table = $('<table>').addClass('o_list_view table table-hover table-bordered');
            
            this.$el.addClass('table-responsive').append($table);
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
            return BasicRenderer.prototype._renderView.apply(this);
        },
    });

    return FunencListrenderer;
});
