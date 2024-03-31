import { CreateButton, useModalForm, useSelect } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import { Col, Row, Select, Typography } from "antd";
import { IProdAttributeResponse, IUserSelected } from "../../interfaces";
import { CreateProdAttribute } from "./CreateProdAttribute";
import { Dispatch, SetStateAction } from "react";

const { Text } = Typography;

type ProdAttributeSelectProps = {
  attributeName: string;
  setUserSelected: Dispatch<SetStateAction<IUserSelected>>;
};

export const ProdAttributeSelect: React.FC<ProdAttributeSelectProps> = ({
  attributeName,
  setUserSelected,
}) => {
  const t = useTranslate();

  const {
    selectProps,
    queryResult: { refetch },
  } = useSelect<IProdAttributeResponse>({
    resource: `${attributeName}?pageSize=1000&`,
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { modalProps, formProps, show, onFinish } =
    useModalForm<IProdAttributeResponse>({
      resource: attributeName,
      onMutationSuccess: () => {
        refetch();
        formProps.form?.resetFields();
      },
      redirect: false,
      action: "create",
      warnWhenUnsavedChanges: true,
    });

  return (
    <Col span={12}>
      <Row gutter={[16, 0]} align="middle">
        <Col span={4}>
          <Text className="h6 m-0 text-truncate" strong>
            {t(`userSelect.product.${attributeName}`)}
          </Text>
        </Col>
        <Col span={18}>
          <Select
            {...selectProps}
            placeholder={t(`search.placeholder.${attributeName}`)}
            style={{ width: "100%" }}
            onChange={(_, option: any) => {
              setUserSelected((prevUserSelected) => ({
                ...prevUserSelected,
                [attributeObject[attributeName]]: {
                  id: option.value,
                  name: option.label,
                  status: "ACTIVE",
                },
              }));
            }}
          />
        </Col>
        <Col span={2}>
          <CreateButton
            hideText
            type="default"
            onClick={() => {
              show();
            }}
          />
        </Col>
      </Row>
      <CreateProdAttribute
        modalProps={modalProps}
        formProps={formProps}
        onFinish={onFinish}
        resourceName={attributeName}
      />
    </Col>
  );
};

const attributeObject: Record<string, string> = {
  brands: "brand",
  soles: "sole",
  "trade-marks": "tradeMark",
  materials: "material",
  styles: "style",
  sizes: "size",
};
