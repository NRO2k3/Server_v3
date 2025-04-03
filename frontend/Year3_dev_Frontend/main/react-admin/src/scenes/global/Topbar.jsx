import { Box, IconButton, useTheme, Typography, Menu, MenuItem, Button } from "@mui/material";
import { useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Link } from "react-router-dom";
import ContrastIcon from '@mui/icons-material/Contrast';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import logo from '../../assets/logo_lab.png'
import { useMode } from "../../theme";
import { host } from "../../App";
import { useTranslation } from "react-i18next";
import  "../../utils/i18n";
const Topbar = ({setIsSignin}) => {
  const username = localStorage.getItem("username");
  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const theme = useTheme();
  const [, colorMode] = useMode();
	const backend_host = host;
	const {t, i18n} = useTranslation()
	const changeLanguage = (lng) => {
		i18n.changeLanguage(lng);
	};
  const toggleMode = () => {
	colorMode.toggleColorMode();
  }

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
						<IconButton
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							<HomeIcon style={{ fill: 'white' }}/>
							<Typography variant="h5" 
										color="white"
										display="inline"
										paddingLeft="5%"
										style={{fontWeight: isHovered ? 'bold' : 'normal' ,  transition: 'font-weight 0.15s', whiteSpace: "nowrap", }}>
								{t("home")}
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
						<IconButton 
							onMouseEnter={() => setIsHovered2(true)}
							onMouseLeave={() => setIsHovered2(false)}
						>
							<SettingsIcon style={{ fill: 'white' }}/>
							<Typography variant='h5'
										color="white" 
										display="inline"
										paddingLeft="5%"
										style={{ fontWeight: isHovered2 ? 'bold' : 'normal' ,  transition: 'font-weight 0.15s', whiteSpace: "nowrap",}}>
								{t("configuration")}
							</Typography>
						</IconButton>	
					</Link>
                }
				</Box>
		</Box>
		<Box display="flex" ml="auto">
			<Button onClick={() => changeLanguage("en")}  sx={{ width: "30px"}}>
        <img src="/english.png" alt="English" style={{ width: 30, height: 20 }} />
      </Button>
      <Button onClick={() => changeLanguage("vi")} sx={{ width: "30px"}}>
        <img src="/vietnam.png" alt="Vietnamese" style={{ width: 30, height: 20 }} />
      </Button>
		</Box>
		{/* ICONS */}
		<Box display="flex">
				<Box display="flex" alignItems="center"> {/* Wrap the icon and text in a Box component */}
					<IconButton
						aria-control='profile-menu'
						onClick={e => setOpenMenu(e.currentTarget)}
					>
						<PersonOutlinedIcon style={{ fill: 'white' }}/>
					</IconButton>
					<Menu
						id='profile-menu'
						open={Boolean(openMenu)}
						anchorEl={openMenu}
						onClose={() => setOpenMenu(null)}
						disableAutoFocusItem
						slotProps={{
							paper: {
								style: {
									minWidth: '200px'
								}
							}
						}}
					>
						<div>
							<Typography variant="h4" py={1} pl={2}>
								{t("welcome", {username})}
							</Typography>
						</div>
						<MenuItem>
							<AccountCircleOutlinedIcon />
							<Typography component='span' pl={2}>
							{t("profile")}
							</Typography>
						</MenuItem>
						<MenuItem>
							<SettingsIcon /> 
							<Typography component='span' pl={2}>
							{t("settings")}
							</Typography>
						</MenuItem>
						<MenuItem
							onClick={toggleMode}
						>
							<ContrastIcon /> 
							<Typography component='span' pl={2}>
							{t("theme")}
							</Typography>
						</MenuItem>
						<div style={{
							marginLeft: 15,
							marginTop: 5,
							marginBottom: 5,
						}}>
							<Button
								size="small"
								variant='outlined'
								style={{
									fontWeight: 'bold',
									color: theme.palette.background.default,
									backgroundColor: theme.palette.text.primary,
								}}
								onClick={ async ()=>{
									const token = {access_token: null, refresh_token: null}
									if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null)
									{
											token.access_token = localStorage.getItem("access");
											token.refresh_token = localStorage.getItem("refresh");
									}
									else
									{
											throw new Error("There is no access token and refresh token ....");
									}
									const headers = {
										'Content-Type':'application/json',};
									const verify_logout = {
											'method':'POST',
											"headers": headers,
											"body": JSON.stringify({ "refresh": token.refresh_token }),
									};
									const verify_logout_response = await fetch(`http://${backend_host}/api/token/blacklist`, 
										verify_logout,);
										if(verify_logout_response.status === 200){
											alert("Successfully Logout");
											localStorage.clear();
											setIsSignin(false);
										}else{
											alert("Try again!!!")
										}
								}}
							>
								<Typography variant="h5" p={0.3}>
									{t("sign out")}
								</Typography>
							</Button>
							{/* <Link color="white" display="inline" href="/"
									onClick={()=>{
									localStorage.clear();
									setIsSignin(false);
									}}
							>
								<Typography variant="h4" weight='medium' p={1} color={theme.palette.text.primary}>
								Sign out!
								</Typography>
							</Link> */}
						</div>
					</Menu>

					{/* <Typography variant="h5" color="white" display="inline" mr="10px">
						Welcome {username},
					</Typography>

                    <Link color="white" display="inline" href="/"
                         onClick={()=>{
                            localStorage.clear();
                            setIsSignin(false);
                         }}
                    >
                        <Typography variant="h5" color="white" display="inline">
						Sign out!
					    </Typography>
                    </Link> */}
				</Box>
		</Box>
		</Box>
  );
};

export default Topbar;
