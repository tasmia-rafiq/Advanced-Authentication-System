import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { verifyEmail } from "../api/auth.api";

const Verify = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const hasVerified = useRef(false);

  const params = useParams();
  const token = params.token;

  async function verifyUser() {
    try {
      const data = await verifyEmail(params.token);
      // const { data } = await axios.post(
      //   `http://localhost:5000/api/v1/auth/verify/${token}`,
      // );
      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    verifyUser();
  }, []);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-50 m-auto mt-12">
          {successMessage && (
            <p className="text-green-500 text-2xl">{successMessage}</p>
          )}

          {errorMessage && (
            <p className="text-red-500 text-2xl">{errorMessage}</p>
          )}
        </div>
      )}
    </>
  );
};

export default Verify;
