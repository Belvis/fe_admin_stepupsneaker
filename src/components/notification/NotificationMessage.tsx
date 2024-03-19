import { useTranslate } from "@refinedev/core";
import { Typography } from "antd";
import { useMemo } from "react";

const { Text } = Typography;

type Props = {
  content: string;
  type:
    | "ORDER_PLACED"
    | "ORDER_PENDING"
    | "ORDER_CHANGED"
    | "PRODUCT_LOW_STOCK";
};

export const NotificationMessage = ({ content, type }: Props) => {
  const t = useTranslate();

  const translate = useMemo(() => t(`sse.message.${type}`), [t, type]);

  return (
    <Text>
      <Text strong>{content ?? "Một khách hàng"}</Text>
      {translate}
    </Text>
  );
};
