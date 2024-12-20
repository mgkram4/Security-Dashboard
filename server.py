from datetime import datetime

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)




@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__server__':
    app.run(debug=True)