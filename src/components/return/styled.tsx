import { Typography, Timeline as AntdTimeline } from "antd";
import styled from "styled-components";

export const CreatedAt = styled(Typography.Text)`
  font-size: 12px;
  cursor: default;
`;
export const Number = styled(Typography.Text)`
  cursor: pointer;
`;
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
