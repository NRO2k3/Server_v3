import { useState } from "react";
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import { Box, Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography, TextField} from "@mui/material";
import dayjs from "dayjs";

function SetTimer() {
  const [valueStartTime, setValueStartTime] = useState(dayjs());
  const [valueEndTime, setValueEndTime] = useState(dayjs().add(1, "minute"));
  const [open, setOpen] = useState(false)

  const handleStartTimeChange = (newValue) => {
    if (newValue) {
      setValueStartTime(newValue);
      if (newValue.add(1, "minute").isAfter(valueEndTime)) {
        setValueEndTime(newValue.add(1, "minute"));
      }
    }
  };

  const handleAccept = () => {
    setOpen(false)
    console.log(valueStartTime.valueOf(),valueEndTime.valueOf())
    alert("Timer accepted!");
  }

  return (
    <Grid container sx={{ mt: 2 }} alignItems="center" justifyContent="center" spacing={0.1}>
      <Grid item xs={6}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>Start Time</Typography>
        <MobileDateTimePicker
          slotProps={{
            dialog: {
              sx: {
                '& .MuiDialog-paper': {
                  position: 'absolute',
                  right: 2,
                  left: 'auto',
                }
              }
            }
          }}
          value={valueStartTime}
          onChange={handleStartTimeChange}
          minDateTime={dayjs()}
          disableFuture={false}
          renderInput={(params) => <TextField {...params}/>}
        />
      </Grid>
      <Grid item xs={6}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>End Time </Typography>
        <MobileDateTimePicker
          slotProps={{
            dialog: {
              sx: {
                '& .MuiDialog-paper': {
                  position: 'absolute',
                  right: 2,
                  left: 'auto',
                }
              }
            }
          }}
          value={valueEndTime}
          onChange={(newValue) => setValueEndTime(newValue)}
          minDateTime={valueStartTime.add(1, "minute")}
          disableFuture={false}
          renderInput={(params) => <TextField {...params}/>}
        />
      </Grid>
      <>
        <Button variant="contained" color="primary" sx={{
            mt: 2,
            borderRadius: 2,
            width: "10px",
            height: "40px",
          }}
          onClick = {() => setOpen(true)}
          >
            Send
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth='xs'
          fullWidth
          PaperProps={{
            sx: {
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              width: "300px",
              borderRadius: "10px"
            }
          }}
        >
          <DialogTitle id="alert-dialog-title" variant="h4" fontWeight='bold'>
          {"Confirm set timer"}
          </DialogTitle>
          <DialogContent>
              <DialogContentText id="alert-dialog-description" variant="h5">
                  Are you sure to set timer?
              </DialogContentText>
          </DialogContent>
          <DialogActions>
              <Button style={{fontSize: '14px'}} onClick={() => setOpen(false)}>Disagree</Button>
              <Button style={{fontSize: '14px'}} onClick={handleAccept} autoFocus>Agree</Button>
          </DialogActions>
        </Dialog>
      </>

    </Grid>
  );
}

export default SetTimer;

