import { useCustom, useTranslate } from "@refinedev/core";
import { Col, Form, FormProps, Input, Row, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { LENGTH_DESCRIPTION, LENGTH_PHONE } from "../../constants/common";
import { validateCommon, validatePhoneNumber } from "../../helpers/validate";
import {
  IDistrictResponse,
  IProvinceResponse,
  IWardResponse,
} from "../../interfaces";
import { FieldLabel } from "./FieldLabel";

interface AddressFormProps {
  formProps: FormProps;
}

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const AddressForm: React.FC<AddressFormProps> = ({ formProps }) => {
  const t = useTranslate();
  const [provinces, setProvinces] = useState<IProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<IDistrictResponse[]>([]);
  const [wards, setWards] = useState<IWardResponse[]>([]);

  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);

  useEffect(() => {
    if (provinceId) {
      formProps.form?.setFieldValue("provinceId", Number(provinceId));
    }
    if (districtId) {
      formProps.form?.setFieldValue("districtId", Number(districtId));
    }
  }, [provinceId, districtId]);

  const { isLoading: isLoadingProvince, refetch: refetchProvince } = useCustom<
    IProvinceResponse[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/province`,
    method: "get",
    config: {
      headers: {
        token: token,
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
        token: token,
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
        token: token,
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
    formProps.form?.setFieldValue("provinceName", option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    formProps.form?.setFieldValue("districtName", option.label);
  };

  const handleWardChange = (value: number, option: any) => {
    formProps.form?.setFieldValue("wardName", option.label);
  };

  return (
    <Row gutter={10}>
      <Col xs={24} lg={12}>
        <Form.Item
          label={
            <FieldLabel
              fieldName={t("customers.fields.phone.label")}
              maxLength={LENGTH_PHONE}
              t={t}
            />
          }
          required
          name="phoneNumber"
          rules={[
            {
              validator: validatePhoneNumber,
            },
            {
              whitespace: true,
            },
          ]}
        >
          <Input maxLength={LENGTH_PHONE} showCount />
        </Form.Item>
        <Form.Item
          label={t("customers.fields.province.label")}
          required
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
            className="w-100"
            placeholder={t("customers.fields.province.placeholder")}
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
      </Col>
      <Col xs={24} lg={12}>
        <Form.Item
          label={t("customers.fields.district.label")}
          name="districtId"
          required
          tooltip={"Bạn cần chọn tỉnh/thành phố trước"}
          rules={[
            {
              validator: (_, value) =>
                validateCommon(_, value, t, "districtId"),
            },
          ]}
        >
          <Select
            showSearch
            className="w-100"
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
        <Form.Item
          label={t("customers.fields.ward.label")}
          required
          tooltip={"Bạn cần chọn quận/huyện trước"}
          name="wardCode"
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "wardCode"),
            },
          ]}
        >
          <Select
            showSearch
            className="w-100"
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
          label={
            <FieldLabel
              fieldName={t("customers.fields.more")}
              maxLength={LENGTH_DESCRIPTION}
              t={t}
            />
          }
          required
          name="more"
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "more"),
            },
          ]}
        >
          <TextArea rows={3} maxLength={LENGTH_DESCRIPTION} showCount />
        </Form.Item>
      </Col>
      <Form.Item name="provinceName" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="districtName" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="wardName" hidden>
        <Input />
      </Form.Item>
    </Row>
  );
};
