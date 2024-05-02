import { CheckSquareOutlined } from "@ant-design/icons";
import { Show, useModalForm, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useApiUrl,
  useCustomMutation,
  useParsed,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Badge,
  Button,
  Card,
  ColorPicker,
  InputNumber,
  Table,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { ProductSearchForm } from "../../../components/product/ProductSearchForm";
import { ProductStatus } from "../../../components/product/ProductStatus";
import ColumnActions from "../../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../../constants/tablePaginationConfig";
import { showWarningConfirmDialog } from "../../../helpers/confirm";
import { productDetailToRequest } from "../../../helpers/mapper";
import {
  IProductDetailFilterVariables,
  IProductDetailRequest,
  IProductDetailResponse,
} from "../../../interfaces";
import { EditProdDetail } from "../../../components/product/EditProdDetail";

const { Text } = Typography;

export const ProductShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { id } = useParsed();
  const API_URL = useApiUrl();

  const { mutate: mutateUpdateMany, isLoading } =
    useCustomMutation<IProductDetailResponse>();

  /**
   * State lưu trữ product-details.
   * Thay vì lấy thằng từ datasource, cần lưu thêm vào state vì cần hiển thị thêm cả những thay đổi của người dùng.
   * @type {IProductDetailResponse[]}
   */
  const [productDetails, setProductDetails] = useState<
    IProductDetailResponse[]
  >([]);

  /**
   * State lưu trữ product-details cần chỉnh sửa.
   * Thay vì gửi toàn bộ cho backend, lưu những thay đổi của người dùng vào state và chỉ gửi chúng đi.
   * @type {IProductDetailResponse[]}
   */
  const [productDetailsSave, setProductDetailsSave] = useState<
    IProductDetailResponse[]
  >([]);

  useEffect(() => {
    if (productDetailsSave) {
      console.log("productDetailsSave", productDetailsSave);
    }
  }, [productDetailsSave]);

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    onFinish: editOnFinish,
    close,
  } = useModalForm<IProductDetailResponse>({
    action: "edit",
    onMutationSuccess(data, variables, context, isAutoSave) {
      close();
    },
    warnWhenUnsavedChanges: false,
    resource: "product-details",
  });

  const {
    tableProps,
    searchFormProps,
    current,
    pageSize,
    tableQueryResult: { data },
  } = useTable<
    IProductDetailResponse,
    HttpError,
    IProductDetailFilterVariables
  >({
    resource: `product-details`,
    sorters: {
      mode: "off",
    },
    filters: {
      permanent: [
        {
          field: "products",
          operator: "eq",
          value: id,
        },
      ],
    },
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

  useEffect(() => {
    if (data) {
      setProductDetails(data.data);
    }
  }, [data]);
  useEffect(() => {
    if (tableProps && tableProps.dataSource) {
      const fetchedProductDetails: IProductDetailResponse[] = [
        ...tableProps.dataSource,
      ];
      setProductDetails(fetchedProductDetails);
    }
  }, [tableProps.dataSource]);

  const updateProductDetailsSaveQuantity = (
    records: IProductDetailResponse[],
    value: number
  ) => {
    const updatedDetails = [...productDetailsSave];

    records.forEach((record) => {
      const existingIndex = productDetailsSave.findIndex(
        (productDetail) => productDetail.id === record.id
      );
      if (existingIndex !== -1) {
        updatedDetails[existingIndex].quantity = value;
      } else {
        updatedDetails.push({ ...record, quantity: value });
      }
    });

    setProductDetailsSave(updatedDetails);
  };

  const updateProductDetailsQuantity = (index: number, value: number) => {
    const updatedProducts = [...productDetails];
    updatedProducts[index] = { ...updatedProducts[index], quantity: value };
    setProductDetails(updatedProducts);
  };

  const handleQuantityChange = (
    value: number,
    record: IProductDetailResponse
  ) => {
    if (hasSelected) {
      const updatedProductDetails = productDetails.map((productDetail) => {
        if (
          selectedRowKeys.includes(productDetail.id) ||
          productDetail.id === record.id
        ) {
          return {
            ...productDetail,
            quantity: value,
          };
        }
        return productDetail;
      });

      setProductDetails(updatedProductDetails);

      const updatedProductDetailsFiltered = updatedProductDetails.filter(
        (productDetail) =>
          selectedRowKeys.includes(productDetail.id) ||
          productDetail.id === record.id
      );

      updateProductDetailsSaveQuantity(updatedProductDetailsFiltered, value);
    } else {
      const index = productDetails.findIndex(
        (productDetail) => productDetail.id === record.id
      );

      updateProductDetailsSaveQuantity([record], value);

      updateProductDetailsQuantity(index, value);
    }
  };

  const updateProductDetailsSavePrice = (
    records: IProductDetailResponse[],
    value: number
  ) => {
    const updatedDetails = [...productDetailsSave];

    records.forEach((record) => {
      const existingIndex = productDetailsSave.findIndex(
        (productDetail) => productDetail.id === record.id
      );
      if (existingIndex !== -1) {
        updatedDetails[existingIndex].price = value;
      } else {
        updatedDetails.push({ ...record, price: value });
      }
    });

    setProductDetailsSave(updatedDetails);
  };

  const updateProductDetailsPrice = (index: number, value: number) => {
    const updatedProducts = [...productDetails];
    updatedProducts[index] = { ...updatedProducts[index], price: value };
    setProductDetails(updatedProducts);
  };

  const handlePriceChange = debounce(
    (value: number, record: IProductDetailResponse) => {
      if (hasSelected) {
        const updatedProductDetails = productDetails.map((productDetail) => {
          if (
            selectedRowKeys.includes(productDetail.id) ||
            productDetail.id === record.id
          ) {
            return {
              ...productDetail,
              price: value,
            };
          }
          return productDetail;
        });
        setProductDetails(updatedProductDetails);

        const updatedProductDetailsFiltered = updatedProductDetails.filter(
          (productDetail) =>
            selectedRowKeys.includes(productDetail.id) ||
            productDetail.id === record.id
        );

        updateProductDetailsSavePrice(updatedProductDetailsFiltered, value);
      } else {
        const index = productDetails.findIndex(
          (productDetail) => productDetail.id === record.id
        );

        updateProductDetailsSavePrice([record], value);

        updateProductDetailsPrice(index, value);
      }
    },
    500
  );

  const [selectedRows, setSelectedRows] = useState<IProductDetailResponse[]>(
    []
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: IProductDetailResponse[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const rowSelection = {
    preserveSelectedRowKeys: true,
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRows.length > 0;

  const columns: ColumnsType<IProductDetailResponse> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => {
        const pageIndex = (current ?? 1) - 1;
        const calculatedIndex = pageIndex * pageSize + (index ?? 0) + 1;
        return calculatedIndex;
      },
    },
    {
      title: t("productDetails.fields.image"),
      dataIndex: "image",
      key: "image",
      render: (_, { image, promotionProductDetails }) => {
        const promotionProductDetailsActive = (
          promotionProductDetails ?? []
        ).filter((productDetail) => productDetail.promotion.status == "ACTIVE");

        const maxPromotionProductDetail = promotionProductDetailsActive.reduce(
          (maxProduct, currentProduct) => {
            return currentProduct.promotion.value > maxProduct.promotion.value
              ? currentProduct
              : maxProduct;
          },
          promotionProductDetailsActive[0]
        );

        if (promotionProductDetailsActive.length > 0) {
          const value = maxPromotionProductDetail.promotion.value;
          return (
            <Badge.Ribbon text={`${value} %`} color="red">
              <Avatar shape="square" size={74} src={image} />
            </Badge.Ribbon>
          );
        } else {
          return <Avatar shape="square" size={74} src={image} />;
        }
      },
    },
    {
      title: t("productDetails.fields.name"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.product.name.localeCompare(b.product.name),
      render: (_, { product, size, color }) => (
        <Text style={{ wordBreak: "inherit" }}>
          {product.name} [{size.name} - {color.name}]
        </Text>
      ),
    },
    {
      title: t("productDetails.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (_, record) => (
        <InputNumber
          min={1}
          width={100}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value as number, record)}
          className="w-100"
        />
      ),
    },
    {
      title: t("productDetails.fields.price"),
      key: "price",
      dataIndex: "price",
      align: "center",
      sorter: (a, b) => a.price - b.price,
      render: (_, record) => (
        <InputNumber
          min={1}
          formatter={(value) =>
            `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value: string | undefined) => {
            const parsedValue = parseInt(value!.replace(/₫\s?|(,*)/g, ""), 10);
            return isNaN(parsedValue) ? 0 : parsedValue;
          }}
          value={record.price}
          onChange={(value) => handlePriceChange(value as number, record)}
          className="w-100"
        />
      ),
    },
    {
      title: t("productDetails.fields.size"),
      key: "size",
      dataIndex: "size",
      align: "center",
      sorter: (a, b) => a.size.name.localeCompare(b.size.name),
      render: (_, record) => <Text className="w-100">{record.size.name}</Text>,
    },
    {
      title: t("productDetails.fields.color"),
      key: "color",
      dataIndex: "color",
      align: "center",
      sorter: (a, b) => a.color.name.localeCompare(b.color.name),
      render: (_, record) => (
        <ColorPicker value={record.color.code} showText disabled />
      ),
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      align: "center",
      render: (_, record) => (
        <ColumnActions
          hideShow
          record={record}
          onEditClick={() => editModalShow(record.id)}
        />
      ),
    },
  ];

  const handleSubmit = async () => {
    const convertedPayload: IProductDetailRequest[] =
      productDetailToRequest(productDetailsSave);

    mutateUpdateMany(
      {
        url: `${API_URL}/product-details`,
        method: "put",
        values: convertedPayload,
        successNotification: () => {
          return {
            message: `Cập nhật thành công ${convertedPayload.length} sản phẩm chi tiết.`,
            description: "Thành công",
            type: "success",
          };
        },
        errorNotification: (error) => {
          return {
            message: t("common.error") + error?.message,
            description: "Oops...",
            type: "error",
          };
        },
      },
      {
        onSuccess: (data, variables, context) => {
          setProductDetailsSave([]);
          setSelectedRowKeys([]);
          setSelectedRows([]);
        },
      }
    );
  };

  return (
    <Show
      title={t("productDetails.productDetails")}
      canEdit={false}
      contentProps={{
        style: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Card>
        <ProductSearchForm formProps={searchFormProps} />
      </Card>
      <Card
        extra={
          <Button
            loading={isLoading}
            type="primary"
            icon={<CheckSquareOutlined />}
            onClick={() => {
              showWarningConfirmDialog({
                options: {
                  accept: handleSubmit,
                  reject: () => {},
                },
                t: t,
              });
            }}
          >
            {t("actions.submit")}
          </Button>
        }
        title={t("productDetails.list")}
        style={{ marginTop: "0.5rem" }}
      >
        <Table
          {...tableProps}
          pagination={{
            ...tableProps.pagination,
            ...tablePaginationSettings,
          }}
          rowSelection={rowSelection}
          loading={tableProps.loading}
          dataSource={productDetails}
          rowKey="id"
          columns={columns}
        />
      </Card>
      <EditProdDetail
        onFinish={editOnFinish}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </Show>
  );
};
