import { useSimpleList } from "@refinedev/antd";
import {
  List as AntdList,
  Checkbox,
  Avatar,
  Col,
  Input,
  Typography,
  FormProps,
} from "antd";
import { ICustomerFilterVariables, ICustomerResponse } from "../../interfaces";
import { HttpError, useTranslate } from "@refinedev/core";
import { debounce } from "lodash";
import { Fragment, useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { formatTimestamp } from "../../helpers/timestamp";

const { Title } = Typography;

type VoucherRelationProps = {
  formProps: FormProps;
};

const VoucherRelation: React.FC<VoucherRelationProps> = ({ formProps }) => {
  const t = useTranslate();
  const { mode } = useContext(ColorModeContext);
  const { listProps, setFilters } = useSimpleList<
    ICustomerResponse,
    HttpError,
    ICustomerFilterVariables
  >({
    resource: "customers",
    pagination: {
      pageSize: 5,
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

  const handleSearch = debounce((value) => {
    setFilters([
      {
        field: "q",
        operator: "eq",
        value: value,
      },
    ]);
  }, 500);

  return (
    <Fragment>
      <Col span={24}>
        <Title level={5}>{t("vouchers.steps.message")}</Title>
      </Col>
      <Col span={24}>
        <Input.Search
          placeholder={t("vouchers.filters.search.placeholder")}
          onChange={(e) => handleSearch(e.target.value)}
        />
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
                  title={`${fullName} - ${gender}`}
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
