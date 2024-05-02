import { useSimpleList } from "@refinedev/antd";
import { CrudFilters, HttpError, useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  Avatar,
  Card,
  Checkbox,
  Col,
  FormProps,
  Typography,
} from "antd";
import { Fragment, useContext, useEffect, useState } from "react";
import { getCustomerGenderOptions } from "../../constants/gender";
import { ColorModeContext } from "../../contexts/color-mode";
import { formatTimestamp } from "../../helpers/timestamp";
import { ICustomerFilterVariables, ICustomerResponse } from "../../interfaces";
import CommonSearchForm from "../form/CommonSearchForm";

const { Title } = Typography;

type VoucherRelationProps = {
  formProps: FormProps;
};

const VoucherRelation: React.FC<VoucherRelationProps> = ({ formProps }) => {
  const t = useTranslate();
  const { mode } = useContext(ColorModeContext);
  const { listProps, searchFormProps } = useSimpleList<
    ICustomerResponse,
    HttpError,
    ICustomerFilterVariables
  >({
    resource: "customers",
    pagination: {
      pageSize: 5,
    },
    syncWithLocation: false,
    onSearch: ({ q, gender, dateRange }) => {
      const customerFilters: CrudFilters = [];

      customerFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q.trim() : undefined,
      });

      customerFilters.push({
        field: "gender",
        operator: "eq",
        value: gender ? gender : undefined,
      });

      customerFilters.push({
        field: "startDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[0].startOf("day").valueOf()
            : undefined,
      });
      customerFilters.push({
        field: "endDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[1].endOf("day").valueOf()
            : undefined,
      });

      return customerFilters;
    },
  });
  const [selectedCustomerIds, setselectedCustomerIds] = useState<string[]>([]);

  useEffect(() => {
    formProps.form?.setFieldValue("customers", selectedCustomerIds);
  }, [selectedCustomerIds]);

  const handleRowClick = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setselectedCustomerIds(selectedCustomerIds.filter((item) => item !== id));
    } else {
      setselectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  return (
    <Fragment>
      <Col span={24}>
        <Title level={5}>{t("vouchers.steps.message")}</Title>
      </Col>
      <Col span={24}>
        <Card>
          <CommonSearchForm
            title={t(`customers.filters.title`)}
            formProps={searchFormProps}
            fields={[
              {
                label: "",
                name: "q",
                type: "input",
                placeholder: t(`customers.filters.search.placeholder`),
                width: "300px",
              },
              {
                label: "",
                name: "gender",
                placeholder: t(`customers.filters.gender.placeholder`),
                type: "select",
                options: getCustomerGenderOptions(t),
                width: "100%",
              },
              {
                label: "",
                name: "dateRange",
                type: "range",
                width: "100%",
              },
            ]}
          />
        </Card>
      </Col>
      <Col span={24}>
        <AntdList
          {...listProps}
          itemLayout="horizontal"
          bordered
          style={{ padding: "1rem" }}
          renderItem={(item) => {
            const { id, fullName, gender, email, dateOfBirth, image } = item;
            const formattedDateOfBirth =
              formatTimestamp(dateOfBirth).dateFormat;
            const isChecked = selectedCustomerIds.includes(id);

            return (
              <AntdList.Item
                key={id}
                actions={[<Checkbox checked={isChecked} onChange={() => {}} />]}
                onClick={() => handleRowClick(id)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    mode === "light" && isChecked ? "#fff2e8" : undefined,
                }}
              >
                <AntdList.Item.Meta
                  avatar={<Avatar src={image} />}
                  title={`${fullName} - ${t(
                    `customers.fields.gender.options.${gender}`
                  )}`}
                  description={`${email} | ${formattedDateOfBirth}`}
                />
              </AntdList.Item>
            );
          }}
        />
      </Col>
    </Fragment>
  );
};

export default VoucherRelation;
