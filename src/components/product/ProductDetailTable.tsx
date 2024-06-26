import { CheckSquareOutlined, PlusOutlined } from "@ant-design/icons";
import { useCreateMany, useNavigation, useTranslate } from "@refinedev/core";
import {
  App,
  Button,
  Card,
  Flex,
  InputNumber,
  Modal,
  Space,
  Table,
  TablePaginationConfig,
  Typography,
  Upload,
  UploadFile,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { RcFile } from "antd/es/upload";
import { debounce } from "lodash";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { getBase64 } from "../../helpers/image";
import { productDetailToRequest } from "../../helpers/mapper";
import { getRandomId } from "../../helpers/random";
import {
  IProductDetailRequest,
  IProductDetailResponse,
  IUserSelected,
} from "../../interfaces";
import ColumnActions from "../table/ColumnActions";
import _ from "lodash";

const { Text } = Typography;

interface IColorFileLists {
  [colorCode: string]: UploadFile[];
}

type ProductDetailTableProps = {
  userSelected: IUserSelected;
  productDetails: IProductDetailResponse[];
  setProductDetails: Dispatch<SetStateAction<IProductDetailResponse[]>>;
};

export const ProductDetailTable: React.FC<ProductDetailTableProps> = ({
  userSelected,
  productDetails,
  setProductDetails,
}) => {
  const t = useTranslate();
  const { mutate, isLoading } = useCreateMany();
  const { list } = useNavigation();

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showQuickJumper: true,
    showSizeChanger: true,
  });

  const [fileLists, setFileLists] = useState<IColorFileLists>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const { message } = App.useApp();

  const handleSubmit = async () => {
    const convertedPayload: IProductDetailRequest[] =
      productDetailToRequest(productDetails);
    try {
      mutate(
        {
          resource: "product-details",
          values: convertedPayload,
        },
        {
          onSuccess: () => {
            list("products");
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
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
    } else {
      const index = productDetails.findIndex(
        (productDetail) => productDetail.id === record.id
      );
      const updatedProductDetails = [...productDetails];
      updatedProductDetails[index] = {
        ...updatedProductDetails[index],
        quantity: value,
      };
      setProductDetails(updatedProductDetails);
    }
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
      } else {
        const index = productDetails.findIndex(
          (productDetail) => productDetail.id === record.id
        );
        const updatedProductDetails = [...productDetails];
        updatedProductDetails[index] = {
          ...updatedProductDetails[index],
          price: value,
        };
        setProductDetails(updatedProductDetails);
      }
    },
    500
  );

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const handleCancel = () => setPreviewOpen(false);
  const handleDelete = (id: string) => {
    const updatedProductDetails = productDetails.filter(
      (productDetail) => productDetail.id !== id
    );
    setProductDetails(updatedProductDetails);
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error(t("image.error.invalid"));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(t("image.error.exceed"));
    }
    return isJpgOrPng && isLt2M;
  };

  useEffect(() => {
    const keys = Object.keys(fileLists);
    const productDetailsCopy = productDetails;
    for (const key of keys) {
      const productDetailFilterColors = productDetails.filter(
        (productDetail) => productDetail.color.code === key
      );
      for (let index = 0; index < productDetailFilterColors.length; index++) {
        const productDetail = productDetailFilterColors[index];

        const productDetailFind = productDetailsCopy.find(
          (pd) => pd.id === productDetail.id
        );
        if (productDetailFind) {
          try {
            getBase64(fileLists[key][index].originFileObj as RcFile).then(
              (base64String) => {
                productDetailFind.image = base64String;
              }
            );
          } catch (error) {
            productDetailFind.image = "";
          }
        }
      }
    }

    setProductDetails(productDetailsCopy);
  }, [fileLists]);

  useEffect(() => {
    if (userSelected && userSelected.color && userSelected.size) {
      const isValid = Object.values(userSelected).every(
        (value) => value !== "" && value !== undefined
      );
      if (isValid) {
        setProductDetails((prevProductDetails) => {
          const updatedProductDetails = [...prevProductDetails];
          for (let i = 0; i < userSelected.color!.length; i++) {
            const color = userSelected.color![i];
            for (let j = 0; j < userSelected.size!.length; j++) {
              const size = userSelected.size![j];
              const index = i * userSelected.size!.length + j;
              if (updatedProductDetails[index]) {
                const {
                  id,
                  product,
                  tradeMark,
                  style,
                  material,
                  brand,
                  sole,
                  image,
                  price,
                  quantity,
                  status,
                  saleCount,
                } = updatedProductDetails[index];
                updatedProductDetails[index] = {
                  id,
                  product,
                  tradeMark,
                  style,
                  size,
                  material,
                  color,
                  brand,
                  sole,
                  image,
                  price,
                  quantity,
                  status,
                  saleCount,
                };
              } else {
                updatedProductDetails[index] = {
                  id: getRandomId(10),
                  product: userSelected.product!,
                  tradeMark: userSelected.tradeMark!,
                  style: userSelected.style!,
                  size: size,
                  material: userSelected.material!,
                  color: color,
                  brand: userSelected.brand!,
                  sole: userSelected.sole!,
                  image: "",
                  price: 0,
                  quantity: 0,
                  saleCount: 0,
                  status: "ACTIVE",
                };
              }
            }
          }
          return updatedProductDetails;
        });
      }
    }
  }, [userSelected.color, userSelected.size]);

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
        const pageIndex = (pagination?.current ?? 1) - 1;
        const pageSize = pagination?.pageSize ?? 10;
        const calculatedIndex = pageIndex * pageSize + (index ?? 0) + 1;
        return calculatedIndex;
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
      width: "20%",
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (_, record) => (
        <InputNumber
          min={1}
          width={100}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value as number, record)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: t("productDetails.fields.price"),
      key: "price",
      dataIndex: "price",
      width: "20%",
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
          style={{ width: "100%" }}
        />
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
          hideEdit
          hideShow
          record={record}
          onDeleteClick={() => handleDelete(record.id)}
        />
      ),
    },
    {
      title: t("productDetails.fields.image"),
      dataIndex: "image",
      key: "image",
      width: "30%",
      colSpan: 2,
      render: (image, record, index) => {
        const { current = 1, pageSize = 10 } = pagination;
        const color = record.color;
        const fileList = fileLists[color.code] || [];
        const colorOccurCount = productDetails.filter(
          (data) => data.color === color
        ).length;

        const currentRowIndex = (current - 1) * pageSize + index;
        const groupIndex = productDetails.findIndex(
          (data) => data.color === color
        );

        const obj = {
          children: (
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              beforeUpload={beforeUpload}
              maxCount={colorOccurCount}
              onChange={({ fileList: newFileList }) => {
                setFileLists((prevFileLists) => ({
                  ...prevFileLists,
                  [color.code]: newFileList,
                }));
              }}
              customRequest={({ onSuccess, onError, file }) => {
                if (onSuccess) {
                  try {
                    onSuccess("ok");
                  } catch (error) {
                    console.error(error);
                  }
                }
              }}
              multiple
              style={{
                border: "none",
                width: "100%",
                background: "none",
              }}
            >
              {fileList.length >= colorOccurCount ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          ),
          props: {
            rowSpan: 0,
          },
        };
        if (groupIndex === currentRowIndex) {
          obj.props.rowSpan = colorOccurCount;
        }
        return obj;
      },
    },
  ];

  return (
    <Card
      style={{ marginTop: "0.1rem" }}
      styles={{
        extra: {
          margin: 0,
          width: "100%",
        },
      }}
      extra={
        <div className="d-flex justify-content-between">
          <Space className="text-start w-100">
            <Text strong>{t("productDetails.list")}</Text>
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
            type="primary"
            icon={<CheckSquareOutlined />}
            loading={isLoading}
            onClick={() => {
              const isValid = Object.values(userSelected).every(
                (value) => value !== "" && value !== undefined
              );

              const hasZeroQuantityOrPrice = productDetails.some(
                (detail) => detail.quantity === 0 || detail.price === 0
              );

              if (
                !isValid ||
                !productDetails ||
                hasZeroQuantityOrPrice ||
                productDetails.length === 0
              ) {
                message.info(t("products.messages.invalid"));
                return;
              }

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
        </div>
      }
    >
      <Table
        pagination={{
          ...pagination,
          ...tablePaginationSettings,
        }}
        rowSelection={rowSelection}
        dataSource={productDetails}
        rowKey="id"
        columns={columns}
        onChange={(pagination) => setPagination(pagination)}
      />
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img className="w-100" alt="image-preview" src={previewImage} />
      </Modal>
    </Card>
  );
};
