# -*- coding: utf-8 -*-

# from odoo import http
# from odoo.addons.web.controllers.main import Home, ensure_db
# from odoo.http import request
# import werkzeug
# from odoo.exceptions import AccessError
# import werkzeug.utils


# class ThemeHome(Home, http.Controller):
#
#     # ideally, this route should be `auth="user"` but that don't work in non-monodb mode.
#     @http.route('/web', type='http', auth="none")
#     def web_client(self, s_action=None, **kw):
#         ensure_db()
#         if not request.session.uid:
#             return werkzeug.utils.redirect('/web/login', 303)
#         if kw.get('redirect'):
#             return werkzeug.utils.redirect(kw.get('redirect'), 303)
#
#         request.uid = request.session.uid
#         try:
#             context = request.env['ir.http'].webclient_rendering_context()
#             response = request.render('funenc.webclient', qcontext=context)
#             response.headers['X-Frame-Options'] = 'DENY'
#             return response
#         except AccessError:
#             return werkzeug.utils.redirect('/web/login?error=access')