const verifyRefreshToken  = async (backend_host, token) => {
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
    if(verify_refresh_token_API_response.status !== 200){
        return false;
    }
    else if(verify_refresh_token_API_response.status === 200 &&  verify_refresh_token_API_response_data.hasOwnProperty("access"))
    {
        localStorage.setItem("access", verify_refresh_token_API_response_data["access"]);
        return true
    }
    else{
        return false;
    }
}
export default verifyRefreshToken
