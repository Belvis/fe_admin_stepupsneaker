import React from "react";
import { Card, Space, Typography, Avatar, Grid } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { formatTimestamp } from "../../helpers/timestamp";
import { useTranslate } from "@refinedev/core";

const { useBreakpoint } = Grid;

const CustomerCard: React.FC<{ customer: any }> = ({ customer }) => {
  const t = useTranslate();
  const { xl } = useBreakpoint();

  return (
    <Card bordered={false} className="h-100">
      <Space direction="vertical" className="w-100 h-100">
        <Space direction="vertical" className="text-center w-100">
          <Avatar size={120} src={customer?.image}></Avatar>
          <Typography.Title level={3}>{customer?.fullName}</Typography.Title>
        </Space>
        <Space
          direction="vertical"
          className={`${xl ? "" : "text-center"} w-100`}
        >
          <Typography.Text className="d-flex justify-content-between">
            <span>
              <UserOutlined /> {t("customers.fields.gender.label")}
            </span>
            {t(`customers.fields.gender.options.${customer?.gender}`)}
          </Typography.Text>
          <Typography.Text className="d-flex justify-content-between">
            <span>
              <PhoneOutlined /> {t("customers.fields.email")}
            </span>
            {customer?.email}
          </Typography.Text>
          <Typography.Text className="d-flex justify-content-between">
            <span>
              <CalendarOutlined /> {t("customers.fields.dateOfBirth")}
            </span>
            {formatTimestamp(customer?.dateOfBirth || 0).dateFormat}
          </Typography.Text>
          <Typography.Text className="d-flex justify-content-between">
            <span>
              <CheckOutlined /> {t("customers.fields.status")}
            </span>
            {t(`enum.customerStatuses.${customer?.status}`)}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  );
};

export default CustomerCard;
