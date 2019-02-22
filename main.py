#!/usr/bin/env python

import flask

app = flask.Flask(__name__)

@app.route('/assets/<path:path>')
def send_js(path):
    return flask.send_from_directory('assets', path)

@app.route('/')
def index():
   return flask.render_template('index.html', **{'tested_characters': '你好'})

if __name__ == '__main__':
    app.run(host='0.0.0.0')
