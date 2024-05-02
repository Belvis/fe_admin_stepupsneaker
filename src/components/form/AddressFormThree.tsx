import { useModal } from "@refinedev/antd";
import { useCustom, useCustomMutation, useTranslate } from "@refinedev/core";
import {
  Button,
  Form,
  FormInstance,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import { Fragment, useEffect, useState } from "react";
import { validateCommon } from "../../helpers/validate";
import {
  IDistrictResponse,
  IOrderResponse,
  IProvinceResponse,
  IWardResponse,
} from "../../interfaces";
import { AddressModal } from "../address/AddressModal";
import { FieldLabel } from "./FieldLabel";
import { LENGTH_DESCRIPTION } from "../../constants/common";

const { Text } = Typography;

interface AddressFormThreeProps {
  form: FormInstance;
  setShippingMoney: React.Dispatch<React.SetStateAction<number>>;
  order?: IOrderResponse;
  hideChooseAddress?: boolean;
}

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID;
const GHN_TOKEN = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const AddressFormThree: React.FC<AddressFormThreeProps> = ({
  form,
  setShippingMoney,
  order,
  hideChooseAddress = false,
}) => {
  const t = useTranslate();
  const { mutate: calculateFeeMutate, isLoading: isLoadingFee } =
    useCustomMutation<any>();

  const [provinces, setProvinces] = useState<IProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<IDistrictResponse[]>([]);
  const [wards, setWards] = useState<IWardResponse[]>([]);

  const provinceId = Form.useWatch("provinceId", form);
  const districtId = Form.useWatch("districtId", form);
  const wardCode = Form.useWatch("wardCode", form);

  useEffect(() => {
    if (provinceId) {
      form?.setFieldValue("provinceId", Number(provinceId));
    }
    if (districtId) {
      form?.setFieldValue("districtId", Number(districtId));
    }
  }, [provinceId, districtId]);

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
    if (provinceId && districtId && wardCode) {
      calculateFeeMutate(
        {
          url: `${GHN_API_BASE_URL}/v2/shipping-order/fee`,
          method: "post",
          values: {
            from_district_id: 1542,
            service_id: 53321,
            to_district_id: Number(districtId),
            to_ward_code: wardCode,
            height: 15,
            length: 15,
            weight: 500,
            width: 15,
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
          },
          onSuccess: (data: any, variables, context) => {
            const shippingMoney = data?.response.data.total as number;

            setShippingMoney(shippingMoney);
          },
        }
      );
    }
  }, [provinceId, districtId, wardCode]);

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

  const {
    show: showAddress,
    close: closeAddress,
    modalProps: { visible: addressVisible, ...restAddressModalProps },
  } = useModal();

  const setAddresses = (order: IOrderResponse) => {
    form.setFieldsValue({
      districtId: Number(order.address?.districtId),
      districtName: order.address?.districtName,
      wardCode: order.address?.wardCode,
      wardName: order.address?.wardName,
      provinceId: Number(order.address?.provinceId),
      provinceName: order.address?.provinceName,
      line: order.address?.more,
      phoneNumber: order.phoneNumber,
    });
  };

  return (
    <Fragment>
      <Form.Item
        label={
          <Space size="large">
            <Text>{"Tỉnh/Thành phố"}</Text>
            {!hideChooseAddress && (
              <Button type="default" onClick={showAddress}>
                Hoặc chọn địa chỉ của bạn tại đây
              </Button>
            )}
          </Space>
        }
        name="provinceId"
        required
        rules={[
          {
            validator: (_, value) => validateCommon(_, value, t, "provinceId"),
          },
        ]}
      >
        <Select
          className="email s-email s-wid"
          showSearch
          placeholder={"Chọn tỉnh/thành phố"}
          loading={isLoadingProvince}
          onChange={handleProvinceChange}
          filterOption={filterOption}
          options={
            provinces &&
            provinces.map((province) => ({
              label: province.ProvinceName,
              value: province.ProvinceID,
            }))
          }
        />
      </Form.Item>
      <Form.Item
        label={"Quận/huyện"}
        name="districtId"
        required
        rules={[
          {
            validator: (_, value) => validateCommon(_, value, t, "districtId"),
          },
        ]}
      >
        <Select
          className="email s-email s-wid"
          showSearch
          placeholder={"Chọn quận/huyện"}
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
      <Form.Item
        label={"Phường/xã"}
        name="wardCode"
        required
        rules={[
          {
            validator: (_, value) => validateCommon(_, value, t, "wardCode"),
          },
        ]}
      >
        <Select
          className="email s-email s-wid"
          showSearch
          placeholder={"Chọn phường/xã phố"}
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
      <Form.Item
        label={
          <FieldLabel
            fieldName={t("customers.fields.more")}
            maxLength={LENGTH_DESCRIPTION}
            t={t}
          />
        }
        name="line"
        required
        rules={[
          {
            validator: (_, value) => validateCommon(_, value, t, "line"),
          },
          {
            whitespace: true,
          },
        ]}
      >
        <Input maxLength={LENGTH_DESCRIPTION} showCount />
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
      {!hideChooseAddress && order?.customer && (
        <AddressModal
          customer={order.customer}
          setAddresses={setAddresses}
          open={restAddressModalProps.open ?? false}
          handleOk={closeAddress}
          handleCancel={closeAddress}
          order={order}
        />
      )}
    </Fragment>
  );
};
