import { useEffect, useState } from "react";

function useCityPhoto(location) {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (!location) return;
    (async () => {
      try {
    const res = await fetch(
  `https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch` +
  `&ggscoord=${location.lat}|${location.lon}&ggsradius=10000&ggslimit=1` + 
  `&prop=pageimages&piprop=original&format=json&origin=*`
);
        const data = await res.json();
        const pages = data.query?.pages || {};
        const first = Object.values(pages)[0];
        setPhotoUrl(first?.original?.source ??  null);
      } catch (e) {
        setPhotoUrl(null);
      }
    })();
  }, [location]);

  return photoUrl;
}

export default  useCityPhoto