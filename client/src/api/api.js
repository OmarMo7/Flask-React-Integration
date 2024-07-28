import axios from 'axios'

const url = 'http://localhost:5000/image'

export const postImage = (newImage) => axios.post(url, { "image_name": newImage })
export const deleteOne = (id) => axios.delete(`${url}/${id}/delete`)
export const getInfo = () => axios.get(url)
// export const processApi = (image_name) => axios.get(`${url}?image_name=${image_name}`)