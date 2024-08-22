import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Card,
  CardMedia,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import useStyles from "./styles";
import { client } from "./client";
import {
  handleDeleteClick,
  handleSubmit,
  handleDocumentClick,
} from "./utils/handlers";
import { cropAndSliceImage } from "./utils/cropAndSlice";
import { uploadImagesToSanity } from "./utils/uploadToSanity";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

function App() {
  const [data, setData] = useState("");
  const [persons, setPersons] = useState([]);
  const [coords, setCoords] = useState([]);
  const [features, setFeatures] = useState([]);
  const [submitPress, setSubmitPress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState([]);
  const [base64_result, setBase64_result] = useState("");
  const [croppedImages, setCroppedImages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const classes = useStyles();

  const encodeImageFileAsURL = (e) => {
    try {
      let base64String = "";

      setData(URL.createObjectURL(e.target.files[0]));

      var file = e.target.files[0];
      setOriginalImage(file);
      var reader = new FileReader();

      reader.onload = function () {
        base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
        setBase64_result(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error encoding image file:", error);
      setMessage("Error encoding image file");
    }
  };

  useEffect(() => {
    const populatePageWithData = async () => {
      try {
        const queryAllPersons = '*[_type == "person"]';
        const persons = await client.fetch(queryAllPersons);
        setPersons(persons);
      } catch (error) {
        console.error("Error fetching data from Sanity:", error);
        setMessage("Error fetching data from Sanity");
      }
    };

    populatePageWithData();
  }, []);

  useEffect(() => {
    if (coords.length) {
      try {
        cropAndSliceImage(coords, originalImage, setCroppedImages, (images) =>
          uploadImagesToSanity(
            images,
            base64_result,
            persons,
            setPersons,
            setMessage
          )
        );
        setCoords([]);
        setOriginalImage(null);
      } catch (error) {
        console.error("Error processing images:", error);
        setMessage("Error processing images");
      }
    }
  }, [submitPress]);

  return (
    <div className="App">
      <Container>
        <AppBar className={classes.appBar} position="static">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(
                e,
                base64_result,
                persons,
                setMessage,
                setCoords,
                setFeatures,
                setSubmitPress,
                setIsLoading
              );
            }}
            method="POST"
          >
            <Box textAlign="center">
              <input
                type="file"
                label="image"
                multiple
                accept="image/*"
                name="image"
                onChange={encodeImageFileAsURL}
              />
              <input type="submit" value="send form" disabled={isLoading} />
              {isLoading && <CircularProgress />}
            </Box>
          </form>
        </AppBar>
        <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            component="div"
            image={data}
            name="image"
            title="image"
          />
        </Card>
        {message && (
          <Typography variant="h6" align="center" color="error">
            {message}
          </Typography>
        )}
        <Grid container spacing={2}>
          {!selectedDocument &&
            croppedImages.map((croppedImage, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Typography variant="h5">{features[index]}</Typography>
                <img
                  src={croppedImage}
                  alt={`Slice ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </Grid>
            ))}
        </Grid>
        <Grid container spacing={2}>
          {persons?.map((person, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                variant="contained"
                color={
                  selectedDocument === person.title ? "primary" : "secondary"
                }
                onClick={() =>
                  handleDocumentClick(
                    person,
                    index,
                    selectedDocument,
                    setSelectedDocument
                  )
                }
              >
                {person.title}
              </Button>
              {selectedDocument === person.title && (
                <>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    onClick={() =>
                      handleDeleteClick(
                        person._id,
                        person.value,
                        persons,
                        setPersons,
                        setSelectedDocument
                      )
                    }
                  >
                    Delete
                  </Button>
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Typography variant="h5">Person Photo</Typography>
                    <img
                      src={urlFor(person.person_photo).url()}
                      alt={`Slice ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Typography variant="h5">National ID</Typography>
                    <img
                      src={urlFor(person.national_id).url()}
                      alt={`Slice ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Typography variant="h5">First Name</Typography>
                    <img
                      src={urlFor(person.first_name).url()}
                      alt={`Slice ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Typography variant="h5">Second Name</Typography>
                    <img
                      src={urlFor(person.second_name).url()}
                      alt={`Slice ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default App;
