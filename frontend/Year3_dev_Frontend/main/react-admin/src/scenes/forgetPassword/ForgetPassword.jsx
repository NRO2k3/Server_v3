import { Grid, Button, TextField} from "@mui/material"
import { useState } from "react"
import { host } from "../../App"
function ForgetPassword({setForgetPassword}) {
  const [email, setEmail] = useState("")
  const handleSend = async () => {
    let response;
    try {
      response = await fetch(`http://${host}/api/reset_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "email": email }),
      });
  
      if (response.status === 200) {
        alert("Please check your email!");
      } else {
        alert("Email is not registered!");
      }
    } catch (err) {
      console.log("Error happened while sending data. Error: " + err);
    }
  };
  
  return (
    <Grid container display="flex" flexDirection ="column" spacing = {2}>
      <Grid item>
        <Button
        sx={{
          mt: 2,
          border : "2px solid black",
          color: "black",
          cursor: "pointer",
        }}
        onClick={()=>{setForgetPassword(false)}}>Back</Button>
      </Grid>
      <Grid item>
        <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            required
            sx={{
              width : "400px"
            }}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
          sx={{
            height:"55px",
            ml: 2,
            border : "1px solid black",
            color: "black",
            cursor: "pointer",
          }}
          onClick={handleSend}
          >SEND</Button>
      </Grid>
    </Grid>
  )
}

export default ForgetPassword