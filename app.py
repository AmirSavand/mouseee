from os import getcwd, path, environ

import mouse
import requests
from flask import Flask, render_template, json
from flask_sock import Sock

from __init__ import __version__


def get_path(file: str):
    """ :return: Absolute path of given file relative to project. """
    return path.join(getcwd(), file)


# Current project version.
version = f"v{__version__}"

# Flask app setup
app = Flask(__name__, template_folder=get_path("templates"), static_folder=get_path("static"))
app.config.from_file(get_path(environ.get("CONFIG", "config.json")), load=json.load)

# Socket setup
sock = Sock(app)


def check_update():
    """ Check for update and print about it. """
    try:
        response = requests.get("https://api.github.com/repos/AmirSavand/mouseee/releases/latest")
        latest_version = response.json()["tag_name"]
        if version == latest_version:
            print(" * You are using the latest version.")
        else:
            print(f" * Update {latest_version} available at https://github.com/AmirSavand/mouseee/releases/latest")
    except (requests.exceptions.ConnectionError, KeyError):
        print(f" * Skipped checking for update.")
        pass


@app.route("/")
def index():
    return render_template("index.html", version=version)


@sock.route("/")
def handle(instance):
    while True:
        data = json.loads(instance.receive())
        if data["event"] == "click":
            mouse.click(data["data"]["button"])
        elif data["event"] == "move":
            mouse.move(data["data"]["x"], data["data"]["y"], False)


if __name__ == "__main__":
    # Print project name with version
    print(f"\n * Mouseee {version}")
    # Check for update of project
    check_update()
    # Print a separator line
    print("\n")
    # Rune the flask app and socket
    app.run(host="0.0.0.0", port=5555)
