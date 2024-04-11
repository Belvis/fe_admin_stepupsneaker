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
import { StyledCheckableTag } from "./styled";
import { IColorResponse, IUserSelected } from "../../interfaces";
import { Dispatch, SetStateAction } from "react";
import { CreateColor } from "../../pages/product/color/create";

const { Title, Text } = Typography;

type CreateProdColorSectionProps = {
  userSelected: IUserSelected;
  setUserSelected: Dispatch<SetStateAction<IUserSelected>>;
};

export const CreateProdColorSection: React.FC<CreateProdColorSectionProps> = ({
  userSelected,
  setUserSelected,
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
    resource: "colors",
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
    },
    redirect: false,
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const { listProps } = useSimpleList<IColorResponse>({
    resource: "colors",
    pagination: {
      pageSize: 15,
    },
    syncWithLocation: false,
  });

  const handleColorChange = (color: IColorResponse, checked: boolean) => {
    setUserSelected((prevUserSelected) => {
      let nextColor;
      if (Array.isArray(prevUserSelected.color)) {
        nextColor = checked
          ? [...prevUserSelected.color, color]
          : prevUserSelected.color.filter((c) => c !== color);
      } else {
        nextColor = checked ? [color] : [];
      }

      return { ...prevUserSelected, color: nextColor };
    });
  };

  const handleColorClose = (color: IColorResponse) => {
    setUserSelected((prevUserSelected) => {
      if (prevUserSelected.color) {
        const updatedColors = prevUserSelected.color.filter((c) => c !== color);
        return { ...prevUserSelected, color: updatedColors };
      }
      return prevUserSelected;
    });
  };

  return (
    <Col span={24}>
      <Row gutter={[16, 0]}>
        <Col span={4}>
          <Title level={4}>{t("userSelect.product.colors")}</Title>
        </Col>
        <Col span={2}>
          <CreateButton
            hideText
            type="default"
            onClick={() => {
              const isValid = Object.entries(userSelected).every(
                ([key, value]) => {
                  if (key === "size" || key === "color") {
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
          {userSelected.color && userSelected.color.length > 0 && (
            <>
              {userSelected.color.map((color, index) => (
                <Tag
                  closable
                  key={index}
                  color={"#" + color.code}
                  style={{ padding: "5px 10px" }}
                  onClose={(e) => {
                    e.preventDefault();
                    handleColorClose(color);
                  }}
                />
              ))}
            </>
          )}
        </Col>
        <Modal
          title={
            <Space size="large">
              <Text className="h6 m-0">{t("colors.titles.choose")}</Text>
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
                  colorcode={item.code}
                  key={item.code}
                  checked={userSelected.color?.includes(item) ?? false}
                  onChange={(checked) => handleColorChange(item, checked)}
                >
                  #{item.code.toLocaleUpperCase()}
                </StyledCheckableTag>
              </AntdList.Item>
            )}
          />
        </Modal>
      </Row>
      <CreateColor
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
    </Col>
  );
};
