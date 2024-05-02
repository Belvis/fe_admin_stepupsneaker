import { getDefaultSortOrder, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  useCreate,
  useDelete,
  useParsed,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  ColorPicker,
  Flex,
  Space,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import {
  IProductDetailFilterVariables,
  IProductDetailResponse,
} from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import CommonSearchForm from "../form/CommonSearchForm";

const { Title, Text } = Typography;

type PromotionProductProps = {
  type: "ineligible" | "eligible";
  shouldRefetch: boolean;
  setShouldRefetch: Dispatch<SetStateAction<boolean>>;
};

const PromotionProduct: React.FC<PromotionProductProps> = ({
  type,
  shouldRefetch,
  setShouldRefetch,
}) => {
  const t = useTranslate();
  const { id } = useParsed();

  const { mutate: mutateCreate } = useCreate();
  const { mutate: mutateDelete } = useDelete();

  const {
    tableProps,
    searchFormProps,
    sorters,
    current,
    pageSize,
    tableQueryResult: { refetch },
  } = useTable<
    IProductDetailResponse,
    HttpError,
    IProductDetailFilterVariables
  >({
    resource: "product-details",
    pagination: {
      pageSize: 5,
    },
    filters: {
      permanent: [
        {
          field: "isInPromotion",
          operator: "eq",
          value: type === "eligible" ? 1 : 0,
        },
        {
          field: "promotion",
          operator: "eq",
          value: id,
        },
      ],
    },
    syncWithLocation: false,
    onSearch: ({ q }) => {
      const filters: CrudFilters = [];

      filters.push({
        field: "q",
        operator: "eq",
        value: q ? q.trim() : undefined,
      });

      return filters;
    },
  });

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

  const columns = useMemo<ColumnsType<IProductDetailResponse>>(
    () => [
      {
        title: "#",
        key: "index",
        dataIndex: "createdAt",
        align: "center",
        width: "1px",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
        render: (value, record, index) =>
          calculateIndex(sorters, current, pageSize, tableProps, index),
      },
      {
        title: t("productDetails.fields.image"),
        dataIndex: "image",
        key: "image",
        render: (_, { image }) => (
          <Avatar shape="square" size={74} src={image} />
        ),
      },
      {
        title: t("productDetails.fields.name"),
        dataIndex: "name",
        key: "name",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("name", sorters),
        render: (_, { product, size, color }) => (
          <Text style={{ wordBreak: "inherit" }}>
            {product.name} [{size.name} - {color.name}]
          </Text>
        ),
      },
      {
        title: t("productDetails.fields.size"),
        key: "size",
        dataIndex: "size",
        align: "center",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("size", sorters),
        render: (_, record) => (
          <Text style={{ width: "100%" }}>{record.size.name}</Text>
        ),
      },
      {
        title: t("productDetails.fields.color"),
        key: "color",
        dataIndex: "color",
        align: "center",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("color", sorters),
        render: (_, record) => (
          <ColorPicker defaultValue={record.color.code} showText disabled />
        ),
      },
    ],
    [t, sorters, current, pageSize, tableProps]
  );

  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedIds(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const hasSelected = selectedIds.length > 0;

  function handleCreate() {
    try {
      mutateCreate(
        {
          resource: "promotion-product-details",
          values: {
            promotion: id,
            productDetails: selectedIds,
          },
        },
        {
          onSuccess: () => {
            refetch();
            setShouldRefetch(true);
            setSelectedIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  }

  function handleDelete() {
    if (id) {
      try {
        mutateDelete(
          {
            resource: "promotion-product-details",
            values: {
              productDetails: selectedIds,
            },
            id: id,
          },
          {
            onSuccess: () => {
              refetch();
              setShouldRefetch(true);
              setSelectedIds([]);
            },
          }
        );
      } catch (error) {
        console.error("Deletion failed", error);
      }
    }
  }

  const handleButtonClick = () => {
    showWarningConfirmDialog({
      options: {
        accept: () => (type === "eligible" ? handleDelete() : handleCreate()),
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Fragment>
      <CommonSearchForm
        title={t("promotions.filters.title")}
        formProps={searchFormProps}
        fields={[
          {
            label: "",
            name: "q",
            type: "input",
            placeholder: "Tìm kiếm theo từ khoá",
            width: "400px",
          },
        ]}
        columnRatio={[3, 16, 5]}
      />
      <Table
        className="mt-3"
        rowSelection={rowSelection}
        bordered
        {...tableProps}
        title={() => {
          return (
            <Flex justify={"space-between"} align={"center"}>
              <Title level={5}>
                {t(`vouchers.table.title.${type}`)} (
                {tableProps.dataSource?.length})
              </Title>
              {hasSelected && (
                <Space>
                  <Button
                    type="primary"
                    loading={tableProps.loading}
                    onClick={handleButtonClick}
                  >
                    {t(`actions.${type === "eligible" ? "remove" : "apply"}`)}
                  </Button>
                  <span style={{ marginLeft: 8 }}>
                    {t("common.rowSelection", { count: selectedIds.length })}
                  </span>
                </Space>
              )}
            </Flex>
          );
        }}
        pagination={{
          ...tableProps.pagination,
          ...tablePaginationSettings,
        }}
        rowKey="id"
        columns={columns}
      />
    </Fragment>
  );
};

export default PromotionProduct;
