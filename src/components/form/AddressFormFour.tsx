import { useCustom, useCustomMutation, useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  theme,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useContext, useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { LENGTH_DESCRIPTION, LENGTH_PHONE } from "../../constants/common";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import { validateCommon, validatePhoneNumber } from "../../helpers/validate";
import {
  IDistrictResponse,
  IProvinceResponse,
  IWardResponse,
} from "../../interfaces";

const { useToken } = theme;
const { Text } = Typography;
const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID;
const GHN_TOKEN = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

type AddressFormFourProps = {
  form: FormInstance;
};

export const AddressFormFour: React.FC<AddressFormFourProps> = ({ form }) => {
  const t = useTranslate();
  const { token } = useToken();
  const { mutate: calculateFeeMutate } = useCustomMutation<any>();

  const [provinces, setProvinces] = useState<IProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<IDistrictResponse[]>([]);
  const [wards, setWards] = useState<IWardResponse[]>([]);
  const provinceId = Form.useWatch("provinceId", form);
  const districtId = Form.useWatch("districtId", form);

  const { setShippingMoney } = useContext(DeliverySalesContext);

  const { isLoading: isLoadingProvince, refetch: refetchProvince } = useCustom<
    IProvinceResponse[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/province`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setProvinces(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingDistrict, refetch: refetchDistrict } = useCustom<
    IDistrictResponse[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/district`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
      query: {
        province_id: provinceId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setDistricts(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingWard, refetch: refetchWard } = useCustom<
    IWardResponse[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/ward`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
      query: {
        district_id: districtId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setWards(data.response.data);
      },
    },
  });

  useEffect(() => {
    setProvinces([]);
    refetchProvince();
  }, []);

  useEffect(() => {
    if (provinceId) {
      setDistricts([]);
      refetchDistrict();
    }
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      setWards([]);
      refetchWard();
    }
  }, [districtId]);

  const handleProvinceChange = (value: number, option: any) => {
    form?.setFieldValue("provinceName", option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    form?.setFieldValue("districtName", option.label);
  };

  const handleWardChange = (value: number, option: any) => {
    form?.setFieldValue("wardName", option.label);
  };

  function calculateShippingFee(): void {
    form
      .validateFields([
        "provinceId",
        "districtId",
        "wardCode",
        "weight",
        "length",
        "width",
        "height",
      ])
      .then((values: any) => {
        calculateFeeMutate(
          {
            url: `${GHN_API_BASE_URL}/v2/shipping-order/fee`,
            method: "post",
            values: {
              from_district_id: 1542,
              service_id: 53321,
              to_district_id: form.getFieldValue("districtId"),
              to_ward_code: form.getFieldValue("wardCode"),
              height: form.getFieldValue("height"),
              length: form.getFieldValue("length"),
              weight:
                form.getFieldValue("weight") * form.getFieldValue("weightUnit"),
              width: form.getFieldValue("width"),
              insurance_value: 500000,
            },
            config: {
              headers: {
                "Content-Type": "application/json",
                Token: GHN_TOKEN,
                ShopId: GHN_SHOP_ID,
              },
            },
            successNotification: (data: any, values) => {
              const shippingMoney = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(data?.response.data.total as number);

              return {
                message:
                  "Chi phí vận chuyển của bạn được ước tính là " +
                  shippingMoney,
                description: "Thành công",
                type: "success",
              };
            },
            errorNotification: (data, values) => {
              const shippingMoney = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(36500);

              return {
                message:
                  "Chi phí vận chuyển của bạn được ước tính là " +
                  shippingMoney,
                description: "Thành công",
                type: "success",
              };
            },
          },
          {
            onError: (error, variables, context) => {
              console.log("An error occurred! ", +error);

              const shippingMoney = 36500;
              setShippingMoney(shippingMoney);
            },
            onSuccess: (data: any, variables, context) => {
              const shippingMoney = data?.response.data.total as number;

              setShippingMoney(shippingMoney);
            },
          }
        );
      })
      .catch((errorInfo: any) => {
        return;
      });
  }

  return (
    <Fragment>
      <Col span={24}>
        <Form.Item
          name="phoneNumber"
          rules={[
            {
              validator: validatePhoneNumber,
            },
          ]}
        >
          <Input
            maxLength={LENGTH_PHONE}
            showCount
            placeholder={
              t("customers.fields.phone.placeholder") +
              " " +
              "(" +
              t("common.maxLength", { length: LENGTH_PHONE }) +
              ")"
            }
            variant="borderless"
            style={{
              width: "100%",
              borderBottom: `1px solid ${token.colorPrimary}`,
              borderRadius: 0,
            }}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          name="provinceId"
          rules={[
            {
              validator: (_, value) =>
                validateCommon(_, value, t, "provinceId"),
            },
          ]}
        >
          <Select
            showSearch
            variant="borderless"
            style={{
              width: "100%",
              borderBottom: `1px solid ${token.colorPrimary}`,
              borderRadius: 0,
            }}
            placeholder={t("customers.fields.province.placeholder")}
            loading={isLoadingProvince}
            onChange={handleProvinceChange}
            filterOption={filterOption}
            options={provinces.map((province) => ({
              label: province.ProvinceName,
              value: province.ProvinceID,
            }))}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          name="districtId"
          rules={[
            {
              validator: (_, value) =>
                validateCommon(_, value, t, "districtId"),
            },
          ]}
        >
          <Select
            showSearch
            variant="borderless"
            style={{
              width: "100%",
              borderBottom: `1px solid ${token.colorPrimary}`,
              borderRadius: 0,
            }}
            placeholder={t("customers.fields.district.placeholder")}
            loading={isLoadingDistrict}
            onChange={handleDistrictChange}
            filterOption={filterOption}
            options={
              districts &&
              districts.map((district) => ({
                label: district.DistrictName,
                value: district.DistrictID,
              }))
            }
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          name="wardCode"
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "wardCode"),
            },
          ]}
        >
          <Select
            showSearch
            variant="borderless"
            style={{
              width: "100%",
              borderBottom: `1px solid ${token.colorPrimary}`,
              borderRadius: 0,
            }}
            placeholder={t("customers.fields.ward.placeholder")}
            loading={isLoadingWard}
            onChange={handleWardChange}
            filterOption={filterOption}
            options={
              wards &&
              wards.map((ward) => ({
                label: ward.WardName,
                value: ward.WardCode,
              }))
            }
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          name="more"
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "more"),
            },
          ]}
        >
          <TextArea
            variant="borderless"
            rows={1}
            style={{
              width: "100%",
              borderBottom: `1px solid ${token.colorPrimary}`,
              borderRadius: 0,
            }}
            showCount
            maxLength={LENGTH_DESCRIPTION}
            placeholder={
              t("customers.fields.more") +
              " " +
              "(" +
              t("common.maxLength", { length: LENGTH_DESCRIPTION }) +
              ")"
            }
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Row align="middle" gutter={5}>
          <Col span={4}>
            <Form.Item
              name="weight"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "weight"),
                },
              ]}
              initialValue={900}
            >
              <InputNumber
                min={1}
                variant="borderless"
                style={{
                  width: "100%",
                  borderBottom: `1px solid ${token.colorPrimary}`,
                  borderRadius: 0,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="weightUnit"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "weightUnit"),
                },
              ]}
              initialValue="gram"
            >
              <Select
                showSearch
                variant="borderless"
                style={{
                  width: "100%",
                }}
                options={[
                  { value: "1", label: "gram" },
                  { value: "1000", label: "kg" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name="length"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "length"),
                },
              ]}
              initialValue={1}
            >
              <InputNumber
                min={1}
                variant="borderless"
                style={{
                  width: "100%",
                  borderBottom: `1px solid ${token.colorPrimary}`,
                  borderRadius: 0,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name="width"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "width"),
                },
              ]}
              initialValue={1}
            >
              <InputNumber
                min={1}
                variant="borderless"
                style={{
                  width: "100%",
                  borderBottom: `1px solid ${token.colorPrimary}`,
                  borderRadius: 0,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name="height"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "height"),
                },
              ]}
              initialValue={1}
            >
              <InputNumber
                min={1}
                variant="borderless"
                style={{
                  width: "100%",
                  borderBottom: `1px solid ${token.colorPrimary}`,
                  borderRadius: 0,
                }}
              />
            </Form.Item>
            <Form.Item name="provinceName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="districtName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="wardName" hidden>
              <Input />
            </Form.Item>
          </Col>
          <Col span={7} style={{ textAlign: "center" }}>
            <Text style={{ fontSize: "12px" }}>LxWxH (cm)</Text>
            <Button
              type="primary"
              size={"small"}
              style={{ width: "100%" }}
              onClick={calculateShippingFee}
            >
              {t("actions.calculateShipping")}
            </Button>
          </Col>
        </Row>
      </Col>
    </Fragment>
  );
};
