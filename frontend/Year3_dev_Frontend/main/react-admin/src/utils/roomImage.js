export const DEFAULT_ROOM_IMAGE = "/room2.png";

const hasHttpProtocol = (value) => /^https?:\/\//i.test(value);

export const getBackendOrigin = (backendHost) => {
  if (!backendHost || typeof backendHost !== "string") {
    return "";
  }

  return hasHttpProtocol(backendHost) ? backendHost : `http://${backendHost}`;
};

export const sanitizeRoomImage = (imageValue) => {
  if (!imageValue || typeof imageValue !== "string") {
    return null;
  }

  if (imageValue === "undefined" || imageValue === "null") {
    return null;
  }

  if (imageValue.startsWith("data:") && !imageValue.startsWith("data:image/")) {
    return null;
  }

  return imageValue;
};

export const resolveRoomImageUrl = (imageUrl, backendHost) => {
  const sanitizedImageUrl = sanitizeRoomImage(imageUrl);

  if (!sanitizedImageUrl) {
    return DEFAULT_ROOM_IMAGE;
  }

  if (
    sanitizedImageUrl.startsWith("data:image/") ||
    sanitizedImageUrl.startsWith("blob:") ||
    hasHttpProtocol(sanitizedImageUrl)
  ) {
    return sanitizedImageUrl;
  }

  if (sanitizedImageUrl === DEFAULT_ROOM_IMAGE) {
    return sanitizedImageUrl;
  }

  const backendOrigin = getBackendOrigin(backendHost);
  if (!backendOrigin) {
    return sanitizedImageUrl;
  }

  return sanitizedImageUrl.startsWith("/")
    ? `${backendOrigin}${sanitizedImageUrl}`
    : `${backendOrigin}/${sanitizedImageUrl}`;
};

export const getStoredRoomImage = () => {
  const storedImage = sanitizeRoomImage(localStorage.getItem("uploadedImage"));

  if (!storedImage) {
    localStorage.removeItem("uploadedImage");
    return DEFAULT_ROOM_IMAGE;
  }

  return storedImage;
};

export const saveRoomImage = (imageValue) => {
  const sanitizedImage = sanitizeRoomImage(imageValue);

  if (!sanitizedImage) {
    localStorage.removeItem("uploadedImage");
    return DEFAULT_ROOM_IMAGE;
  }

  localStorage.setItem("uploadedImage", sanitizedImage);
  return sanitizedImage;
};

export const fetchRoomImageAsDataUrl = async (imageUrl, backendHost) => {
  const resolvedImageUrl = resolveRoomImageUrl(imageUrl, backendHost);

  if (
    resolvedImageUrl === DEFAULT_ROOM_IMAGE ||
    resolvedImageUrl.startsWith("data:image/") ||
    resolvedImageUrl.startsWith("blob:")
  ) {
    return resolvedImageUrl;
  }

  const response = await fetch(resolvedImageUrl);
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`Failed to fetch room image. Status: ${response.status}`);
  }

  if (!contentType.startsWith("image/")) {
    throw new Error(`Room image response is not an image. Content-Type: ${contentType || "unknown"}`);
  }

  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = sanitizeRoomImage(reader.result);

      if (typeof result === "string" && result.startsWith("data:image/")) {
        resolve(result);
        return;
      }

      reject(new Error("Failed to decode room image as a data URL."));
    };

    reader.onerror = () => reject(reader.error || new Error("Failed to read room image."));
    reader.readAsDataURL(blob);
  });
};
