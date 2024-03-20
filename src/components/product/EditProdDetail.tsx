import { useSelect } from "@refinedev/antd";
import { useParsed, useTranslate } from "@refinedev/core";
import {
  Col,
  Form,
  FormProps,
  Grid,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Row,
  Select,
} from "antd";
import { useEffect } from "react";
import { getProductStatusOptions } from "../../constants/status";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { productDetailToRequest } from "../../helpers/mapper";
import { validateCommon } from "../../helpers/validate";
import {
  IColorResponse,
  IProductDetailRequest,
  IProductDetailResponse,
} from "../../interfaces";
import ImageUpload from "../form/ImageUpload";
import { ProdAttributeSelectTwo } from "./ProdAttributeSelectTwo";
import { renderColor } from "./ProductSearchForm";

type EditProdDetailProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const EditProdDetail: React.FC<EditProdDetailProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { selectProps: colorSelectProps } = useSelect<IColorResponse>({
    resource: "colors?pageSize=10&",
    optionLabel: "code",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const onFinishHandler = (values: IProductDetailResponse) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          console.log("values", values);

          const convertedPayload: IProductDetailRequest[] =
            productDetailToRequest([values]);
          onFinish(convertedPayload[0]);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={8}>
            <ImageUpload formProps={formProps} />
          </Col>
          <Col span={16}>
            <ProdAttributeSelectTwo attributeName="brand" />
            <ProdAttributeSelectTwo attributeName="style" />
            <ProdAttributeSelectTwo attributeName="material" />
            <ProdAttributeSelectTwo attributeName="trade-mark" />
            <ProdAttributeSelectTwo attributeName="sole" />
            <ProdAttributeSelectTwo attributeName="size" />
            <Form.Item
              label={t("productDetails.fields.color")}
              name={["color", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                {...colorSelectProps}
                options={colorSelectProps.options?.map((item) =>
                  renderColor(item.value as string, item.label as string)
                )}
              />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.price")}
              name="price"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "price"),
                },
              ]}
            >
              <InputNumber
                min={1}
                formatter={(value) =>
                  `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: string | undefined) => {
                  const parsedValue = parseInt(
                    value!.replace(/₫\s?|(,*)/g, ""),
                    10
                  );
                  return isNaN(parsedValue) ? 0 : parsedValue;
                }}
                className="w-100"
              />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.quantity")}
              name="quantity"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "quantity"),
                },
              ]}
            >
              <InputNumber min={1} width={100} className="w-100" />
            </Form.Item>

            <Form.Item
              label={t("products.fields.status")}
              name="status"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "status"),
                },
              ]}
            >
              <Select options={getProductStatusOptions(t)} />
            </Form.Item>
            <Form.Item name={["product", "id"]} hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
