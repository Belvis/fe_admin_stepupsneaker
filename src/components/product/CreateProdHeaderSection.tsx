import { useList, useTranslate } from "@refinedev/core";
import {
  AutoComplete,
  Avatar,
  Card,
  Col,
  Flex,
  Input,
  Row,
  Typography,
} from "antd";
import ImageUploadTwo from "../form/ImageUploadTwo";
import { debounce } from "lodash";
import { SearchOutlined } from "@ant-design/icons";
import { CreateButton, useModalForm } from "@refinedev/antd";
import TextArea from "antd/es/input/TextArea";
import { IOption, IProductResponse, IUserSelected } from "../../interfaces";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CreateProductModal } from "./CreateProductModal";
import { renderItemProduct } from "./shared";

const { Text, Title } = Typography;

type CreateProdHeaderSectionProps = {
  userSelected: IUserSelected;
  setUserSelected: Dispatch<SetStateAction<IUserSelected>>;
};

export const CreateProdHeaderSection: React.FC<
  CreateProdHeaderSectionProps
> = ({ userSelected, setUserSelected }) => {
  const t = useTranslate();

  const [value, setValue] = useState<string>("");
  const [productOptions, setProductOptions] = useState<IOption[]>([]);

  const { refetch } = useList<IProductResponse>({
    resource: "products",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const productOptions = data.data.map((item) =>
          renderItemProduct(`${item.name} / #${item.code}`, item.image, item)
        );
        if (productOptions.length > 0) {
          setProductOptions(productOptions);
        }
      },
    },
  });

  const { modalProps, formProps, show, onFinish } =
    useModalForm<IProductResponse>({
      onMutationSuccess: () => {
        formProps.form?.resetFields();
        refetch();
      },
      redirect: false,
      action: "create",
      warnWhenUnsavedChanges: true,
    });

  useEffect(() => {
    setProductOptions([]);
    refetch();
  }, [value]);

  const setImageUrl = (imageUrl: string) => {
    setUserSelected((prevUserSelected) => {
      return {
        ...prevUserSelected,
        product: {
          ...prevUserSelected.product,
          image: imageUrl,
        },
      };
    });
  };
  return (
    <Card style={{ marginTop: "1rem" }}>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={8}>
          <ImageUploadTwo
            imageUrl={
              userSelected.product ? userSelected.product.image : undefined
            }
            setImageUrl={setImageUrl}
          />
        </Col>
        <Col span={16}>
          <Row gutter={[16, 24]}>
            <Col xs={0} sm={24}>
              <Flex gap="middle" justify="flex-start" align="center">
                <Text style={{ fontSize: "24px", flexShrink: 0 }}>
                  {t("products.products")}
                </Text>
                <AutoComplete
                  options={productOptions}
                  filterOption={false}
                  onSelect={(_, option: any) => {
                    setUserSelected((prevUserSelected) => ({
                      ...prevUserSelected,
                      product: option.product,
                    }));
                  }}
                  style={{
                    width: "100%",
                    maxWidth: "550px",
                  }}
                  onSearch={debounce((value: string) => setValue(value), 300)}
                >
                  <Input
                    size="large"
                    placeholder={t("search.placeholder.products")}
                    suffix={<SearchOutlined />}
                  />
                </AutoComplete>
                <CreateButton
                  hideText
                  type="default"
                  onClick={() => {
                    show();
                  }}
                />
              </Flex>
            </Col>
            <Col xs={0} sm={24}>
              <Title
                style={{
                  fontSize: "18px",
                }}
              >
                {t("products.fields.description")}
              </Title>
              <TextArea
                value={userSelected.product?.description ?? ""}
                rows={5}
                maxLength={500}
                showCount
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <CreateProductModal
        onFinish={onFinish}
        modalProps={modalProps}
        formProps={formProps}
      />
    </Card>
  );
};
