import { RcFile } from "antd/es/upload";

/**
 * Chuyển đổi tệp thành chuỗi base64.
 * @param {RcFile} file - Tệp cần chuyển đổi.
 * @returns {Promise<string>} - Chuỗi base64 của tệp.
 */
export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

/**
 * Chuyển đổi tệp hình ảnh thành chuỗi base64.
 * @param {RcFile} img - Tệp hình ảnh cần chuyển đổi.
 * @param {Function} callback - Hàm gọi lại với kết quả là URL base64.
 */
export const getBase64Image = (
  img: RcFile,
  callback: (url: string) => void
) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};
