import { NumberField } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import { Avatar, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { IOrderDetailResponse, IOrderResponse } from "../../interfaces";
import { Product, ProductFooter, ProductText } from "./style";

type OrderDeliverablesProps = {
  record: IOrderResponse;
  isLoading: boolean;
};

const { Text } = Typography;

export const OrderDeliverables: React.FC<OrderDeliverablesProps> = ({
  record,
  isLoading,
}) => {
  const t = useTranslate();

  const columns: ColumnsType<IOrderDetailResponse> = [
    {
      title: "#",
      key: "index",
      width: "0.5rem",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: t("orders.deliverables.fields.items"),
      key: "name",
      dataIndex: "name",
      defaultSortOrder: "descend",
      sorter: (a: IOrderDetailResponse, b: IOrderDetailResponse) =>
        a.productDetail.product.name > b.productDetail.product.name ? 1 : -1,
      render: (_, record) => {
        return (
          <Product>
            <Avatar
              size={{
                md: 60,
                lg: 108,
                xl: 108,
                xxl: 108,
              }}
              src={record.productDetail.image || "URL_OF_DEFAULT_IMAGE"}
            />
            <ProductText>
              <Text style={{ fontSize: 22, fontWeight: 800 }}>
                {record.productDetail.product.name}
              </Text>
              <Text>#{record.productDetail.product.code}</Text>
            </ProductText>
          </Product>
        );
      },
    },
    {
      title: t("orders.deliverables.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      render: (_, { quantity }) => {
        return <Text style={{ fontWeight: 800 }}>x{quantity}</Text>;
      },
    },
    {
      title: t("orders.deliverables.fields.price"),
      key: "price",
      dataIndex: "price",
      defaultSortOrder: "descend",
      sorter: (a: IOrderDetailResponse, b: IOrderDetailResponse) =>
        a.price - b.price,
      render: (_, { price }) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          style={{ fontWeight: 800 }}
          value={price}
          locale={"vi"}
        />
      ),
    },
    {
      title: t("orders.deliverables.fields.total"),
      key: "amount",
      dataIndex: "amount",
      width: "10%",
      align: "end",
      defaultSortOrder: "descend",
      sorter: (a: IOrderDetailResponse, b: IOrderDetailResponse) =>
        a.price * a.quantity - b.price * b.quantity,
      render: (_, { price, quantity }) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={price * quantity}
          locale={"vi"}
        />
      ),
    },
  ];
  return (
    <Table
      pagination={false}
      dataSource={record?.orderDetails}
      loading={isLoading}
      columns={columns}
      rowKey="id"
      footer={(_data) => (
        <ProductFooter>
          <Text>{t("orders.deliverables.mainTotal")}</Text>
          <NumberField
            options={{
              currency: "VND",
              style: "currency",
            }}
            style={{ fontWeight: 800 }}
            value={record?.totalMoney}
            locale={"vi"}
          />
        </ProductFooter>
      )}
    />
  );
};
