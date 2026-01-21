import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';

interface ActivityBlockProps {
  activityLogs: any[];
}

const ActivityBlock: React.FC<ActivityBlockProps> = ({ activityLogs }) => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardBody>
            <h5 className="card-title mb-3">Activity & Performance Analytics</h5>
            <p className="text-muted">Activity charts will be implemented here (5 charts)</p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ActivityBlock;
