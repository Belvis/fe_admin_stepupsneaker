import { useTable } from "@refinedev/antd";
import { useNavigation, useTranslate } from "@refinedev/core";
import { Avatar, Space, Table, Tag, Typography } from "antd";
import { OrderId, Price, Title, TitleWrapper } from "./styled";

import { ColumnsType } from "antd/es/table";
import { IOrderResponse } from "../../interfaces";
import { OrderActions } from "../order/OrderActions";

const { Text, Paragraph } = Typography;

export const RecentOrders: React.FC = () => {
  const t = useTranslate();
  const { tableProps } = useTable<IOrderResponse>({
    resource: "orders",
    initialSorter: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
    initialPageSize: 4,
    permanentFilter: [
      {
        field: "status",
        operator: "eq",
        value: "COMPLETED",
      },
    ],
    syncWithLocation: false,
  });

  const { show } = useNavigation();

  const columns: ColumnsType<IOrderResponse> = [
    {
      title: "",
      key: "avatar",
      align: "center",
      render: (_, record) => (
        <Avatar
          size={{
            xs: 60,
            lg: 108,
            xl: 132,
            xxl: 144,
          }}
          src={
            record.orderDetails[0]?.productDetail?.product?.image ??
            "default_image_url"
          }
        />
      ),
    },
    {
      title: "",
      key: "summary",
      render: (_, record) => (
        <TitleWrapper>
          <Title strong>
            {record.orderDetails[0]?.productDetail?.product?.name}
          </Title>
          <Paragraph
            ellipsis={{
              rows: 2,
              tooltip:
                record.orderDetails[0]?.productDetail?.product?.description,
              symbol: <span>...</span>,
            }}
          >
            {record.orderDetails[0]?.productDetail?.product?.description}
          </Paragraph>

          <OrderId
            strong
            onClick={() => {
              show("orders", record.id);
            }}
          >
            #{record.code}
          </OrderId>
        </TitleWrapper>
      ),
    },
    {
      key: "summary",
      render: (_, record) => (
        <Space direction="vertical">
          {record.employee ? (
            <>
              <Title strong>{`${record.employee.fullName}`}</Title>
              <Text>{record.employee.address}</Text>
            </>
          ) : (
            "N/A"
          )}
        </Space>
      ),
    },
    {
      key: "amount",
      render: (_, record) => (
        <Space
          size="large"
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Price
            strong
            options={{
              currency: "VND",
              style: "currency",
              notation: "standard",
            }}
            value={record.totalMoney}
          />
          <Tag color="orange">{t(`enum.orderStatuses.${record.status}`)}</Tag>
        </Space>
      ),
    },
    {
      fixed: "right",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <OrderActions hideText={true} record={record} callBack={undefined} />
      ),
    },
  ];
  return (
    <Table
      {...tableProps}
      pagination={{ ...tableProps.pagination, simple: true }}
      showHeader={false}
      rowKey="id"
      columns={columns}
    />
  );
};
