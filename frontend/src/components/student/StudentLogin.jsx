import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import axios from "axios";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

const StudentLogin = () => {
  const [error, setError] = useState(null);

  async function getLoginURL() {
    try {
      setError(false);
      const { data } = await axios.get("/api/student/auth/google", {
        params: { redirectTo: window.location.href }
      });
      if (!data.url) throw new Error("No data.url");
      window.open(data.url, "_self");
    } catch (err) {
      // DEBUG - don't use alert
      // alert("Error while loading Google auth URL");
      setError(true);
      console.log(err?.response?.data);
    }
  }

  useEffect(() => {
    getLoginURL();
  }, []);

  return (
    <Container bg="dark" variant="dark" className="mt-8 pb-4">
      {error ? (
        <p>
          Si è verificato un errore, premi il tasto sottostante per provare a
          generare un nuovo link
        </p>
      ) : (
        <p>Reindirizamento al login con Google...</p>
      )}

      {error && (
        <Button
          as={Link}
          to="/student/login"
          variant="outline-primary"
          className="mt-3"
          onClick={getLoginURL}
        >
          Login
        </Button>
      )}
    </Container>
  );
};

export default StudentLogin;
