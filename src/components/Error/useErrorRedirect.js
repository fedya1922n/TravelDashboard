import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function useErrorRedirect(error) {
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      navigate("/error", { replace: true, state: { reason: error } });
    }
  }, [error, navigate]);
}

export default useErrorRedirect;
