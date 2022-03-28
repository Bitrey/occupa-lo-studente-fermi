import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import axios from "axios";

const StudentJobOffers = () => {
  /**
   * Fetch job offers on load
   * If fail, set err to a string, else keep it null
   * Finally set loaded as true
   *
   * If loading: show loading screen
   * Else:
   *  If jobOffers: show jobOffers
   *  Else: show error screen with `err` message
   */
  const [jobOffers, setJobOffers] = useState(null);
  const [err, setErr] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/student/joboffers");
        console.log(data);
        setJobOffers(data);
      } catch (err) {
        console.log(err);
        setErr(err?.err || "Errore sconosciuto");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  return (
    <Container bg="dark" variant="dark" className="mt-8 pb-4">
      <Button variant="outline-success" onClick={() => navigate(-1)}>
        &#60;- Homepage studenti
      </Button>
      {!loaded ? (
        <p>Caricamento...</p>
      ) : Array.isArray(jobOffers) ? (
        <div>
          <p className="my-3 text-3xl font-semibold">Offerte di lavoro</p>
          {/* {JSON.stringify(jobOffers, null, 4)} */}
          {jobOffers.length > 0 ? (
            jobOffers.map((e, i) => (
              <div key={i}>
                <Card style={{ width: "18rem" }}>
                  {e.agency.logoUrl && (
                    <Card.Img variant="top" src={e.agency.logoUrl} />
                  )}
                  <Card.Body>
                    <Card.Title>{e.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {e.agency.agencyName}
                    </Card.Subtitle>
                    <Card.Text>{e.description}</Card.Text>
                    <Button className="mt-2" variant="outline-primary">
                      Visualizza
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))
          ) : (
            <div>Nessuna offerta di lavoro disponibile :(</div>
          )}
        </div>
      ) : (
        <div>Errore: {err}</div>
      )}
      <Outlet />
    </Container>
  );
};

export default StudentJobOffers;
