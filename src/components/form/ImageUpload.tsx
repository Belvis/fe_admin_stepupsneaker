import { getValueFromEvent } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
  App,
  Avatar,
  Form,
  FormProps,
  Space,
  Spin,
  Typography,
  Upload,
} from "antd";
import {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload/interface";
import React, { useState } from "react";
import { getBase64Image } from "../../helpers/image";
import { styles } from "./style";

const { Text } = Typography;

interface IImageUploadProps {
  formProps: FormProps;
}

const ImageUpload: React.FC<IImageUploadProps> = ({ formProps }) => {
  const t = useTranslate();
  const { message } = App.useApp();
  const [loadingImage, setLoadingImage] = useState(false);
  const imageUrl = Form.useWatch("image", formProps.form);

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64Image(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldsValue({ image: url });
      });
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error(t("image.error.invalid"));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(t("image.error.exceed"));
    }
    return isJpgOrPng && isLt2M;
  };

  return (
    <Spin spinning={loadingImage}>
      <Form.Item
        name="image"
        valuePropName="file"
        getValueFromEvent={getValueFromEvent}
        noStyle
      >
        <Upload.Dragger
          name="file"
          beforeUpload={beforeUpload}
          onChange={handleChange}
          showUploadList={false}
          customRequest={({ onSuccess, onError, file }) => {
            if (onSuccess) {
              try {
                onSuccess("ok");
              } catch (error) {}
            }
          }}
          maxCount={1}
          style={styles.imageUpload}
        >
          <Space direction="vertical" size={2}>
            {imageUrl ? (
              <Avatar style={styles.avatar} src={imageUrl} alt="User avatar" />
            ) : (
              <Avatar
                style={styles.avatar}
                src="/images/user-default-img.png"
                alt="Default avatar"
              />
            )}
            <Text style={styles.imageDescription}>
              {t("image.description")}
            </Text>
            <Text style={styles.imageValidation}>
              {t("image.validation", { size: 1080 })}
            </Text>
          </Space>
        </Upload.Dragger>
      </Form.Item>
    </Spin>
  );
};

export default ImageUpload;
