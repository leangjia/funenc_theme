# -*- coding: utf-8 -*-

from odoo.tools.convert import xml_import
from odoo import tools
from odoo.tools import view_validation
from odoo.tools.view_validation import validate
from lxml import etree

import os, logging

_logger = logging.getLogger(__name__)


def relaxng(view_type):
    """ Return a validator for the given view type, or None. """
    if view_type not in _relaxng_cache:
        with tools.file_open(os.path.join(cur_path, '..', 'rng', '%s_view.rng' % view_type)) as frng:
            try:
                relaxng_doc = etree.parse(frng)
                _relaxng_cache[view_type] = etree.RelaxNG(relaxng_doc)
            except Exception:
                _logger.exception('Failed to load RelaxNG XML schema for views validation')
                _relaxng_cache[view_type] = None
    return _relaxng_cache[view_type]

view_validation.relaxng = relaxng

for index, pred in enumerate(view_validation._validators['tree']):
    if pred.__name__ == 'valid_field_in_tree':
        view_validation._validators['tree'].pop(index)
        break

@validate('tree')
def valid_field_in_tree(arch):
    """ Children of ``tree`` view must be ``field`` or ``button``."""
    return all(
        child.tag in ('field', 'button', 'widget')
        for child in arch.xpath('/tree/*')
    )