from flask import Flask, request, jsonify
from flask_cors import CORS
from detection import get_coords
import json

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def read_process_image():
    input_image = request.get_data()
    yhat = get_coords(input_image)
    # Convert ndarray to list
    yhat_list = yhat.tolist()
    return json.dumps({"coords": yhat_list, "features": ["Photo", "National ID", "First Name", "Second Name"]})

@app.route('/<int:id>/delete', methods=['DELETE'])
def delete_person(id):
    return jsonify({"message": f"Person of id: {id} was deleted successfully"}), 200


if __name__ == '__main__':
    app.run(debug=True)