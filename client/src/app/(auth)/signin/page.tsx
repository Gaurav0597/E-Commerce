"use client";
import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@/app/_Components/Conponents";
import Form from "./form";

const SigninSimple = () => {
  return (
    <Box
      position="relative"
      minHeight="calc(100vh - 247px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={1}
      width={1}
   
    >
      <Container>
        <Grid
          container
          spacing={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Grid
            size={{ xs: 12, md: 6 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Form />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SigninSimple;
