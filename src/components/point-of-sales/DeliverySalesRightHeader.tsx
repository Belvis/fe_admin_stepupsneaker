import { Col, Row, Space, Typography } from "antd";
import { formatTimestamp } from "../../helpers/timestamp";
import { IOrderResponse } from "../../interfaces";
import CustomerSection from "./CustomerInputSection";
import EmployeeSection from "./EmployeeInputSection";

const { Text } = Typography;

type DeliverySalesRightHeaderProps = {
  order: IOrderResponse;
};

export const DeliverySalesRightHeader: React.FC<
  DeliverySalesRightHeaderProps
> = ({ order }) => {
  return (
    <Row gutter={[10, 10]} className="h-100">
      <Col span={24}>
        <Row>
          <Col span={16}>
            <EmployeeSection order={order} />
          </Col>
          <Col span={8} className="text-end">
            <Space wrap>
              <Text>{formatTimestamp(order.createdAt).dateFormat}</Text>
              <Text>{formatTimestamp(order.createdAt).timeFormat}</Text>
            </Space>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row>
          <Col span={16} className="h-100">
            <CustomerSection order={order} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
