from backend import create_app
from image import read_all


app = create_app()


@app.route("/image")
def home():
    return read_all()


if __name__ == "__main__":
    app.run(debug=True)
