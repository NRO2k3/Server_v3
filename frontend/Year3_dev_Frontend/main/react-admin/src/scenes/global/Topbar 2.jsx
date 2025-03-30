import { Box, IconButton, useTheme, Typography, Fade } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { Link } from "react-router-dom";
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import logo from '../../assets/logo_lab.png'
import {host} from "../App"
const Topbar = ({setIsSignin}) => {
  const theme = useTheme();
  const username = localStorage.getItem("username");
	const backend_host = host;
  return (
    <Box display="flex" justifyContent="space-between"
					paddingRight={2}
					paddingLeft={2}
					backgroundColor="black"
					>
		<Box display="flex">

				{/* IMGAGE */}
				<Box display="flex"
					justifyContent="center"
					alignItems="center"
					width={100} // Adjust the width of the inner Box component as needed
					height={50} // Adjust the height of the inner Box component as needed
					>
					<img
					alt="profile-user"
					//   width="200px"
					//   height="100px"
					style={{ maxWidth: '120%', maxHeight: '120%' }}
					src={logo}
					// style={{ cursor: "pointer", borderRadius: "50%" }}
					/>
				</Box>


				{/* LANDING LINK */}
				<Box display="flex"
					justifyContent="center"
					alignItems="center"
					paddingLeft="5%">
					<Link to="/landing">
						<IconButton>
							<HomeIcon style={{ fill: 'white' }}/>
							<Typography variant="h5" 
										color="white"
										display="inline"
										paddingLeft="5%">
								Home
							</Typography>
						</IconButton>	
					</Link>
				</Box>
                {/* Config */}
				<Box display="flex"
					justifyContent="center"
					alignItems="center"
					paddingLeft="5%"
                >
                {
                    localStorage.getItem("role").toString() === "2" 
                    && 
					<Link to="/configuration">
						<IconButton >
							<SettingsIcon style={{ fill: 'white' }}/>
							<Typography variant='h5'
										color="white" 
										display="inline"
										paddingLeft="5%">
								Configuration
							</Typography>
						</IconButton>	
					</Link>
                }
				</Box>
		</Box>

		{/* ICONS */}
		<Box display="flex">
				<Box display="flex" alignItems="center"> {/* Wrap the icon and text in a Box component */}
					<IconButton>
						<PersonOutlinedIcon style={{ fill: 'white' }}/>
					</IconButton>

					<Typography variant="h5" color="white" display="inline" mr="10px">
						Welcome {username},
					</Typography>

                    <Link color="white" display="inline" href="/"
                    >
                        <Typography variant="h5" color="white" display="inline">
						Sign out!
					    </Typography>
                    </Link>
				</Box>
		</Box>
	</Box>
  );
};

export default Topbar;
