import React from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';

const AboutUs = () => {
  document.title = 'About Us | Velzon';

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xs={12}>
              <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                <h4 className="mb-sm-0">About Us</h4>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <p className="text-muted">About Us content will be added here.</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AboutUs;
