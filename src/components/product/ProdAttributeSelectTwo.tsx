import { useSelect } from "@refinedev/antd";
import { Form, Select } from "antd";
import { IProdAttributeResponse } from "../../interfaces";
import { useTranslate } from "@refinedev/core";

type ProdAttributeSelectTwoProps = {
  attributeName: string;
  optionLabel?: keyof IProdAttributeResponse | undefined;
  optionValue?: keyof IProdAttributeResponse | undefined;
};

export const ProdAttributeSelectTwo: React.FC<ProdAttributeSelectTwoProps> = ({
  attributeName,
  optionLabel = "name",
  optionValue = "id",
}) => {
  const t = useTranslate();

  const {
    selectProps,
    queryResult: { refetch },
  } = useSelect<IProdAttributeResponse>({
    resource: `${attributeName}s?pageSize=1000&`,
    optionLabel,
    optionValue,
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  if (attributeName === "trade-mark") attributeName = "tradeMark";

  return (
    <Form.Item
      label={t(`productDetails.fields.${attributeName}`)}
      name={[`${attributeName}`, "id"]}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Select {...selectProps} />
    </Form.Item>
  );
};
