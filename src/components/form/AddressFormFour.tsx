import {
  useCustom,
  useCustomMutation,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  App,
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
import { POSContext } from "../../contexts/point-of-sales";

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

  const { mutate: mutateUpdate, isLoading } = useUpdate();
  const { message } = App.useApp();

  const [provinces, setProvinces] = useState<IProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<IDistrictResponse[]>([]);
  const [wards, setWards] = useState<IWardResponse[]>([]);
  const provinceId = Form.useWatch("provinceId", form);
  const districtId = Form.useWatch("districtId", form);

  const { activeKey, refetchOrder } = useContext(POSContext);
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

  function editOrderShippingMoney(value: string): void {
    const shippingMoney = Number(value);

    if (isNaN(shippingMoney)) {
      message.error(t("orders.notification.shippingMoney.edit.invalid"));
      return;
    }
    mutateUpdate(
      {
        resource: "orders/apply-shipping",
        values: {
          addressShipping: {
            phoneNumber: form.getFieldValue("phoneNumber"),
            districtId: form.getFieldValue("districtId"),
            districtName: form.getFieldValue("districtName"),
            provinceId: form.getFieldValue("provinceId"),
            provinceName: form.getFieldValue("provinceName"),
            wardCode: form.getFieldValue("wardCode"),
            wardName: form.getFieldValue("wardName"),
          },
          shippingMoney: shippingMoney,
        },
        id: activeKey,
        successNotification: () => {
          return false;
        },
        errorNotification: () => {
          return false;
        },
      },
      {
        onError: (error, variables, context) => {
          message.error(t("orders.notification.shippingMoney.edit.error"));
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          message.success(t("orders.notification.shippingMoney.edit.success"));
        },
      }
    );
  }

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
            successNotification: false,
            errorNotification: false,
          },
          {
            onError: (error, variables, context) => {
              console.log("An error occurred! ", +error);

              const shippingMoney = 36500;
              setShippingMoney(shippingMoney);
              editOrderShippingMoney(shippingMoney + "");
            },
            onSuccess: (data: any, variables, context) => {
              const shippingMoney = data?.response.data.total as number;

              setShippingMoney(shippingMoney);
              editOrderShippingMoney(shippingMoney + "");
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
              initialValue="1"
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
