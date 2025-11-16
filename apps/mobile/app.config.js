import 'dotenv/config';
import appJson from './app.json';

export default () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    devUrl: process.env.BACKEND_URL,
    prodUrl: process.env.PROD_URL,
  },
});
