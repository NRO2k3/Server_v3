import { useState, useEffect} from "react";
import { host } from "../../../App";
import { Typography, Grid } from "@mui/material";

function ImageResult({roomIdForNodeConfig}) {
  const [dataRoom, setData] = useState(null)
  const url = `http://${host}/api/result_coverage_algorithm?room_id=${roomIdForNodeConfig}`;
  const [imageDecode, setImageDecode] = useState(null);
  const [imageEncode, setImageEncode] = useState(null);
  const fetchAndEncodeImage = async (url_image, cmd) => {
    try {
        url_image= `http://${host}` + url_image
        console.log(url_image)
        const response = await fetch(url_image);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.onload = () => {
            const base64 = reader.result;
            localStorage.setItem(cmd, base64);
            if (cmd === "image_decode") setImageDecode(base64);
            if (cmd === "image_encode") setImageEncode(base64);
        };
    } catch (error) {
        console.error("Error:", error);
        }
    };


  const handleLoad = async() =>{
      const token = {access_token: null, refresh_token: null}
      if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null){
          token.access_token = localStorage.getItem("access");
          token.refresh_token = localStorage.getItem("refresh");
      } else {
          throw new Error("There is no access token and refresh token ....");
      }

      const headers = {
        "Content-Type" : "application",
        "Authorization": `Bearer ${token.access_token}`
      }

      const option_fetch={
        "method": "GET",
        "headers": headers,
        "body": null,
      }

      const response = await fetch(url, option_fetch)
      if(response.status === 200){
        const data = await response.json()
        setData(data)
        fetchAndEncodeImage(data.image_decode, "image_decode")
        fetchAndEncodeImage(data.image_encode, "image_encode")
      } else {
        alert("Please setting first !!!")
      }
  }

  useEffect(()=>{
    const timer = setInterval(() => {
        handleLoad();
    }, 10000);
    return () => clearInterval(timer);
    },[])
  return (
    <>
        {dataRoom === null ? <Typography variant = "h1">Loading .... </Typography>:
          <Grid container direction="column" alignItems="center" justifyContent="center" spacing={2}>
            <Typography variant = "h2" fontWeight= "bold">Decoded Image</Typography>
            <img src={imageDecode} alt="Decoded" style={{ maxWidth: "100%", height: "auto" }} />
            <Typography variant = "h2" fontWeight= "bold">Encoded Image</Typography>
            <img src={imageEncode} alt="Encoded" style={{ maxWidth: "100%", height: "auto" }} />
        </Grid>
        }
    </>
  )
}

export default ImageResult