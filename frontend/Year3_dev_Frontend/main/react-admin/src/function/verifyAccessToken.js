const verifyAccessToken  = async (backend_host, token) => {
    const verify_access_token_API_endpoint = `http://${backend_host}/api/token/verify`
    const verify_access_token_API_data = {
        "token": token.access_token,
    }
    const verify_access_token_API_option = {
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

export default verifyAccessToken