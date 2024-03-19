import { Avatar, Col, Row, Typography } from "antd";
import { IProductResponse } from "../../interfaces";

const { Text } = Typography;

export const renderItemProduct = (
  title: string,
  imageUrl: string,
  product: IProductResponse
) => ({
  value: title,
  label: (
    <Row style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      <Col span={6}>
        <Avatar
          shape="square"
          size={64}
          src={imageUrl}
          style={{ minWidth: "64px" }}
        />
      </Col>
      <Col span={18}>
        <Text style={{ whiteSpace: "normal" }}>{title}</Text>
      </Col>
    </Row>
  ),
  product: product,
});
