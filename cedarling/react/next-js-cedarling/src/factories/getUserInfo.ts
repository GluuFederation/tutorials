import axios from "axios";

export const getUserInfo = async (accessToken: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request: any = {
    url: `${process.env.NEXT_PUBLIC_OP_SERVER}/jans-auth/restv1/userinfo`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await axios(request).catch((error) => {
    console.log(error);
  });

  console.log(response);
  return response;
};
