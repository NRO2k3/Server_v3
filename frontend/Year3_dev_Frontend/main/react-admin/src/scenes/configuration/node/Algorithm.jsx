import {Typography,Paper, InputLabel, TextField, Grid, Button, Box, Dialog, DialogContent, DialogContentText, DialogTitle} from "@mui/material"
import { useState } from "react";
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import CloseIcon from '@mui/icons-material/Close';
import { Border } from "victory";
export default function Algorithm() {
  const [open, setOpen] = useState(false)
  const [numberNode, setNumberNode] = useState('');
  const [communicationRadius, setCommunicationRadius] = useState('');
  const [sensingRadius, setSensingRadius] = useState('');
  const handleClick = () =>{
    if (!numberNode || !communicationRadius || !sensingRadius) {
      alert("Please fill in all fields.")
    }else{
      alert("OK")
    }
    
  }
  const handleClose = () => {
    setOpen(false);
};
  return (
    <Grid>
          <Paper sx={{mt:4, p:2}}>
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
