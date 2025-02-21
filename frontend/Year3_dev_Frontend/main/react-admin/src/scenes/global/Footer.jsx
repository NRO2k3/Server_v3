import * as React from 'react';
import { createTheme, useTheme } from '@mui/material/styles';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { Language, Public, Share, Twitter } from '@mui/icons-material';

function Copyright(props) {
    return (
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href="https://hust.edu.vn/">
          IPAC
        </Link>
        {' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
}

const MapboxMap = () => {
  mapboxgl.accessToken = 'pk.eyJ1IjoicXVhbmdhbmgwMTEwIiwiYSI6ImNsdTVzcDd1YTFxZDUyamw4a3Eyd3kzeHgifQ.Cjd2-WvzHRTbBvLTQww1ew';
  const COORDINATE = [105.8431, 21.0054];
  const MARKER_INFO = '<h3>Hanoi University of Science and Technology</h3><h4>IPAC, C5-102, HUST</h4>';

  useEffect(() => { 
    const map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: COORDINATE, // Example coordinates
      zoom: 17,
    });

    const marker = new mapboxgl.Marker()
      .setLngLat(COORDINATE)
      .addTo(map);

    const popup = new mapboxgl.Popup({ 
      offset: 10 
    })
      .setHTML(MARKER_INFO);

    marker.setPopup(popup)

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Clean up
    return () => map.remove();
  }, []);

  return <div id="map-container" style={{ width: '200%', height: '250px', borderRadius: '10px' }} />;
};

const Footer = (props) => {
    const footers = [
        {
            title: "Phone",
            icon: (<CallIcon/>),
            description: "Phone: ................................................"
        },
        {
            title: "Email",
            icon: (<EmailIcon/>),
            description: "Email: ................................................",
        },
        {
            title: "Address",
            icon: (<LocationOnIcon/>),
            description: "Address: ..............................................",
        },
      ];
      
    //   TODO remove, this demo shouldn't need to reset the theme.
      const theme = useTheme();
      
    return (
        <Container
            maxWidth={2000}
            component="footer"
            sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                mt: 0, ml: 0, mr: 0,
                py: 10,
                backgroundColor: theme.palette.background.default
            }}
            style={{
                display: 'flex', flexDirection:'column', alignItems: 'center'
            }}
            color={theme.palette.background.default}
        >
            <Grid container item spacing={5} justifyContent="center" maxWidth='lg'>
                <Grid item xs={12} sm={12} md={4} justifyContent="center">
                    <Box 
                        display="flex"
                        justifyContent="center"
                        sx={{
                            px: 0,
                        }}
                    >
                        <Typography variant="h4" color="text.primary" gutterBottom>
                        Smart Farm
                        </Typography>
                    </Box>

                    {footers.map((footer) => (
                        <Box key= {footer.title} display="flex" gap="10px" marginY='10px' justifyContent='center'>
                            <Box>
                                {footer.icon}
                            </Box>
                            <Box>
                                <Typography variant="h5" color="text.primary" gutterBottom>
                                {footer.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                    <Box 
                        display="flex"
                        justifyContent="center"
                    >
                        <Typography variant="h4" color="text.primary" marginY={2} gutterBottom>
                        Follow us
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-evenly"
                    > 
                        <Link color="inherit" href="https://hust.edu.vn/">
                            <GoogleIcon/>
                        </Link>
                        <Link color="inherit" href="https://hust.edu.vn/">
                            <FacebookIcon/>
                        </Link>
                        <Link color="inherit" href="https://hust.edu.vn/">
                            <Language/>
                        </Link>
                        <Link color="inherit" href="https://hust.edu.vn/">
                            <Twitter/>
                        </Link>
                        <Link color="inherit" href="https://hust.edu.vn/">
                            <Public/>
                        </Link>
                        <Link color="inherit" href="https://hust.edu.vn/">
                            <Share/>
                        </Link>
                </Box>
                </Grid>

                <Grid item xs={12} sm={12} md={6} justifyContent="left">
                    <Box 
                        display="flex"
                        justifyContent="center"
                    >
                        <Typography variant="h4" color="text.primary" gutterBottom>
                            Location
                        </Typography>
                    </Box>
                    <Box 
                        display="flex" 
                        justifyContent="center"
                    >
                        <MapboxMap />
                    </Box>
                </Grid>
            </Grid>
            <Copyright sx={{ mt: 5 }} />
        </Container>
    );
}

export default Footer;