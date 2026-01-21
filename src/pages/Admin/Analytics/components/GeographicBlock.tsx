import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';

interface GeographicBlockProps {
  profiles: any[];
  transactions: any[];
}

const GeographicBlock: React.FC<GeographicBlockProps> = ({ profiles, transactions }) => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardBody>
            <h5 className="card-title mb-3">Geographic Distribution Analytics</h5>
            <p className="text-muted">Geographic charts will be implemented here (6 charts)</p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default GeographicBlock;
