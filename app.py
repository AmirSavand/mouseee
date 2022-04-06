from os import getcwd, path

import mouse
from flask import Flask, render_template, json
from flask_sock import Sock

from __init__ import __version__


def get_path(file: str):
    return path.join(getcwd(), file)


app = Flask(__name__, template_folder=get_path("templates"), static_folder=get_path("static"))
app.config.from_file(get_path("config.json"), load=json.load)

sock = Sock(app)


@app.route("/")
def index():
    return render_template("index.html")


@sock.route("/")
def handle(instance):
    while True:
        data = json.loads(instance.receive())
        if data["event"] == "click":
            mouse.click(data["data"]["button"])
        elif data["event"] == "move":
            mouse.move(data["data"]["x"], data["data"]["y"], False)


if __name__ == "__main__":
    print(f"Mouseee v{__version__}\n")
    app.run(host="0.0.0.0", port=5555)
