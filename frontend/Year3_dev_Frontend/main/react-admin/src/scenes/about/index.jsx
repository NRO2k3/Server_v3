import { Box } from "@mui/material";
import Container from "@mui/material/Container";


const About = () => 
{   
    return (
        <Container sx={{ py: 6 }} maxWidth="lg">
            <Box display="flex" justifyContent="center">
                <h1>About page</h1>
            </Box>
        </Container>
    )

}

export default About;