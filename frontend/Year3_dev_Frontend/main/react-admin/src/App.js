import { useState , createContext} from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import Landing from "./scenes/landing";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import SignIn from "./scenes/signIn";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Footer from "./scenes/global/Footer";
import About from "./scenes/about";
import Contact from "./scenes/contact";
import Configuration from "./scenes/configuration/Configuration";
import SignUp from "./scenes/signUp";
import Weatherdata from "./scenes/weatherdata/Weatherdata";
import AqiRef from "./components/AqiRef/AqiRef3";
import ContactForm from "./scenes/contact/contact";
const debug_mode = process.env.REACT_APP_DEBUG_MODE === "false";
export const host = process.env.REACT_APP_BACKEND_URL;


export const  UserContext = createContext();
function App() {
    const [isSignIn, setIsSignin] = useState(debug_mode);
    const [signUp, setSignUp] = useState(false);
    const [theme, colorMode] = useMode();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <UserContext.Provider value={setIsSignin}>
        {
            !isSignIn ?
            <>
                {!signUp && <SignIn setSignUp={setSignUp} setIsSignin={setIsSignin}/>}
                {signUp && <SignUp setSignUp={setSignUp}/>}
            </>
            :
            <>
                <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <div className="app">
                    <main className="content" >
                        <Topbar setIsSignin={setIsSignin}/>
                        <Routes>
                            <Route path="" element={<Landing />} />
                            <Route path="/landing/dashboard" element={<Dashboard/>} />
                            <Route path="/landing" element={<Landing />} />
                            {
                                localStorage.getItem("role").toString() === "2"
                                &&
                                <Route path="/configuration" element={<Configuration />} />
                            }
                            {/* <Route path="/weatherdata" element={<Weatherdata/>} /> */}
                        </Routes>
                        <ContactForm/>
                        <Footer/>
                    </main>
                    </div>
                </ThemeProvider>
                </ColorModeContext.Provider>
            </>
        }
        </UserContext.Provider>
        </LocalizationProvider>
    );
}
export default App;

// import React from "react";
// import { useTranslation } from "react-i18next";  // Import useTranslation từ react-i18next
// import "./utils/i18n"; // Import cấu hình i18n

// function App() {
//   const { t, i18n } = useTranslation(); // Dùng useTranslation để lấy t (hàm dịch) và i18n (đối tượng ngôn ngữ)

//   const changeLanguage = (lng) => {
//     i18n.changeLanguage(lng); // Thay đổi ngôn ngữ
//   };

//   return (
//     <div>
//       <h1>{t("welcome")}</h1> {/* Dịch từ khóa "welcome" */}
//       <button onClick={() => changeLanguage("en")}>English</button>
//       <button onClick={() => changeLanguage("vi")}>Tiếng Việt</button>
//     </div>
//   );
// }

// export default App;


