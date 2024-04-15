import { useTranslate } from "@refinedev/core";
import { IOrderResponse } from "../../interfaces";
import {
  Employee,
  EmployeeBoxContainer,
  EmployeeInfoBox,
  EmployeeInfoBoxText,
  EmployeeInfoText,
} from "./style";
import { Avatar, Col, Row, Typography } from "antd";
import { ReactNode } from "react";
import { MailOutlined, MobileOutlined } from "@ant-design/icons";

const { Text } = Typography;

type EmployeeInfoProps = {
  record: IOrderResponse;
};

export const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ record }) => {
  const t = useTranslate();

  const employeeInfoBox = (text: string, icon: ReactNode, value?: string) => (
    <EmployeeInfoBox>
      {icon}
      <EmployeeInfoBoxText>
        <Text style={{ color: "#ffffff" }}>{text.toUpperCase()}</Text>
        <Text style={{ color: "#ffffff" }}>{value}</Text>
      </EmployeeInfoBoxText>
    </EmployeeInfoBox>
  );

  return (
    <Row justify="center">
      <Col xl={12} lg={10}>
        <Employee>
          <Avatar
            size={108}
            src={
              record && record.employee && record.employee.image
                ? record.employee.image
                : "URL_OF_DEFAULT_IMAGE"
            }
          />

          <EmployeeInfoText>
            <Text style={{ fontSize: 16 }}>
              {t("orders.fields.employee").toUpperCase()}
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {record && record.employee && record.employee.fullName
                ? record.employee.fullName
                : "N/A"}
            </Text>
            <Text>
              {t("employees.fields.role")}:{" "}
              {record && record.employee && record.employee.role
                ? t(`roles.${record.employee.role.name}`)
                : "N/A"}
            </Text>
          </EmployeeInfoText>
        </Employee>
      </Col>
      <EmployeeBoxContainer xl={12} lg={14} md={24}>
        {employeeInfoBox(
          t("employees.fields.phoneNumber"),
          <MobileOutlined style={{ color: "#ffff", fontSize: 32 }} />,
          record && record.employee && record.employee.phoneNumber
            ? record.employee.phoneNumber
            : "N/A"
        )}
        {employeeInfoBox(
          t("employees.fields.email"),
          <MailOutlined style={{ color: "#ffff", fontSize: 32 }} />,
          record && record.employee && record.employee.email
            ? record.employee.email
            : "N/A"
        )}
      </EmployeeBoxContainer>
    </Row>
  );
};
