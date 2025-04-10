import { useState , createContext} from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import Landing from "./scenes/landing";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import SignIn from "./scenes/signIn";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Footer from "./scenes/global/Footer";
import Configuration from "./scenes/configuration/Configuration";
import SignUp from "./scenes/signUp";
import ContactForm from "./scenes/contact/contact";
import ForgetPassword from "./scenes/forgetPassword/ForgetPassword";

const debug_mode = process.env.REACT_APP_DEBUG_MODE === "false";
export const host = process.env.REACT_APP_BACKEND_URL;


export const  UserContext = createContext();
function App() {
    const [isSignIn, setIsSignin] = useState(debug_mode);
    const [signUp, setSignUp] = useState(false);
    const [theme, colorMode] = useMode();
    const [forgetPassword, setForgetPassword]  = useState(false)
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <UserContext.Provider value={setIsSignin}>
        {
            !isSignIn ?
            <>
                {!signUp && !forgetPassword && <SignIn setSignUp={setSignUp} setIsSignin={setIsSignin} setForgetPassword={setForgetPassword}/>}
                {signUp && <SignUp setSignUp={setSignUp}/>}
                {forgetPassword && <ForgetPassword setForgetPassword={setForgetPassword}/>}
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
                            <Route path="/landing" element={<Landing/>} />
                            {
                                localStorage.getItem("role").toString() === "2"
                                &&
                                <Route path="/configuration" element={<Configuration />} />
                            }
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



