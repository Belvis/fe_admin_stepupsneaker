import { NumberField } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import {
  App,
  Button,
  Col,
  InputNumber,
  Row,
  Space,
  Table,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import { useContext, useEffect, useMemo, useState } from "react";
import { ReturnFormContext } from "../../contexts/return";
import { IOrderResponse, IReturnFormDetailRequest } from "../../interfaces";
import { MdOutlineQueuePlayNext } from "react-icons/md";

const { Text } = Typography;

export const SelectProduct: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { message } = App.useApp();

  const { setReturnFormDetails, selectedOrder, next } =
    useContext(ReturnFormContext);

  useEffect(() => {
    const generateReturnDetails = (
      order: IOrderResponse | undefined
    ): IReturnFormDetailRequest[] => {
      if (!order) return [];

      return order.orderDetails.map((orderDetail) => ({
        orderDetail: orderDetail.id,
        orderCode: order.code,
        quantity: orderDetail.quantity,
        returnQuantity: 0,
        name: `${orderDetail.productDetail.product.name} | ${orderDetail.productDetail.color.name} - ${orderDetail.productDetail.size.name}`,
        unitPrice: orderDetail.price,
        reason: "",
        feedback: "",
        returnInspectionStatus: undefined,
        returnInspectionReason: "",
        evidence: "",
        resellable: false,
      }));
    };

    setReturnDetails(generateReturnDetails(selectedOrder));
  }, [selectedOrder]);

  const [returnDetails, setReturnDetails] =
    useState<IReturnFormDetailRequest[]>();

  const [selectedRows, setSelectedRows] = useState<IReturnFormDetailRequest[]>(
    []
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: IReturnFormDetailRequest[]
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

  const handleQuantityChange = (
    value: number,
    record: IReturnFormDetailRequest
  ) => {
    if (returnDetails) {
      const index = returnDetails.findIndex(
        (returnDetail) => returnDetail.orderDetail === record.orderDetail
      );

      if (index !== -1) {
        const originalQuantity = returnDetails[index].quantity;

        if (value > originalQuantity) {
          return message.warning(
            t("return-forms.message.invalidReturnQuantity")
          );
        }

        const updatedReturnDetails = [...returnDetails];
        updatedReturnDetails[index] = {
          ...updatedReturnDetails[index],
          returnQuantity: value,
        };
        setReturnDetails(updatedReturnDetails);
      }
    }
  };

  const returnDetailsColumn = useMemo<ColumnsType<IReturnFormDetailRequest>>(
    () => [
      {
        title: "#",
        key: "createdAt",
        dataIndex: "createdAt",
        align: "center",
        sorter: {},
        render: (value, record, index) => index + 1,
      },
      {
        title: t("return-form-details.fields.name"),
        sorter: {},
        key: "name",
        dataIndex: "name",
        align: "center",
      },
      {
        title: t("return-form-details.fields.quantity"),
        sorter: {},
        key: "quantity",
        dataIndex: "quantity",
        align: "center",
      },
      {
        title: t("return-form-details.fields.unitPrice"),
        sorter: {},
        key: "unitPrice",
        dataIndex: "unitPrice",
        align: "center",
        render: (value) => (
          <NumberField
            options={{
              currency: "VND",
              style: "currency",
            }}
            value={value}
            locale={"vi"}
          />
        ),
      },
      {
        title: t("return-form-details.fields.returnQuantity"),
        sorter: {},
        key: "returnQuantity",
        dataIndex: "returnQuantity",
        align: "center",
        render: (_, record, index) => (
          <InputNumber
            min={1}
            value={record.returnQuantity}
            onChange={(value) => handleQuantityChange(value as number, record)}
          />
        ),
      },
    ],
    [t, returnDetails]
  );

  const confirm = () => {
    console.log("selectedRows", selectedRows);

    if (selectedRows.length <= 0 || !returnDetails) {
      return message.warning(t("return-forms.message.emptySelected"));
    }

    const hasZeroReturnQuantity = returnDetails
      .filter((detail) => {
        return selectedRows.some(
          (row) => row.orderDetail === detail.orderDetail
        );
      })
      .some((row) => {
        return row.returnQuantity === 0;
      });

    if (hasZeroReturnQuantity) {
      return message.warning(t("return-forms.message.emptyReturnQuantity"));
    }

    const returnFormDetails = returnDetails.filter((detail) => {
      return selectedRows.some((row) => row.name === detail.name);
    });

    setReturnFormDetails(returnFormDetails);
    next();
  };

  return (
    <Row gutter={[8, 12]}>
      <Col span={24} className="d-flex justify-content-between">
        <Space className="mb-3">
          <Text className="h6 m-0">{t("productDetails.list")}</Text>
          {hasSelected && (
            <span>
              |{" "}
              {t("table.selection", {
                count: selectedRowKeys.length,
              })}
            </span>
          )}
        </Space>
        <Button
          icon={<MdOutlineQueuePlayNext />}
          type="default"
          onClick={() => {
            confirm();
          }}
        >
          {t("buttons.addAndContinue")}
        </Button>
      </Col>
      <Col span={24}>
        <Table
          pagination={false}
          rowKey="orderDetail"
          columns={returnDetailsColumn}
          dataSource={returnDetails}
          rowSelection={rowSelection}
        />
      </Col>
    </Row>
  );
};
