import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';

interface RevenueBlockProps {
  subscriptions: any[];
  transactions: any[];
}

const RevenueBlock: React.FC<RevenueBlockProps> = ({ subscriptions, transactions }) => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardBody>
            <h5 className="card-title mb-3">Revenue & Subscriptions Analytics</h5>
            <p className="text-muted">Revenue charts will be implemented here (9 charts)</p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default RevenueBlock;
