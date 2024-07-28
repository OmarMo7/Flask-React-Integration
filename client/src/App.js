import React, { useState, useEffect } from 'react';
import { AppBar, Box, Card, CardContent, CardMedia, Container, Typography, Grid, CircularProgress, Button } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'; 
import useStyles from './styles'
import { createImage, getPerson, deletePerson } from './actions';

function App() {
  const [data, setData] = useState('')
  const [persons, setPersons] = useState([])
  const [base64_result, setBase64_result] = useState('')
  const classes = useStyles()

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('You clicked submit.');
    createImage(base64_result).then(
      (img_name) => {
        console.log(img_name);
        setPersons([...persons, img_name])
      }
    )
  }

  const deleteP = async (id) => {
    await deletePerson(id)
    setPersons(persons.filter((person) => person.id !== id))
  }


  const encodeImageFileAsURL = (e) => {
    let base64String = "";

    setData(URL.createObjectURL(e.target.files[0]))

    var file = e.target.files[0];

    var reader = new FileReader();

    reader.onload = function () {
      base64String = reader.result.replace("data:", "")
        .replace(/^.+,/, "");
      setBase64_result(base64String)
    }
    reader.readAsDataURL(file);
  }


  useEffect(() => {
    getPerson().then(personInfo =>
      setPersons(personInfo)
    )
  }, [data])

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
        <Card>
          {!persons ? <CircularProgress /> : (
            <Grid className={classes.container} container alignItems="stretch" spacing={1}>
              {persons?.map((info) => (
                <Grid key={info.id} item xs={12} sm={12} md={4} lg={4}>
                  <CardContent>
                    <Typography className={classes.title} variant="h5" gutterBottom>{info.fname}</Typography>
                    <Typography className={classes.title} variant="h5" gutterBottom>{info.lname}</Typography>
                    <Typography className={classes.title} variant="h5" gutterBottom>{info.id_number}</Typography>
                    <Button size="small" color="secondary" onClick={() => deleteP(info.id)}>
                      <DeleteIcon fontSize="small" /> &nbsp; Delete
                    </Button>
                  </CardContent>
                </Grid>
              ))}
            </Grid>
          )}
        </Card>
      </Container>
    </div>
  );
}

export default App;
