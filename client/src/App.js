import React, { useState, useEffect } from 'react';
import { AppBar, Box, Card, CardMedia, Container, Typography, Grid, CircularProgress, Button } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import useStyles from './styles'
import { sendImageToAPI, getPerson, deletePerson } from './actions';
import { client } from './client';

function App() {
  const [data, setData] = useState('');
  const [persons, setPersons] = useState([]);
  const [coords, setCoords] = useState([]);
  const [features, setFeatures] = useState([]);
  const [originalImage, setOriginalImage] = useState([]);
  const [base64_result, setBase64_result] = useState('');
  const [croppedImages, setCroppedImages] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null); // New state to keep track of the selected document
  const classes = useStyles();

    
  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  
  async function generateImageFingerprint(base64String) {
    // Remove the data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // Decode base64 string to binary string
    const binaryString = window.atob(base64Data);

    // Create an array buffer from the binary string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the array buffer
    const blob = new Blob([bytes], { type: 'image/jpeg' }); // Adjust MIME type as needed

    // Convert Blob to ArrayBuffer
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fingerprint = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return fingerprint;
}

  const handleDeleteClick = async (id, incrementalId) => {
    await deleteDocument(id);
    await deletePerson(incrementalId);
    setPersons(persons.filter((person) => person.incrementalId !== incrementalId));
    setSelectedDocument(null); // Reset the selected document after deletion
  };

  const deleteDocument = async (id) => {
    try {
      const response = await client.delete(id);
      console.log('Document deleted:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error.message);
      throw error;
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('You clicked submit.');
  
    try {
      const currentPhotoFingerprint = await generateImageFingerprint(base64_result);
      console.log(currentPhotoFingerprint)
      const fingerPrintExists = persons.some(person => String(person.photo_fingerprint) === String(currentPhotoFingerprint));
      console.log(persons)
      if (fingerPrintExists) {
        setShowMessage(true);
      } else {
        setShowMessage(false);
        sendImageToAPI(base64_result).then(
          (outputImages) => {
            setCoords(outputImages.coords[0])
            setFeatures(outputImages.features)
          }
        )
      }
    } catch (error) {
      console.log('Failed to generate image fingerprint with the error: ', error);
    }

  }
  

  const encodeImageFileAsURL = (e) => {
    let base64String = "";

    setData(URL.createObjectURL(e.target.files[0]))

    var file = e.target.files[0];
    setOriginalImage(file)
    var reader = new FileReader();

    reader.onload = function () {
      base64String = reader.result.replace("data:", "")
        .replace(/^.+,/, "");
      setBase64_result(base64String)
    }
    reader.readAsDataURL(file);
  }
  

  const cropAndSliceImage = () => {
    const croppedImagesArray = coords.map((coord) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
  
      img.src = URL.createObjectURL(originalImage);
  
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = Math.round(coord[2] * img.width) - Math.round(coord[0] * img.width);
          canvas.height = Math.round(coord[3] * img.height) - Math.round(coord[1] * img.height);
          ctx.drawImage(
            img,
            Math.round(coord[0] * img.width),
            Math.round(coord[1] * img.height),
            canvas.width,
            canvas.height,
            0,
            0,
            canvas.width,
            canvas.height
          );
  
          const base64Image = canvas.toDataURL('image/jpeg');
          resolve(base64Image);
        };
      });
    });
  
    Promise.all(croppedImagesArray).then((images) => {
      setCroppedImages(images);
      uploadImagesToSanity(images);
    });
  };


  const getNextIncrementalId = async () => {
    const transaction = client.transaction();
  
    let counterDoc;
    let nextId;
    const result = await client.getDocument('person');
    if (result === undefined) {
      nextId = 1;
    } else {
      counterDoc = result;
      nextId = counterDoc.value + 1;
      transaction.patch(counterDoc._id, { set: { value: nextId } });
      await transaction.commit();
    }
    console.log(counterDoc)
    console.log(nextId)
  
  
    return nextId;
  };

  const populatePageWithData = async () => {
    const query = '*[_type == "person"]';
    const persons = await client.fetch(query)

    setPersons(persons)
  }

  const uploadImagesToSanity = async (images) => {
    try {
      const uploadedImages = await Promise.all(images.map(async (image, index) => {
        const blob = base64ToBlob(image);
        const file = new File([blob], `uploaded-image-${index}.jpg`, { type: 'image/jpeg' });
  
        const response = await client.assets.upload('image', file, {
          contentType: 'image/jpeg',
          filename: `uploaded-image-${index}.jpg`,
        });
        console.log(`Image ${index} uploaded with ID: ${response._id}`);
        return response._id;
      }));
      const incrementalId = await getNextIncrementalId();
      const currentPhotoFingerprint = await generateImageFingerprint(base64_result);
      
      const doc = {
        _type: 'person',
        incrementalId: incrementalId,
        title: `person_${incrementalId}`, // Add the title field with the incremental ID
        person_photo: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedImages[0],
          },
        },
        national_id: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedImages[1],
          },
        },
        first_name: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedImages[2],
          },
        },
        second_name: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedImages[3],
          },
        },
        photo_fingerprint: currentPhotoFingerprint,
      };
      // It's crucial to save the return of client.create instead of saving the raw document itself 
      // client.create adds some features that will be necessary later on
      const newDocument = await client.create(doc);   
      setPersons([...persons, newDocument])
      console.log('Document created successfully');
    } catch (error) {
      console.error('Error uploading images or creating document:', error);
    }
  };

  
  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };
  
  
  useEffect(() => {
    populatePageWithData()
  }, []);


  useEffect(() => {
    if (coords.length && originalImage) {
      cropAndSliceImage();
    }
  }, [coords, originalImage]);

  return (
    <div className="App">
      <Container>
        <AppBar className={classes.appBar} position="static" >
          <form onSubmit={handleSubmit} method="POST">
            <Box textAlign='center'>
              <input type="file" label="image" multiple accept="image/*" name="image" onChange={encodeImageFileAsURL} />
              <input type="submit" value={"send form"} />
            </Box>
          </form>
        </AppBar>
        <Card className={classes.card}>
          <CardMedia className={classes.media} component="div" image={data} name="image" title="image" />
        </Card>
        {showMessage && (
        <Typography variant="h6" align="center" color="error">
          This card has already been submitted.
        </Typography>
      )}
        <Grid container spacing={2}>
      {croppedImages.map((croppedImage, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Typography
          variant='h5`'
          >
            {features[index]}
          </Typography>
          <img
            src={croppedImage}
            alt={`Slice ${index + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2}>
          {persons.map((person, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                variant="contained"
                color={selectedDocument === person.title ? 'primary' : 'secondary'}
                onClick={() => handleDocumentClick(person.title)}
              >
                {person.title}
              </Button>
              {selectedDocument === person.title && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(person._id, person.incrementalId)}
                >
                  Delete
                </Button>
              )}
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default App;
