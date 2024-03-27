import { NumberField, useSimpleList } from "@refinedev/antd";
import { Typography, Avatar, Space, List as AntdList, Badge } from "antd";
import { Container, AvatarWrapper, AvatarCircle, TextWrapper } from "./styled";
import { useEffect } from "react";
import { IProductDetailResponse } from "../../interfaces";
import { useTranslate } from "@refinedev/core";

const { Text } = Typography;

type TrendingMenuProps = {
  range: { start: number; end: number };
};
export const TrendingMenu: React.FC<TrendingMenuProps> = ({ range }) => {
  const {
    listProps,
    setFilters,
    queryResult: { refetch },
  } = useSimpleList<IProductDetailResponse>({
    resource: "product-details/trending",
    pagination: { pageSize: 5 },
    filters: {
      initial: [
        {
          field: "start",
          operator: "eq",
          value: range.start,
        },
        {
          field: "end",
          operator: "eq",
          value: range.end,
        },
      ],
    },
    syncWithLocation: false,
  });

  useEffect(() => {
    if (range) {
      setFilters([
        {
          field: "start",
          operator: "eq",
          value: range.start,
        },
        {
          field: "end",
          operator: "eq",
          value: range.end,
        },
      ]);
    }
  }, [range]);

  return (
    <AntdList
      {...listProps}
      pagination={false}
      renderItem={(item, index) => <MenuItem item={item} index={index} />}
    />
  );
};
const MenuItem: React.FC<{ item: IProductDetailResponse; index: number }> = ({
  item,
  index,
}) => {
  const t = useTranslate();

  return (
    <Container key={item.id}>
      <Space size="large">
        <AvatarWrapper className="menu-item__avatar">
          <Avatar
            size={{
              xs: 64,
              sm: 64,
              md: 64,
              lg: 108,
              xl: 132,
              xxl: 108,
            }}
            src={item.image}
          />
          <AvatarCircle>
            <span>#{index + 1}</span>
          </AvatarCircle>
        </AvatarWrapper>

        <TextWrapper>
          <Text strong>{item.product.name}</Text>
          <NumberField
            strong
            options={{
              currency: "VND",
              style: "currency",
              notation: "standard",
            }}
            locale={"vi"}
            value={item.price}
          />
          <Text strong style={{ color: "red" }}>
            {t("dashboard.trendingMenus.sales", { count: item.saleCount })}
          </Text>
        </TextWrapper>
      </Space>
    </Container>
  );
};
