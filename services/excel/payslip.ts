import axios from "axios";
import moment from "moment";
import { parseCookies } from "nookies";

export async function DownloadExcelPayslipService(input: {
  recordDate: string;
  companySocialSecurity: number;
  consultingFee: number;
}): Promise<void> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/excel/payslip`,
      data: { ...input },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "blob",
    }).then((response) => {
      const month = moment(input.recordDate).format("MMMM - YYYY");

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip ${month}.xlsx`); // set the filename for download
      document.body.appendChild(link);
      link.click();
    });
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
