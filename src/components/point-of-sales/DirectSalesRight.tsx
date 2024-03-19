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

  const [pLayout, setpLayout] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const handleToggleLayout = () => {
    setpLayout((prevLayout) =>
      prevLayout === "horizontal" ? "vertical" : "horizontal"
    );
  };

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
          <DirectSalesRightHeader
            pLayout={pLayout}
            handleToggleLayout={handleToggleLayout}
            order={order}
          />
          {/* Content */}
          <DirectSalesRightContent
            pLayout={pLayout}
            pagination={pagination}
            setPagination={setPagination}
          />
          {/* Footer */}
          <DirectSalesRightFooter
            order={order}
            pagination={pagination}
            setPagination={setPagination}
          />
        </Space>
      </Card>
    </Col>
  );
};

export default DirectSalesRight;
