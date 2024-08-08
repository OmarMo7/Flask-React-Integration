import axios from 'axios'

const url = 'http://localhost:5000/'

export const postImage = (newImage) => axios.post(url, newImage)
export const deleteOne = (id) => axios.delete(`${url}/${id}/delete`)
export const getInfo = () => axios.get(url)