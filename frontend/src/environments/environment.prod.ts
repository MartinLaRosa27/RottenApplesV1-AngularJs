export const environment = {
  production: true,
  baseUrl: window.location.href.substr(0, window.location.href.indexOf(window.location.hash)) + 'api/',
};
