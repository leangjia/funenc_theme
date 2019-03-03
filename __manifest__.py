# -*- coding: utf-8 -*-
{
    'name': "funenc_theme_pub",

    'summary': """
        北京富能通科技有限公司主题""",

    'description': """
        北京富能通科技有限公司主题(public)
    """,

    'author': "chun.xu@funenc.com",
    'website': "http://www.funenc.com",

    'category': 'funenc',
    'version': '1.0.1',

    'depends': ['base'],

    'data': [
        'views/assets.xml',
        'views/base.xml'
    ],

    'qweb': [
        'static/xml/funenc_header.xml',
        'static/xml/funenc_menu.xml',
        'static/xml/funenc_table.xml',
        'static/xml/funenc_switch_btn.xml',
        'static/xml/funenc_user_menu.xml'
    ],

    'application': True
}