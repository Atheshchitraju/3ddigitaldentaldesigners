import axios from "axios";

const API = "http://localhost:5000/api/device";

export const getDevices = async () => {
  const res = await axios.get(API);
  return res.data;
};
