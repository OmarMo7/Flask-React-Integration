import axios from 'axios'

const url = process.env.REACT_APP_API_URL

export const postImage = (newImage) => axios.post(url, newImage)
export const deleteOne = (id) => axios.delete(`${url}/${id}/delete`)
export const getInfo = () => axios.get(url)