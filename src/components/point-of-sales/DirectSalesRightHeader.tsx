import {
  AppstoreOutlined,
  FilterOutlined,
  PictureOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import React, { useState } from "react";
import { IOrderResponse } from "../../interfaces";
import CustomerSection from "./CustomerInputSection";
import { POSFilter } from "./POSFilter";

type DirectSalesRightHeaderProps = {
  order: IOrderResponse;
  pLayout: "horizontal" | "vertical";
  handleToggleLayout: () => void;
};

const DirectSalesRightHeader: React.FC<DirectSalesRightHeaderProps> = ({
  order,
  pLayout,
  handleToggleLayout,
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  const showFilterDrawer = () => {
    setFilterDrawerOpen(true);
  };

  const closeFilterDrawer = () => {
    setFilterDrawerOpen(false);
  };

  return (
    <Row gutter={[16, 24]}>
      <Col span={18}>
        <CustomerSection order={order} />
      </Col>
      <Col span={2}>
        <Button shape="circle" type="text" icon={<UnorderedListOutlined />} />
      </Col>
      <Col span={2}>
        <Button
          shape="circle"
          type="text"
          icon={<FilterOutlined />}
          onClick={showFilterDrawer}
        />
      </Col>
      <Col span={2}>
        <Button
          shape="circle"
          type="text"
          icon={
            pLayout === "horizontal" ? (
              <AppstoreOutlined />
            ) : (
              <PictureOutlined />
            )
          }
          onClick={handleToggleLayout}
        />
      </Col>
      <POSFilter open={filterDrawerOpen} onClose={closeFilterDrawer} />
    </Row>
  );
};

export default DirectSalesRightHeader;
