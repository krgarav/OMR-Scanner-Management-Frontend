import axios from "axios";

export const REACT_APP_IP = "192.168.0.189";

export const onGetTemplateHandler = async () => {
  try {
    const response = await axios.get(
      `http://${REACT_APP_IP}:4000/get/templetes`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
