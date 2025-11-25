const BASE_URL = import.meta.env.PROD
  ? "https://yourusername.pythonanywhere.com"
  : "http://127.0.0.1:8000";
export default BASE_URL;
