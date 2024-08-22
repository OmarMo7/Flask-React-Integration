export const cropAndSliceImage = (
  coords,
  originalImage,
  setCroppedImages,
  uploadImagesToSanity
) => {
  const croppedImagesArray = coords.map((coord) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.src = URL.createObjectURL(originalImage);

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width =
          Math.round(coord[2] * img.width) - Math.round(coord[0] * img.width);
        canvas.height =
          Math.round(coord[3] * img.height) - Math.round(coord[1] * img.height);
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

        const base64Image = canvas.toDataURL("image/jpeg");
        resolve(base64Image);
      };
    });
  });

  Promise.all(croppedImagesArray).then((images) => {
    setCroppedImages(images);
    uploadImagesToSanity(images);
  });
};
