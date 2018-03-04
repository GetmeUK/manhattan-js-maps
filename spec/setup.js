import * as jsdom from 'jsdom'

const {JSDOM} = jsdom
const {window} = new JSDOM('')
const {document} = (new JSDOM('')).window

global.window = window
global.document = document
global.Node = {'ELEMENT_NODE': 1}
