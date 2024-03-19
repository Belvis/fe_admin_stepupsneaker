import { useSimpleList } from "@refinedev/antd";
import { HttpError, useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  Avatar,
  Checkbox,
  Col,
  ColorPicker,
  FormProps,
  Input,
  Space,
  Typography,
} from "antd";
import { debounce } from "lodash";
import { Fragment, useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import {
  IProductDetailFilterVariables,
  IProductDetailResponse,
} from "../../interfaces";

const { Title, Text } = Typography;

type PromotionRelationProps = {
  formProps: FormProps;
};

const PromotionRelation: React.FC<PromotionRelationProps> = ({ formProps }) => {
  const t = useTranslate();
  const { mode } = useContext(ColorModeContext);
  const { listProps, setFilters } = useSimpleList<
    IProductDetailResponse,
    HttpError,
    IProductDetailFilterVariables
  >({
    resource: `product-details`,
    pagination: {
      pageSize: 5,
    },
  });

  const [selectedIds, setselectedIds] = useState<string[]>([]);

  useEffect(() => {
    formProps.form?.setFieldValue("productDetails", selectedIds);
  }, [selectedIds]);

  const handleRowClick = (id: string) => {
    if (selectedIds.includes(id)) {
      setselectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setselectedIds([...selectedIds, id]);
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
        <Title level={5}>{t("promotions.steps.message")}</Title>
      </Col>
      <Col span={24}>
        <Input.Search
          placeholder={t("promotions.filters.search.placeholder")}
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
            const {
              id,
              product: { name },
              size,
              color,
              image,
              quantity,
            } = item;
            const isChecked = selectedIds.includes(id);

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
                  avatar={<Avatar size={52} src={image} />}
                  title={
                    <Space className="d-flex align-items-center">
                      <span>{name}</span>
                      <ColorPicker
                        defaultValue={color.code}
                        showText
                        disabled
                      />
                      <span>
                        {t("productDetails.fields.quantity")}: {quantity}
                      </span>
                    </Space>
                  }
                  description={
                    <Fragment>
                      <span>
                        {t("productDetails.fields.size")}: {size.name}
                      </span>
                      <br />
                      <span>
                        {t("productDetails.fields.color")}: {color.name}
                      </span>
                    </Fragment>
                  }
                />
              </AntdList.Item>
            );
          }}
        />
      </Col>
    </Fragment>
  );
};

export default PromotionRelation;
