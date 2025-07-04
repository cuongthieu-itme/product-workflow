export const ACCESS_TOKEN_KEY = "accessToken";

const getAccessTokenFromStorage = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    console.log("Failed to get login token from storage");
  }
};

const setAccessTokenToStorage = (locale: string) => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, locale);
  } catch (e) {
    console.log("Failed to save login token to the storage");
  }
};

const removeAccessTokenFromStorage = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    console.log("Failed to remove login token from the storage");
  }
};

export {
  getAccessTokenFromStorage,
  setAccessTokenToStorage,
  removeAccessTokenFromStorage,
};
