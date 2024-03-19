import { IQRCodeData } from "../interfaces";

/**
 * Phân tích kết quả mã QR và trả về dữ liệu từ mã QR.
 * @param {string} qrCodeResult - Kết quả mã QR cần phân tích.
 * @returns {QRCodeData} - Dữ liệu từ mã QR đã được phân tích.
 */
export function parseQRCodeResult(qrCodeResult: string): IQRCodeData {
  const data = qrCodeResult.split("|");

  return {
    cicNumber: data[0].trim(),
    idcNumber: data[1].trim(),
    fullName: data[2].trim(),
    dob: formatDate(data[3].trim()),
    gender: mapGenderToEnglish(data[4].trim()),
    address: data[5].trim(),
    issueDate: formatDate(data[6].trim()),
  };
}

/**
 * Chuyển đổi định dạng ngày tháng từ "DDMMYYYY" sang "YYYY-MM-DD".
 * @param {string} dateString - Chuỗi ngày tháng cần chuyển đổi định dạng.
 * @returns {string} - Chuỗi ngày tháng đã được chuyển đổi định dạng.
 */
function formatDate(dateString: string): string {
  const parts = dateString.match(/(\d{2})(\d{2})(\d{4})/);
  if (parts) {
    const day = parts[1];
    const month = parts[2];
    const year = parts[3];
    return `${year}-${month}-${day}`;
  }
  return "";
}

/**
 * Ánh xạ giới tính sang tiếng Anh.
 * @param {string} gender - Giới tính cần ánh xạ.
 * @returns {string} - Giới tính đã được ánh xạ.
 */
function mapGenderToEnglish(gender: string): string {
  const genderMap: Record<string, string> = {
    Nam: "Male",
    Nữ: "Female",
    Khác: "Other",
  };

  return genderMap[gender] || gender;
}
