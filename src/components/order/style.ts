import { CSSProperties } from "react";
import { Typography, Timeline as AntdTimeline, Col } from "antd";
import styled from "styled-components";

const { Title } = Typography;

export const buttonStyle: CSSProperties = {
  fontSize: 15,
  display: "flex",
  alignItems: "center",
  fontWeight: 500,
};

export const Timeline = styled(AntdTimeline)`
  .ant-timeline-item-head {
    background-color: transparent;
  }
`;

export const TimelineItem = styled(AntdTimeline.Item)``;

export const TimelineContent = styled.div<{ backgroundColor: string }>`
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 6px;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

export const CreatedAt = styled(Typography.Text)`
  font-size: 12px;
  cursor: default;
`;

export const Product = styled.div`
  display: flex;
  align-items: center;
`;

export const ProductText = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 25px;
  white-space: nowrap;
`;

export const ProductFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  font-weight: 800;

  & > span:first-child {
    margin-right: 2rem;
    color: #67be23;
  }

  & > span:nth-child(2) {
    margin-right: 20px;
  }
`;

export const Employee = styled.div`
  display: flex;
  align-items: center;
`;

export const EmployeeInfoText = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 25px;

  @media screen and (max-width: 768px) {
    margin-bottom: 25px;
  }
`;

export const EmployeeInfoBox = styled.div`
  display: flex;
  background-color: #67be23;
  align-items: center;
  padding: 10px 13px;
  margin-left: 20px;
  border-radius: 10px;

  @media screen and (max-width: 1199px) {
    margin-right: 12px;
    margin-left: 0;
  }

  @media screen and (max-width: 768px) {
    margin-bottom: 15px;
    width: 100%;
  }

  @media screen and (max-width: 768px) {
    margin-bottom: 15px;
    width: 100%;
  }
`;

export const EmployeeInfoBoxText = styled.div`
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 768px) {
    margin-bottom: 25px;
  }
`;

export const EmployeeBoxContainer = styled(Col)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: white;

  svg {
    margin-right: 10px;
  }

  @media screen and (max-width: 768px) {
    margin-top: 35px;
    flex-direction: column;
  }
`;

export const DiscountMessage = styled(Title)`
  color: #fb5231;
  line-height: 1.3rem;
  font-weight: normal;
`;

export const DiscountMoney = styled.span`
  color: #fb5231;
  font-weight: bold;
`;
