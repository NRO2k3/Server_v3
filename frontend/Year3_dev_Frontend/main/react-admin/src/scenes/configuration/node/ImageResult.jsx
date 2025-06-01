import { useState, useEffect} from "react";
import { host } from "../../../App";
import { Typography, Grid, Button, Tooltip } from "@mui/material";

function ImageResult({roomIdForNodeConfig, dataRoom, setData, algorithm, communicationRadius, sensingRadius, numberNode}) {
  const url = `http://${host}/api/result_coverage_algorithm?room_id=${roomIdForNodeConfig}&&algorithm=${algorithm}`;
  const [imageDecode, setImageDecode] = useState(null);
  const [imageEncode, setImageEncode] = useState(null);
  const [state, setState] = useState(true);
  const fetchAndEncodeImage = async (url_image, cmd) => {
    try {
        url_image= `http://${host}` + url_image
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
    }, 60000);
    return () => clearInterval(timer);
    },[algorithm])
  return (
    <>
        {dataRoom === null ? <Typography variant = "h1" fontWeight="bold">Loading .... </Typography>:
          <Grid container direction="column" alignItems="center" justifyContent="center" spacing={2}>
            {state ?
            <Grid item container direction="column" alignItems="center" justifyContent="center" spacing={2}>
              <Tooltip style={{
                    fontSize: "14px",
                    backgroundColor: "white",
                    border: '1px solid #eeeeee',
                    maxWidth: 400,
                    whiteSpace: 'normal'
                }}
                placement="left"
                title={
                    <Grid>
                        <Typography color="inherit">{`Algorithm: ${algorithm}`}</Typography>
                        <Typography color="inherit">{`Number Node: ${numberNode}`}</Typography>
                        <Typography color="inherit">{`Sensing Radius: ${sensingRadius}`}</Typography>
                        <Typography color="inherit">{`Communication Radius: ${communicationRadius}`}</Typography>
                        <Typography color="inherit">{`Detail: The image shows the positions of sensor nodes in the network, along with the coverage area of each node and their connectivity with neighboring nodes, aiming to achieve optimal coverage within the room.`}</Typography>
                    </Grid>
                }
                >
                <img src={imageDecode} alt="Loading ..." style={{ maxWidth: "100%", height: "auto",  marginTop: "40px" }} />
              </Tooltip>
            </Grid>:
            <Grid item container direction="column" alignItems="center" justifyContent="center" spacing={2}>
              <Tooltip style={{
                    fontSize: "14px",
                    backgroundColor: "white",
                    border: '1px solid #eeeeee',
                    maxWidth: 600,
                    whiteSpace: 'normal'
                }}
                placement="right"
                title={
                    <Grid>
                        <Typography color="inherit">{`Algorithm: ${algorithm}`}</Typography>
                        <Typography color="inherit">{`Number Node: ${numberNode}`}</Typography>
                        <Typography color="inherit">{`Sensing Radius: ${sensingRadius}`}</Typography>
                        <Typography color="inherit">{`Communication Radius: ${communicationRadius}`}</Typography>
                        <Typography color="inherit">{`Detail: The image shows the positions of sensor nodes in the network along with the coverage area of each node, their connectivity with neighboring nodes, and how the algorithm selects placement to avoid obstacles, in order to achieve optimal coverage within the room.`}</Typography>
                    </Grid>
                }
                >
                <img src={imageEncode} alt="Loading ..." style={{ maxWidth: "100%", height: "auto",  marginTop: "40px" }} />
              </Tooltip>
            </Grid>
            }
            <Button sx={{
                          backgroundColor: "black",
                          color: "white",
                          fontSize: "20px",
                          fontWeight: "bold",
                          padding: "5px 12px",
                          margin: "5px",
                          "&:hover": { backgroundColor: "#6d65ea" }
                          }}
                      variant="contained"
                      onClick = {()=> setState(!state)}
            >Change Image</Button>
        </Grid>
        }
    </>
  )
}

export default ImageResult