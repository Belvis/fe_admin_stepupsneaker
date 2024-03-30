import { Card, Col, Space, theme } from "antd";
import { IOrderResponse } from "../../../interfaces";
import { DeliverySalesRightContent } from "./DeliverySalesRightContent";
import { DeliverySalesRightFooter } from "./DeliverySalesRightFooter";
import { DeliverySalesRightHeader } from "./DeliverySalesRightHeader";

const { useToken } = theme;

type DeliverySalesRightProps = {
  order: IOrderResponse;
};

export const DeliverySalesRight: React.FC<DeliverySalesRightProps> = ({
  order,
}) => {
  const { token } = useToken();

  return (
    <Col span={12}>
      <Card
        style={{ background: token.colorPrimaryBg, height: "100%" }}
        styles={{
          body: { height: "100%" },
        }}
      >
        <Space
          direction="vertical"
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <DeliverySalesRightHeader order={order} />
          <DeliverySalesRightContent order={order} />
          <DeliverySalesRightFooter order={order} />
        </Space>
      </Card>
    </Col>
  );
};
