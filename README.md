# Object Detection Application

This project is an object detection application with a backend server and a frontend client. The backend is built with Python, while the frontend is built with React.

## Folder Structure

```sh
/server
├── app.py
├── backend_sanity
│   ├── .eslintrc
│   ├── .gitignore
│   ├── .sanity
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── person-ids.ndjson
│   ├── README.md
│   ├── sanity.cli.js
│   ├── sanity.config.js
│   ├── schemaTypes
│   │   └── person.js
│   ├── static
│   ├── __init__.py
│   └── detection.py
├── Dockerfile
├── fly.toml
├── model
└── requirements.txt

/client
├── Dockerfile
├── fly.toml
├── package-lock.json
├── package.json
├── public
└── src
    └── client.js
```

## Backend

The backend is responsible for handling object detection requests. It is built with Python and uses a pre-trained model for detection.

### Files

- `app.py`: Main application file that sets up the Flask server and defines the API endpoints.
- `/backend_sanity/detection.py`: Contains the object detection logic using TensorFlow.
- `/backend_sanity/schemaTypes/person.js`: Defines the schema for the "Person" document in Sanity.
- `Dockerfile`: Docker configuration for the backend.
- `fly.toml`: Configuration file for deploying with Fly.io.
- `model`: Directory containing the pre-trained model.
- `requirements.txt`: Python dependencies.

### Running the Backend

1. **Build the Docker image**:

   ```sh
   docker build -t object-detection-backend .
   ```

2. **Run the Docker container**:
   ```sh
   docker run -p 5000:5000 object-detection-backend
   ```

### Backend Explanation

- **`app.py`**:

  - Sets up a Flask application and enables CORS to allow requests from the frontend.
  - Defines a GET endpoint at `/` that returns a welcome message.
  - Defines a POST endpoint at `/` that accepts an image, processes it using the `get_coords` function from `detection.py`, and returns the detected coordinates and features.
  - Defines a DELETE endpoint at `/<int:id>/delete` that simulates deleting a person by ID.

- **`detection.py`**:

  - Loads a pre-trained TensorFlow model for object detection.
  - Defines the `get_coords` function that:
    - Decodes a base64-encoded image.
    - Preprocesses the image to the required input size for the model.
    - Uses the model to predict the coordinates of detected objects in the image.
    - Returns the predicted coordinates.

- **`schemaTypes/person.js`**:
  - Defines the schema for a "Person" document in Sanity, including fields for value, title, person photo, national ID, first name, second name, and photo fingerprint.

## Frontend

The frontend is a React application that interacts with the backend to display object detection results.

### Files

- `Dockerfile`: Docker configuration for the frontend.
- `fly.toml`: Configuration file for deploying with Fly.io.
- `package-lock.json`: Lockfile for npm dependencies.
- `package.json`: Contains project metadata and dependencies.
- `public`: Public assets.
- `src/client.js`: Sets up the Sanity client and image URL builder.

### Running the Frontend

1. **Build the Docker image**:

   ```sh
   docker build -t object-detection-client .
   ```

2. **Run the Docker container**:
   ```sh
   docker run -p 8080:8080 object-detection-client
   ```

### Frontend Explanation

- **`client.js`**:
  - Sets up the Sanity client using the project ID, dataset, API version, and token from environment variables.
  - Configures the image URL builder to generate URLs for images stored in Sanity.

## Environment Variables

The frontend uses environment variables to configure the API URL and Sanity client. Create a `.env` file in the `/client` directory with the following content:

```
REACT_APP_API_URL=https://object-detection-backend.fly.dev
REACT_APP_projectId=your_project_id
REACT_APP_token=your_sanity_token
```

## API Endpoints

The frontend interacts with the following API endpoints:

- `POST /`: Upload an image for object detection.
- `DELETE /:id/delete`: Delete an image by ID.
- `GET /`: Retrieve information about the detected objects.

## Deployment

Both the backend and frontend can be deployed using Fly.io. Ensure you have the Fly CLI installed and configured.

### Deploying the Backend

1. **Login to Fly.io**:

   ```sh
   flyctl auth login
   ```

2. **Deploy the backend**:
   ```sh
   flyctl deploy
   ```

### Deploying the Frontend

1. **Login to Fly.io**:

   ```sh
   flyctl auth login
   ```

2. **Deploy the frontend**:
   ```sh
   flyctl deploy
   ```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
