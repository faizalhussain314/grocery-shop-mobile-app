import 'dotenv/config';

export default {
  expo: {
    name: "farm2table",
    slug: "farm2table",
    version: "1.0.0",
    extra: {
      VITE_WEB_URL: process.env.VITE_WEB_URL,
    },
  },
};
