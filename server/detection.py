import os
import base64
import tensorflow as tf
from tensorflow.keras.models import load_model

# Set TensorFlow to use only the necessary amount of GPU memory
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

model = load_model('./model/boxes_detector_with_2_names_conv2d_struct_wider_boxes.h5')
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

def get_coords(image):
    # Decode the base64 image
    decoded_img = base64.b64decode(image)
    
    # Convert the decoded image to a TensorFlow tensor
    img_tensor = tf.image.decode_jpeg(decoded_img, channels=3)
    
    # Preprocess the image
    img_tensor = tf.image.resize(img_tensor, (205, 320))
    img_tensor = img_tensor / 255.0
    img_tensor = tf.expand_dims(img_tensor, axis=0)  # Add batch dimension
    
    # Perform object detection
    yhat = model.predict(img_tensor)
    return yhat
