import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function ErrorPage() {
  const { state } = useLocation();
  const reason = state?.reason || "Неизвестная ошибка";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoHome = async () => {
    try {
      const res = await fetch("http://ip-api.com/json");
      const data = await res.json();
      if (data.city) {
        localStorage.setItem("lastCity", data.city);
        navigate(`/?city=${encodeURIComponent(data.city)}`);
        return;
      }
    } catch {""}

    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      navigate(`/?city=${encodeURIComponent(lastCity)}`);
      return;
    }

    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Ошибка</h1>
      <p className="mb-6 text-gray-700 max-w-md">{reason}</p>
      <button
  onClick={handleGoHome}
  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
>
  Вернуться на главную
</button>
    </div>
  );
}

export default ErrorPage;
