// handlers.js
import { deletePerson, sendImageToAPI } from "../actions";
import { client } from "../client";
import { generateImageFingerprint } from "./fingerprint";

export const handleDeleteClick = async (
  id,
  incrementalId,
  persons,
  setPersons,
  setSelectedDocument
) => {
  console.log(incrementalId);
  await deleteDocument(id);
  setPersons(persons.filter((person) => person.value !== incrementalId));
  await deletePerson(incrementalId);
  setSelectedDocument(null); // Reset the selected document after deletion
};

const deleteDocument = async (id) => {
  try {
    const response = await client.delete(id);
    console.log("Document deleted:", response);
    return response;
  } catch (error) {
    console.error("Delete failed:", error.message);
    throw error;
  }
};

export const handleSubmit = async (
  e,
  base64_result,
  persons,
  setMessage,
  setCoords,
  setFeatures,
  setSubmitPress,
  setIsLoading
) => {
  e.preventDefault();
  setIsLoading(true);
  console.log("You clicked submit.");

  try {
    const currentPhotoFingerprint = await generateImageFingerprint(
      base64_result
    );
    console.log(currentPhotoFingerprint);
    const fingerPrintExists = persons.some(
      (person) =>
        String(person.photo_fingerprint) === String(currentPhotoFingerprint)
    );
    console.log(persons);
    if (fingerPrintExists) {
      setMessage("This card has already been submitted.");
    } else {
      setMessage("");
      const outputImages = await sendImageToAPI(base64_result);
      setCoords(outputImages.coords[0]);
      setFeatures(outputImages.features);
      setSubmitPress((prevState) => !prevState);
    }
  } catch (error) {
    console.log("Failed to generate image fingerprint with the error: ", error);
  } finally {
    setIsLoading(false);
  }
};
export const handleDocumentClick = (
  person,
  index,
  selectedDocument,
  setSelectedDocument
) => {
  if (selectedDocument === person.title) {
    setSelectedDocument(null); // Deselect if the same document is clicked
  } else {
    setSelectedDocument(person.title); // Select the clicked document
  }
};
