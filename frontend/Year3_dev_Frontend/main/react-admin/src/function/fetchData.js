import verifyAccessToken from "./verifyAccessToken";
import verifyRefreshToken from "./verifyRefreshToken";

const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url) =>
{
    const token = {access_token: null, refresh_token: null}
    if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null){
        token.access_token = localStorage.getItem("access");
        token.refresh_token = localStorage.getItem("refresh");
    } else {
        throw new Error("There is no access token and refresh token ....");
    }

    if( await verifyAccessToken(backend_host, token) === true){
        fetch_data_function(url, token["access_token"])
    } else {
        if(await verifyRefreshToken(backend_host, token) === true){
            fetch_data_function(url, token["access_token"]);
        } else {
            callbackSetSignIn(false);
        }
    }
}
export default verify_and_get_data