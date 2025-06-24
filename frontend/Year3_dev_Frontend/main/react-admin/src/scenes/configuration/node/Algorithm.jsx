import {Typography,Paper, InputLabel, TextField, Grid, Button, Box, Dialog, DialogContent, DialogContentText, DialogTitle, Select, MenuItem} from "@mui/material"
import { useState } from "react";
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import CloseIcon from '@mui/icons-material/Close';
import { Border } from "victory";
import { host } from "../../../App";
import ImageResult from "./ImageResult";

const nameAlgorithm = ["FOA", "NOA"]

export default function Algorithm({roomIdForNodeConfig}) {
  const [algorithm, setAlgorithm] = useState("FOA")
  const [dataRoom, setData] = useState(null)
  const [open, setOpen] = useState(false)
  const [numberNode, setNumberNode] = useState('');
  const [communicationRadius, setCommunicationRadius] = useState('');
  const [sensingRadius, setSensingRadius] = useState('');
  const url = `http://${host}/api/coverage_algorithm`
  const handleClick = async() =>{
    if (numberNode && communicationRadius && sensingRadius) {
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

      const body = JSON.stringify({
          "room_id" : roomIdForNodeConfig,
          "number_node": numberNode,
          "Rc":communicationRadius,
          "Rs":sensingRadius,
          "algorithm": algorithm,
      })

      const option_fetch={
        "method": "POST",
        "headers": headers,
        "body": body,
      }

      const response = await fetch(url, option_fetch)
      if(response.status === 200){
        alert("Send Successfully please wait")
        setOpen(false)
        setData(null)
      } else {
        alert("Try again")
      }
    }else{
      alert("Please fill full parameter")
    }
    
  }
  const handleClose = () => {
    setOpen(false);
};
  return (
    <Grid>
          <Paper sx={{mt:4, p:2, width: "100%", maxWidth: "600px",height:"650px", border: "1px solid black", borderRadius: '15px', }}>
      <Typography variant="h2" align="center" fontWeight="bold">
        Coverage Optimization Algorithm
      </Typography>
      <Button
            startIcon={<PermDataSettingIcon />}
            sx={{
                backgroundColor: "black",
                fontSize: "10px",
                fontWeight: "bold",
                padding: "5px 12px",
                mt: 2,
                }}
            variant="contained"

            onClick={() => setOpen(true)}
            >
                Setting
      </Button>
      <ImageResult roomIdForNodeConfig={roomIdForNodeConfig} dataRoom={dataRoom} setData={setData} algorithm={algorithm}
      communicationRadius={communicationRadius} sensingRadius={sensingRadius} numberNode={numberNode}/>
    </Paper>
    <Dialog
          open = {open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            "& .MuiDialog-container": {
                alignItems: "center",
                justifyContent: "flex-start",
            },
        }}
          >
            <DialogTitle id="alert-dialog-title">
              <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
              >
                  <Typography variant="h3" align="center" fontWeight="bold">Setting Parameter Node</Typography>
                  <Button onClick={handleClose}><CloseIcon/></Button>
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{mt:2}}>
                    <TextField
                      fullWidth
                      label="Number of Nodes"
                      variant="outlined"
                      value={numberNode}
                      onChange={(e) => setNumberNode(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Communication Radius"
                      variant="outlined"
                      value={communicationRadius}
                      onChange={(e) => setCommunicationRadius(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Sensing Radius"
                      variant="outlined"
                      value={sensingRadius}
                      onChange={(e) => setSensingRadius(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Select
                      value={algorithm}
                      onChange={(e)=> setAlgorithm(e.target.value)}
                      sx={{ width: 80, height: 30, fontWeight: "bold" }}
                    >
                      {
                        nameAlgorithm.map((name)=>
                          <MenuItem value={name}>{name}</MenuItem>
                        )
                      }
                    </Select>
                  </Grid>
                </Grid>
              </DialogContentText>
            </DialogContent>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                onClick={handleClick}
                sx={{
                  height: "30px",
                  width: "100px",
                  mb: 2,
                  backgroundColor: "black",
                  color:"white",
                  "&:hover":{
                    backgroundColor: "grey",
                  }
                }}
              >
                SUBMIT
              </Button>
            </Box>
      </Dialog>
    </Grid>
  )
}
