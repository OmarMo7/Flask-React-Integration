from flask import Flask, request
from flask_cors import CORS
from image import perform_object_detection, execute
import base64
import json

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def read_image():
    data = request.get_data()
    execute(data)
    yhat = perform_object_detection()
    yhat_list = yhat.tolist()  # Convert ndarray to list
    return json.dumps({"coords": yhat_list, "features": ["Photo", "National ID", "First Name", "Second Name"]})

if __name__ == '__main__':
    app.run(debug=True)