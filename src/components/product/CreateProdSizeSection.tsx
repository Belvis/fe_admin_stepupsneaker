import {
  CreateButton,
  useModal,
  useModalForm,
  useSimpleList,
} from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  App,
  Col,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { Dispatch, SetStateAction } from "react";
import {
  IColorResponse,
  IProdAttributeResponse,
  IProductDetailResponse,
  IUserSelected,
} from "../../interfaces";
import { CreateProdAttribute } from "./CreateProdAttribute";
import { StyledCheckableTag } from "./styled";

const { Title, Text } = Typography;

type CreateProdSizeSectionProps = {
  userSelected: IUserSelected;
  setUserSelected: Dispatch<SetStateAction<IUserSelected>>;
  productDetails: IProductDetailResponse[];
  setProductDetails: Dispatch<SetStateAction<IProductDetailResponse[]>>;
};

export const CreateProdSizeSection: React.FC<CreateProdSizeSectionProps> = ({
  userSelected,
  setUserSelected,
  productDetails,
  setProductDetails,
}) => {
  const t = useTranslate();
  const { message } = App.useApp();

  const { show, close, modalProps } = useModal();

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IColorResponse>({
    resource: "sizes",
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const { listProps } = useSimpleList<IColorResponse>({
    resource: "sizes",
    pagination: {
      pageSize: 15,
    },
    syncWithLocation: false,
  });

  const handleSizeChange = (size: IProdAttributeResponse, checked: boolean) => {
    setUserSelected((prevUserSelected) => {
      let nextSize;
      if (Array.isArray(prevUserSelected.size)) {
        nextSize = checked
          ? [...prevUserSelected.size, size]
          : prevUserSelected.size.filter((c) => c !== size);
      } else {
        nextSize = checked ? [size] : [];
      }

      return { ...prevUserSelected, size: nextSize };
    });
  };

  const handleSizeClose = (size: IProdAttributeResponse) => {
    setUserSelected((prevUserSelected) => {
      if (prevUserSelected.size) {
        const updatedSizes = prevUserSelected.size.filter((s) => s !== size);
        return { ...prevUserSelected, size: updatedSizes };
      }
      return prevUserSelected;
    });

    setProductDetails((prevProductDetails) => {
      const updatedProductDetails = prevProductDetails.filter(
        (detail) => detail.size !== size
      );
      return updatedProductDetails;
    });
  };

  return (
    <Col span={24}>
      <Row gutter={[16, 0]}>
        <Col span={4}>
          <Title level={4}>{t("userSelect.product.sizes")}</Title>
        </Col>
        <Col span={2}>
          <CreateButton
            hideText
            type="default"
            onClick={() => {
              const isValid = Object.entries(userSelected).every(
                ([key, value]) => {
                  if (key === "size") {
                    return true;
                  }
                  return value !== "" && value !== undefined;
                }
              );

              if (!isValid) {
                message.info(t("products.messages.selectProductFirst"));
                return;
              }
              show();
            }}
          />
        </Col>
        <Col span={18}>
          {userSelected.size && userSelected.size.length > 0 && (
            <>
              {userSelected.size.map((size, index) => (
                <Tag
                  closable
                  key={index}
                  style={{ padding: "5px 10px" }}
                  onClose={(e) => {
                    e.preventDefault();
                    handleSizeClose(size);
                  }}
                >
                  {size.name}
                </Tag>
              ))}
            </>
          )}
        </Col>
        <Modal
          title={
            <Space size="large">
              <Text className="h6 m-0">{t("sizes.titles.choose")}</Text>
              <CreateButton
                type="default"
                onClick={() => {
                  createModalShow();
                }}
              />
            </Space>
          }
          {...modalProps}
          footer={<></>}
        >
          <AntdList
            className="mt-4"
            grid={{ gutter: 16, column: 3 }}
            {...listProps}
            pagination={{
              ...listProps.pagination,
              position: "bottom",
              align: "center",
            }}
            renderItem={(item) => (
              <AntdList.Item>
                <StyledCheckableTag
                  colorcode="c1c1c1"
                  key={item.id}
                  checked={userSelected.size?.includes(item) ?? false}
                  onChange={(checked) => handleSizeChange(item, checked)}
                >
                  {item.name}
                </StyledCheckableTag>
              </AntdList.Item>
            )}
          />
        </Modal>
      </Row>
      <CreateProdAttribute
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
        resourceName="sizes"
      />
    </Col>
  );
};
