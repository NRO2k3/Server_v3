import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "home": "Home",
          "configuration":"Configuration",
          "sign out": "Sign out!",
          "theme": "Change theme",
          "settings":"Settings",
          "profile": "Profile",
          "welcome": "Welcome, {{username}}",
          "hanoiaqi": " Hanoi AQI: Hanoi Real-time Air Quality Index (AQI)",
        }
      },
      vi: {
        translation: {
          "home": "Trang Chủ",
          "configuration":"Điều Chỉnh",
          "sign out": "Đăng Xuất",
          "theme": "Đổi Phông",
          "settings":"Cài Đặt",
          "profile": "Hồ sơ",
          "welcome": "Xin Chào, {{username}}",
          "hanoiaqi": "Chỉ số AQI Hà Nội: Chỉ số chất lượng không khí theo thời gian thực tại Hà Nội"
        }
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
