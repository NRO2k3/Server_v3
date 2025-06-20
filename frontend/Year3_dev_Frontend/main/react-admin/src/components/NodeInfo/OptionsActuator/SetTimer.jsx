import { useState } from "react";
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import { Box, Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography, TextField} from "@mui/material";
import dayjs from "dayjs";
import { host } from "../../../App";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";

function SetTimer({room_id, callbackSetSignIn, idNode, status, selectFunction}) {
  const [valueStartTime, setValueStartTime] = useState(dayjs());
  const [valueEndTime, setValueEndTime] = useState(dayjs().add(1, "minute"));
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(16);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const options = Array.from({ length: 15 }, (_, i) => i + 16);

  const handleStartTimeChange = (newValue) => {
    if (newValue) {
      setValueStartTime(newValue);
      if (newValue.add(1, "minute").isAfter(valueEndTime)) {
        setValueEndTime(newValue.add(1, "minute"));
      }
    }
  };

  const handleAccept = async() => {
    setOpen(false)
    const access_token =localStorage.getItem("access");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    }
    const fetch_option = {
        "method": "POST",
        "headers": headers,
        "body": JSON.stringify({
          "room_id": room_id,
          "node_id": idNode,
          "function": selectFunction,
          "mode": "timer",
          "setpoint":value,
          "status": status ? 1 : 0,
          "start_time": valueStartTime.valueOf()/1000,
          "end_time": valueEndTime.valueOf()/1000
        }),
    }
    await fetch(`http://${host}/api/set_actuator`, fetch_option);
  }

  return (
    <Grid container sx={{ mt: 2,}} alignItems="center" justifyContent="center" spacing={0.2}>
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
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} gap={2}>
          <Typography id="select-label" fontWeight={"bold"}>Temperature</Typography>
          <FormControl size="small" sx={{ minWidth: 55 }}>
            <Select
              labelId="select-label"
              value={value}
              onChange={handleChange}
              sx={{
                mt: 1,
                borderRadius: 2,
                height: "40px",
              }}
            >
              {options.map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" sx={{
              mt: 1,
              borderRadius: 2,
              width: "10px",
              height: "40px",
            }}
            onClick = {() => setOpen(true)}
            >
              Send
          </Button>
        </Box>
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

