import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { useContext } from 'react';
import { host, UserContext } from '../../App';
import { localStorageAvailable } from '@mui/x-data-grid/utils/utils';
import { useEffect, useState } from 'react';

function Copyright(props) {
	return (
		<Typography variant="body2" color="text.secondary" align="center" {...props}>
		{'Copyright © '}
		<Link color="inherit" href="https://mui.com/">
			HUST
		</Link>{' '}
		{new Date().getFullYear()}
		{'.'}
		</Typography>
	);
}

export default function SignIn({setSignUp, setIsSignin})
{
    // const backend_host = "27.71.227.1:800";
    const [isLoading, setIsLoading] = useState(true);
    const backend_host = host;
    const checkIfAlreadySignIn = async () =>
    {
        if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null)
        {
            const token = {"access_token": localStorage.getItem("access"), "refresh_token": localStorage.getItem("refresh")};

            const verifyAccessToken  = async () =>
            {
                //call the API to verify access-token
                const verify_access_token_API_endpoint = `http://${backend_host}/api/token/verify`;
                const verify_access_token_API_data =
                {
                    "token": token.access_token,
                }
                const verify_access_token_API_option = 
                {
                    "method": "POST",
                    "headers":
                    {
                        "Content-Type": "application/json",
                    },
                    "body": JSON.stringify(verify_access_token_API_data),

                }
                const verify_access_token_API_response = await fetch(verify_access_token_API_endpoint, 
                                                                    verify_access_token_API_option,);
                if(verify_access_token_API_response.status !== 200)
                {
                    return false;
                }
                return true;
            }

            /*
            *brief: this function is to verify the refresh-token and refresh the access-token if the refresh-token is still valid
            */
            const verifyRefreshToken  = async () =>
            {
                //call the API to verify access-token
                const verify_refresh_token_API_endpoint = `http://${backend_host}/api/token/refresh`
                const verify_refresh_token_API_data = 
                {
                    "refresh": token.refresh_token,
                }
                const verify_refresh_token_API_option = 
                {
                    "method": "POST",
                    "headers": 
                    {
                        "Content-Type": "application/json",
                    },
                    "body": JSON.stringify(verify_refresh_token_API_data),

                }
                const verify_refresh_token_API_response = await fetch(verify_refresh_token_API_endpoint, 
                                                                        verify_refresh_token_API_option,);
                const verify_refresh_token_API_response_data = await verify_refresh_token_API_response.json();
                if(verify_refresh_token_API_response.status !== 200)
                {
                    return false;
                }
                else if(verify_refresh_token_API_response.status === 200 &&  verify_refresh_token_API_response_data.hasOwnProperty("access"))
                {
                    localStorage.setItem("access", verify_refresh_token_API_response_data["access"]);
                    localStorage.setItem("refresh", verify_refresh_token_API_response_data["refresh"]);
                    return true
                }
                else
                {
                    throw new Error("Can not get new access token ....");
                }
            }

            if(await verifyAccessToken())
            {
                setIsSignin(true);
            }
            else
            {
                if(await verifyRefreshToken())
                {
                    setIsSignin(true);
                }
                else
                {
                    setIsLoading(false);
                }
            }

        }
        else
        {
            setIsLoading(false);
        }
    }

	const callbackSetIsSignIn = useContext(UserContext);
	/*
	*brief: function to get token-authentication from user 
	*return: boolean, true if the access-token is still valid, false otherwise
	*/
    const getAuthentication  = async (username, password) =>
    {
        //call the API to get user authentication
        const get_authentication_API_endpoint = `http://${backend_host}/api/token`;
        const get_authentication_API_data = 
        {
            "username": username, 
            "password": password,
        };
        const get_authentication_API_option = 
        {
            "method": "POST",
            "headers": 
            {
            "Content-Type": "application/json",
            },
            "body": JSON.stringify(get_authentication_API_data), 
        }
        const get_authentication_API_response = await fetch(get_authentication_API_endpoint, get_authentication_API_option);
        const get_authentication_API_response_data = await get_authentication_API_response.json();
        if(get_authentication_API_response.status !== 200)
        {
        return false;
        }
        else if(get_authentication_API_response.status === 200 && 
            get_authentication_API_response_data.hasOwnProperty("access") &&
            get_authentication_API_response_data.hasOwnProperty("refresh") &&
            get_authentication_API_response_data.hasOwnProperty("role"))
        {
        localStorage.setItem("access", get_authentication_API_response_data["access"]);
        localStorage.setItem("refresh", get_authentication_API_response_data["refresh"]);
        localStorage.setItem("role", get_authentication_API_response_data["role"]);
        }
        else
        {
        throw new Error("Cannot get access and refresh token or user is not authenticated ...");
        }
        return true;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        localStorage.setItem("username", data.get('username'))
        let isAuthenticated = null;
        try
        {
            isAuthenticated = await getAuthentication(data.get("username"), data.get("password"));
        }
        catch(err)
        {
            alert("Server is not available or username, password is wrong. Error " + err);
            callbackSetIsSignIn(false);
        }
        if(isAuthenticated === true)
        {
            callbackSetIsSignIn(true);
        }
        else
        {
            alert("Cannot verify username or password!");
        }
    };

    useEffect(()=>{
        checkIfAlreadySignIn();
    }, []);
    console.log(isLoading)
    return (
        <>
        {
        !isLoading
        &&
        <Container component="main" maxWidth="xs">
            <CssBaseline />

            <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
                Sign in
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                />

                <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                />

                {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
                /> */}

                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Sign In
                </Button>

                <Grid container>
                <Grid item xs>
                    <Link href="#" variant="body2">
                    {/* Forgot password? */}
                    </Link>
                </Grid>

                <Grid item>
                    <Link href="#" variant="body2" onClick={()=>{setSignUp(true)}}>
                    {"Don't have an account? Sign Up"}
                    </Link>
                </Grid>
                </Grid>
            </Box>
            </Box>

            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    }
    </>
    );
}