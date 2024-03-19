import { Row } from "antd";
import React from "react";
import { IOrderResponse } from "../../interfaces";
import DirectSalesLeft from "./DirectSalesLeft";
import DirectSalesRight from "./DirectSalesRight";

type DirectSalesProps = {
  order: IOrderResponse;
};

export const DirectSales: React.FC<DirectSalesProps> = ({ order }) => {
  return (
    <Row gutter={[16, 24]} style={{ height: "100%" }}>
      <DirectSalesLeft order={order} />
      <DirectSalesRight order={order} />
    </Row>
  );
};
