import {
  List,
  NumberField,
  getDefaultSortOrder,
  useModalForm,
  useTable,
} from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useDelete,
  useNavigation,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Card,
  Col,
  ColorPicker,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import CommonSearchForm from "../../../components/form/CommonSearchForm";
import { EditProduct } from "../../../components/product/EditProduct";
import ColumnActions from "../../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../../helpers/confirm";
import {
  IColorResponse,
  IProdAttributeResponse,
  IProductFilterVariables,
  IProductResponse,
} from "../../../interfaces";
import { calculateIndex } from "../../../utils/common/calculator";
import { ProductSearchForm } from "../../../components/product/ProductSearchForm";

const { Text } = Typography;

export const ProductList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { show } = useNavigation();
  const { mutate: mutateDelete } = useDelete();

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    id: editId,
    onFinish: editOnFinish,
  } = useModalForm<IProductResponse>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IProductResponse,
    HttpError,
    IProductFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({
      status,
      brand,
      color,
      material,
      priceMax,
      priceMin,
      quantity,
      size,
      sole,
      style,
      tradeMark,
      q,
      hasPromotion,
      quantityMax,
      quantityMin,
    }) => {
      const productDetailFilters: CrudFilters = [];

      productDetailFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });
      productDetailFilters.push({
        field: "hasPromotion",
        operator: "eq",
        value: hasPromotion ? hasPromotion : undefined,
      });
      productDetailFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q.trim() : undefined,
      });

      productDetailFilters.push({
        field: "brands",
        operator: "eq",
        value: brand ? brand : undefined,
      });
      productDetailFilters.push({
        field: "colors",
        operator: "eq",
        value: color ? color : undefined,
      });
      productDetailFilters.push({
        field: "materials",
        operator: "eq",
        value: material ? material : undefined,
      });
      productDetailFilters.push({
        field: "sizes",
        operator: "eq",
        value: size ? size : undefined,
      });
      productDetailFilters.push({
        field: "soles",
        operator: "eq",
        value: sole ? sole : undefined,
      });
      productDetailFilters.push({
        field: "styles",
        operator: "eq",
        value: style ? style : undefined,
      });
      productDetailFilters.push({
        field: "tradeMarks",
        operator: "eq",
        value: tradeMark ? tradeMark : undefined,
      });
      productDetailFilters.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });
      productDetailFilters.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });
      productDetailFilters.push({
        field: "quantityMax",
        operator: "eq",
        value: quantityMax ? quantityMax : undefined,
      });
      productDetailFilters.push({
        field: "quantityMin",
        operator: "eq",
        value: quantityMin ? quantityMin : undefined,
      });
      productDetailFilters.push({
        field: "quantity",
        operator: "eq",
        value: quantity ? quantity : undefined,
      });

      return productDetailFilters;
    },
  });

  const columns: ColumnsType<IProductResponse> = [
    {
      title: "#",
      key: "createdAt",
      dataIndex: "createdAt",
      width: "1rem",
      align: "center",
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
      render: (value, record, index) =>
        calculateIndex(sorters, current, pageSize, tableProps, index),
    },
    {
      title: t("products.fields.code"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("code", sorters),
      key: "code",
      dataIndex: "code",
      width: "2rem",
      align: "center",
    },
    {
      title: t("products.fields.name"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("name", sorters),
      dataIndex: "name",
      width: "25%",
      key: "name",
      render: (_, { image, name }) => (
        <Space>
          <Avatar shape="square" size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: t("products.fields.color"),
      dataIndex: "color",
      key: "color",
      align: "start",
      width: "10%",
      render: (_, { productDetails }) => {
        const colors: IColorResponse[] = Object.values(
          productDetails.reduce((uniqueColorMap: any, productDetail) => {
            const colorCode = productDetail.color.code;
            if (!uniqueColorMap[colorCode]) {
              uniqueColorMap[colorCode] = productDetail.color;
            }
            return uniqueColorMap;
          }, {})
        );

        colors.sort((a, b) => a.name.localeCompare(b.name));

        return (
          <Space wrap direction="horizontal" align="start">
            {colors.length > 0 ? (
              <>
                {colors.map((color, index) => (
                  <ColorPicker
                    size="small"
                    value={color.code}
                    disabled
                    key={color.id}
                  />
                ))}
              </>
            ) : (
              <Text>N/A</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: t("products.fields.size"),
      dataIndex: "size",
      key: "size",
      align: "start",
      width: "10%",
      render: (_, { productDetails }) => {
        const sizes: IProdAttributeResponse[] = Object.values(
          productDetails.reduce((uniqueSizeMap: any, productDetail) => {
            const sizeId = productDetail.size.id;
            if (!uniqueSizeMap[sizeId]) {
              uniqueSizeMap[sizeId] = productDetail.size;
            }
            return uniqueSizeMap;
          }, {})
        );

        sizes.sort((a, b) => a.name.localeCompare(b.name));

        return (
          <Space wrap direction="horizontal" align="start">
            {sizes.length > 0 && (
              <>
                {sizes.map((size, index) => (
                  <Tag key={index}>{size.name}</Tag>
                ))}
              </>
            )}
          </Space>
        );
      },
    },
    {
      title: t("products.fields.price"),
      dataIndex: "price",
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("price", sorters),
      key: "price",
      align: "start",
      render: (_, { productDetails }) => {
        const prices = productDetails.map((detail) => detail.price);
        const lowestPrice = Math.min(...prices);

        return (
          <Text>
            {prices.length > 0 ? (
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                value={lowestPrice}
                locale={"vi"}
              />
            ) : (
              "N/A"
            )}
          </Text>
        );
      },
    },
    {
      title: t("products.fields.quantity"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("quantity", sorters),
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      render: (text, record) => {
        const totalQuantity = record.productDetails.reduce(
          (total, productDetail) => {
            return total + productDetail.quantity;
          },
          0
        );
        return <Text>{totalQuantity}</Text>;
      },
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <ColumnActions
          record={record}
          onEditClick={() => editModalShow(record.id)}
          onDeleteClick={() => handleDelete(record.id)}
        />
      ),
    },
  ];

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "products",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
  }
  return (
    <List>
      <Row gutter={[8, 12]} align="middle" justify="center">
        <Col span={24}>
          <Card>
            <ProductSearchForm formProps={searchFormProps} />
          </Card>
        </Col>
        <Col span={24}>
          <Table
            {...tableProps}
            pagination={{
              ...tableProps.pagination,
              ...tablePaginationSettings,
            }}
            rowKey="id"
            columns={columns}
          />
        </Col>
      </Row>
      <EditProduct
        onFinish={editOnFinish}
        id={editId}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
