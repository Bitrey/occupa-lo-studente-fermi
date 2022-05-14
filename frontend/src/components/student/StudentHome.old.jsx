import React, { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import RequireStudentLogin from "./RequireStudentLogin";
import { setMessage } from "../../slices/alertSlice";

const selectStudent = state => state.student;

const StudentHome = () => {
  /**
   * Fetch job offers on load
   * If fail, set err to a string, else keep it null
   * Finally set loaded as true
   *
   * If loading: show loading screen
   * Else:
   *  If agencies: show agencies
   *  Else: show error screen with `err` message
   */
  const [agencies, setAgencies] = useState(null);
  const [err, setErr] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const dispatch = useDispatch();
  const { student } = useSelector(selectStudent);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    async function fetchAgencies() {
      try {
        const { data } = await axios.get("/api/student/agencies");
        console.log(data);
        setAgencies(data);
      } catch (err) {
        console.log(err);
        setErr(err?.response?.data?.err || "Errore sconosciuto");
      } finally {
        setLoaded(true);
      }
    }

    if (student) {
      fetchAgencies();
      if (searchParams.get("loggedin")) {
        console.log("LOGGEDIN SEARCH PARAM DEBUG");
        dispatch(
          setMessage({
            color: "green",
            text: `Bentornato, ${student.firstName}!`
          })
        );
        searchParams.delete("loggedin");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  return (
    <RequireStudentLogin>
      <Container bg="dark" variant="dark" className="mt-8 mb-4">
        <div>
          <p>
            Sono la <span className="font-semibold">student homepage!!</span>
          </p>
        </div>

        {!loaded ? (
          <div className="flex w-full justify-center text-center mt-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </Spinner>
          </div>
        ) : Array.isArray(agencies) ? (
          <div>
            <p className="my-3 text-3xl font-semibold">Aziende disponibili</p>
            {/* {JSON.stringify(agencies, null, 4)} */}
            <Row xs={1} lg={2}>
              {agencies.length > 0 ? (
                agencies.map((e, i) => (
                  <Col key={i} className="mb-3">
                    {/* <pre>
                      <code>{JSON.stringify(e, null, 4)}</code>
                    </pre> */}
                    <Card>
                      <div className="flex flex-col">
                        {e.logoUrl && (
                          <img
                            loading="lazy"
                            src={e.logoUrl}
                            alt="Agency logo"
                            className="max-w-xs mx-auto sm:p-2 md:p-3 lg:p-4 min-w-[4rem] object-contain"
                          />
                        )}
                        <Card.Body>
                          <Card.Title>{e.agencyName}</Card.Title>
                          <Card.Subtitle>
                            <a
                              href={e.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {e.websiteUrl}
                            </a>
                          </Card.Subtitle>
                          <Card.Text className="mb-2 text-muted">
                            <ReactMarkdown
                              children={
                                e.agencyDescription.length > 100
                                  ? e.agencyDescription.substring(0, 100) +
                                    "..."
                                  : e.agencyDescription
                              }
                            />
                          </Card.Text>
                          <Card.Text>
                            <strong>{e.jobOffers.length}</strong> offerte di
                            lavoro
                          </Card.Text>
                          <Button className="mt-2" variant="outline-primary">
                            Visualizza
                          </Button>
                        </Card.Body>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                <div>Nessuna offerta di lavoro disponibile :(</div>
              )}
            </Row>
          </div>
        ) : (
          <div>Errore: {err}</div>
        )}
        <Outlet />
      </Container>
    </RequireStudentLogin>
  );
};

export default StudentHome;
