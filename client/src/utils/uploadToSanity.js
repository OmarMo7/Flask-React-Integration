// uploadImagesToSanity.js
import { client } from "../client";
import { generateImageFingerprint } from "./fingerprint";

export const uploadImagesToSanity = async (
  images,
  base64_result,
  persons,
  setPersons,
  setMessage
) => {
  try {
    const uploadedImages = await Promise.all(
      images.map(async (image, index) => {
        const blob = base64ToBlob(image);
        const file = new File([blob], `uploaded-image-${index}.jpg`, {
          type: "image/jpeg",
        });

        const response = await client.assets.upload("image", file, {
          contentType: "image/jpeg",
          filename: `uploaded-image-${index}.jpg`,
        });
        console.log(`Image ${index} uploaded with ID: ${response._id}`);
        return response._id;
      })
    );

    const incrementalId = await getNextIncrementalId(persons);
    const currentPhotoFingerprint = await generateImageFingerprint(
      base64_result
    );
    const doc = {
      _type: "person",
      value: incrementalId,
      title: `person_${incrementalId}`,
      person_photo: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: uploadedImages[0],
        },
      },
      national_id: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: uploadedImages[1],
        },
      },
      first_name: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: uploadedImages[2],
        },
      },
      second_name: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: uploadedImages[3],
        },
      },
      photo_fingerprint: currentPhotoFingerprint,
    };
    const newDocument = await client.create(doc);

    setPersons([...persons, newDocument]);
    console.log("Document created successfully");
  } catch (error) {
    console.error("Error uploading images or creating document:", error);
  }
};

const base64ToBlob = (base64) => {
  const byteString = atob(base64.split(",")[1]);
  const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

const getNextIncrementalId = async (persons) => {
  // Extract the values from the persons array and sort them
  const values = persons.map((person) => person.value).sort((a, b) => a - b);

  if (!persons.length) return 1;
  // Iterate from 1 to the maximum value in the array
  for (let i = 1; i <= values[values.length - 1]; i++) {
    if (!values.includes(i)) {
      return i;
    }
  }

  // If no missing value is found, return the next number after the maximum value
  return values[values.length - 1] + 1;
};
