import axios from "axios"

const axiosInstance = axios.create({
    baseURL:"http://localhost:6369/api",
    withCredentials: true,
})

export default axiosInstance