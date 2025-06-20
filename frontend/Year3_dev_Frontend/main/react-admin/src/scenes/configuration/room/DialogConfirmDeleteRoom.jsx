import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import { host } from '../../../App';
import verifyAccessToken from '../../../function/verifyAccessToken';
import verifyRefreshToken
 from '../../../function/verifyRefreshToken';
export default function DialogConfirmDelete({callbackSetSignIn, RoomConfigLoading, id}) 
{
    const api = `http://${host}/api/configuration_room/${id}`;

    const deleteNode = async (url, access_token, id, NodeConfigLoading) => 
    {
        const headers = 
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
        }
        const option_fetch = 
        {
            "method": "DELETE",
            "headers": headers,
            "body": JSON.stringify({'id': id}),
        }
        const response = await fetch(url, option_fetch);
        if(response.status === 204)
        {
            alert("Delete Successfully");
            NodeConfigLoading[1](!NodeConfigLoading[0]);
        }
        else
        {
            alert("Delete Unsuccessfully")
            RoomConfigLoading[1](!RoomConfigLoading[0]);
        }
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url, id, RoomConfigLoading) => 
    {

        const token = {access_token: null, refresh_token: null}
        // const backend_host = host;
        if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null)
        {
            token.access_token = localStorage.getItem("access"); 
            token.refresh_token = localStorage.getItem("refresh");
        }
        else
        {
            throw new Error("There is no access token and refresh token ....");
        }

        const  verifyAccessToken_response = await verifyAccessToken(backend_host, token);

        if(verifyAccessToken_response === true)
        {
            // const response = await fetch(url)
            // const data = await response.json()
            fetch_data_function(url, token["access_token"], id, RoomConfigLoading)
        }
        else
        {
            let verifyRefreshToken_response = null;
            try
            {
                verifyRefreshToken_response = await verifyRefreshToken(backend_host, token);
            }
            catch(err)
            {
                console.log(err);
            }
            if(verifyRefreshToken_response === true)
            {
                fetch_data_function(url, token["access_token"], id, RoomConfigLoading);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }

    }

    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        verify_and_get_data(deleteNode, callbackSetSignIn, host, api, id, RoomConfigLoading);
        setOpen(false);
    }

    return (
        <div>
        <Button
                startIcon={<DeleteIcon />}
                sx={{
                    backgroundColor: "#d32f2f",
                    fontSize: "10px",
                    fontWeight: "bold",
                    padding: "5px 12px",
                    }}
                variant="contained"

                onClick={()=>{
                    setOpen(true);
                }}
            >
                Delete
            </Button>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
            {"Confirm deleting this node record ?"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Caution: All node data and sensor data belong to this room will be deleted as well !!!
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleConfirm} autoFocus>
                Confirm
            </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
}
