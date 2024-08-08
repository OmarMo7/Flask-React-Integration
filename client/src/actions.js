import { postImage, getInfo, deleteOne } from './api/api';


export const sendImageToAPI = async (image) => {
  try {
    console.log(typeof(image))
    const {data} = await postImage(image)
    return data
  } catch (error) {
    console.log(error)
  }
}  
export const getPerson = async (image_name) => {
  try {
    const { data } = await getInfo(image_name)
    return data
  } catch (error) {
    console.log(error)
  }
}  
export const deletePerson = async (id) => {
  try {
    await deleteOne(id)
  } catch (error) {
    console.log(error)
  }
}  