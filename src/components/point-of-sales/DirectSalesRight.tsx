import { Card, Col, Space, TablePaginationConfig, theme } from "antd";
import React, { useState } from "react";
import { ColSpanType, IOrderResponse } from "../../interfaces";
import DirectSalesRightContent from "./DirectSalesRightContent";
import DirectSalesRightFooter from "./DirectSalesRightFooter";
import DirectSalesRightHeader from "./DirectSalesRightHeader";

const { useToken } = theme;

type DirectSalesRightProps = {
  order: IOrderResponse;
  span?: ColSpanType | undefined;
};

const DirectSalesRight: React.FC<DirectSalesRightProps> = ({
  order,
  span = 10,
}) => {
  const { token } = useToken();

  return (
    <Col span={span}>
      <Card
        style={{
          background: token.colorPrimaryBg,
          height: "100%",
        }}
        styles={{
          body: {
            height: "100%",
          },
        }}
      >
        <Space
          direction="vertical"
          className="d-flex flex-column justify-content-between h-100"
        >
          {/* Header */}
          <DirectSalesRightHeader order={order} />
          {/* Content */}
          <DirectSalesRightContent />
          {/* Footer */}
          <DirectSalesRightFooter order={order} />
        </Space>
      </Card>
    </Col>
  );
};

export default DirectSalesRight;
