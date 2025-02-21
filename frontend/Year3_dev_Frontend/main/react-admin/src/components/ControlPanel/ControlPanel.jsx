import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../Header";
import {IconButton} from "@mui/material";
import { useState } from "react";
import { Button, Icon, TextField, Paper} from "@mui/material";

const ControlPanel = () => {
  const [tempSetPoint, setTempSetPoint] = useState(0)
  const [co2SetPoint, setCo2SetPoint] = useState(0)

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const dataRow = [
    {
		  id: 1,
		  aim_column: "Tempeature"
	  },
    {
      id: 2,
      aim_column: "Co2",
    },
  ]


  const columns = [
    { 
      field: "aim_column", 
      headerName: "Aim",
      flex: 1,
    },
    {
      field: "set_point",
      headerName: "Set Point",
      flex: 1,
      // cellClass: "name-column--cell",
      renderCell: (row_information) => {
        return (
          <Box
            // width="80%"
            // height="30%"
            // mb="50px"
            // p="10px"
            container="true"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justify="center"
            backgroundColor=""
            borderRadius="10px"
          >
            <TextField
              // label="Set Point label"
              sx={{
                width: { md: 105 },
                "& .MuiInputBase-root": {
                    height: 40
                }
              }}
              name="Set Point name"
              defaultValue={0}
              onChange={(event)=>{
                if(row_information.row.id===1)
                {
                  setTempSetPoint(event.target.value)
                }
                else if(row_information.row.id===2)
                {
                  setCo2SetPoint(event.target.value)
                }
              }}	
              // helperText="Enter"
            />
          </Box>
        );
      },
    },
    {
      field: "processValue",
      headerName: "Process Value",
      flex: 1,
      // cellClassName: "name-column--cell",
      renderCell: () => {
        return(
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor=""
            borderRadius="4px"
          >
            -:-
          </Box>
        )
      }
      // renderCell: () => {
      //   return (
      //     <Box
      //       width="60%"
      //       m="0 auto"
      //       p="5px"
      //       display="flex"
      //       justifyContent="center"
      //       backgroundColor={colors.greenAccent[600]}
      //       borderRadius="4px"
      //     >
      //       <Button
      //         onClick={()=>{alert(tempSetPoint)}}
      //       >
      //         <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
      //           Send
      //         </Typography>
      //       </Button>
      //     </Box>
      //   );
      // },
    },
    {
      field: "submit",
      headerName: "Submit",
      flex: 1,
      renderCell: (row_information) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="2px"
            display="flex"
            justifyContent="center"
            // backgroundColor={"#050505"}
            borderRadius="4px"
          >
            <Button 
                variant="outlined"
                onClick={()=>{
                    if(row_information.row.id === 1)
                    {
                      alert(`This is temperature: ${tempSetPoint}`)
                    }
                    else
                    {
                      alert(`This is Co2: ${co2SetPoint}`)
                    }
                  }}
            > 
              <Header title="Submit" fontSize="12px"/>
            </Button>
          </Box>
        );
      },
    },
  ];

  // const CustomHeaderCell = (params) => {
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       backgroundColor={colors.greenAccent[600]}
  //       borderRadius="4px"
  //     >
  //       <div style={{ textAlign: 'center', height: "50%"}}>
  //       {params.colDef.headerName}
  //       </div>
  //     </Box>
      
  //   );
  // };

//     const CustomHeaderCell = (params) => {
//     return (
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: "#050505",
//           borderRadius: '4px',
//           textAlign: 'center',
//           height: '100%', // Make sure the height covers the full cell height
//         }}
//       >
//         {params.colDef.headerName}
//       </div>
//     );
//   };

  return (
      <Box
        // m="-5px 30px 30px 20px"
        
        height="200px"       //set height of all component
        sx={{
          width: { xs:410, sm: 410, md: 510, lg: 510 },
                "& .MuiInputBase-root": {
                    height: 35
                },

          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            // color: "yellow",
            // textAlign: "center",
            fontSize: "15px",
            justifyContent: "center",
          },
          "& .name-column--cell": {
            // color: colors.blueAccent[300],
            color: "red",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#050505",
            borderBottom: "none",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            borderRadius: '4px',
            fontSize: "15px",
          },
          "& .MuiDataGrid-columnHeaderTitleContainer": {
            backgroundColor: "#050505",
            borderBottom: "none",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            borderRadius: '4px',
            color: "white",
          },
          "& .MuiDataGrid-virtualScroller": {
            // backgroundColor: colors.primary[400],
          },
          // "& .MuiDataGrid-footerContainer": {
          //   borderTop: "none",
          //   backgroundColor: colors.blueAccent[700],
          // },
          // "& .MuiCheckbox-root": {
          //   color: `${colors.greenAccent[200]} !important`,
          // },
        }}
      >
        <DataGrid 
            // checkboxSelection 
            hideFooter={true}
            rows={dataRow} 
            columns={columns} 
            disableColumnMenu={true}
      />
      </Box>
  );
};

export default ControlPanel;
